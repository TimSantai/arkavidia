"""Worker antrean Postgres (`FOR UPDATE SKIP LOCKED`). Jalankan: `python -m app.worker`.

Handler idempoten: menjalankan job yang sama dua kali tidak membuat data ganda.
"""

from __future__ import annotations

import asyncio
import signal
import traceback
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

import structlog

from app import retrieval
from app.ai import conformal, pipeline
from app.ai.schemas import ChatMessage, Member
from app.config import Settings, get_settings
from app.db import Database
from app.gateway.base import TeamContext
from app.gateway.factory import build_gateway
from app.gateway.router import Gateway
from app.logging import configure_logging
from app.services.common import audit, emit
from app.services.mastery import apply_evidence

log = structlog.get_logger(__name__)
BACKOFF_SECONDS = (1, 4, 16)
STALE_LOCK = timedelta(minutes=5)
CONTEXT_BEFORE = 5
MAX_BATCH = 50


class Worker:
    def __init__(self, database: Database, gw: Gateway, settings: Settings) -> None:
        self.db, self.gw, self.cfg = database, gw, settings
        self.handlers: dict[str, Callable[[dict[str, Any]], Awaitable[None]]] = {
            "extract_batch": self.extract_batch,
            "item_confirmed": self.item_confirmed,
            "grade": self.grade,
        }

    # ───────── loop ─────────
    async def claim(self) -> dict[str, Any] | None:
        async with self.db.service_tx() as conn:
            await conn.execute(
                """update jobs set status = 'queued', locked_by = null, locked_at = null,
                     updated_at = now() where status = 'running' and locked_at < $1""",
                datetime.now(UTC) - STALE_LOCK)
            row = await conn.fetchrow(
                """update jobs set status = 'running', locked_by = $1, locked_at = now(),
                     attempts = attempts + 1, updated_at = now()
                   where id = (select id from jobs where status = 'queued' and run_after <= now()
                               order by run_after, created_at for update skip locked limit 1)
                   returning *""", self.cfg.worker_id)
            return dict(row) if row else None

    async def run_one(self) -> bool:
        job = await self.claim()
        if job is None:
            return False
        handler = self.handlers.get(job["kind"])
        try:
            if handler is None:
                raise RuntimeError(f"handler tidak dikenal: {job['kind']}")
            await handler(job["payload"])
        except Exception as exc:
            dead = job["attempts"] >= job["max_attempts"]
            delay = BACKOFF_SECONDS[min(job["attempts"] - 1, len(BACKOFF_SECONDS) - 1)]
            log.warning("job.failed", job_id=str(job["id"]), kind=job["kind"], dead=dead,
                        error=str(exc))
            async with self.db.service_tx() as conn:
                await conn.execute(
                    """update jobs set status = $2, last_error = $3, locked_by = null,
                         locked_at = null, run_after = now() + make_interval(secs => $4),
                         updated_at = now() where id = $1""",
                    job["id"], "dead" if dead else "queued",
                    "".join(traceback.format_exception_only(exc))[:2000], delay)
                if dead and job["kind"] == "grade":
                    await conn.execute("update check_attempts set status = 'failed' "
                                       "where id = $1", UUID(job["payload"]["attempt_id"]))
            return True
        async with self.db.service_tx() as conn:
            await conn.execute("update jobs set status = 'done', locked_by = null, "
                               "updated_at = now() where id = $1", job["id"])
        return True

    async def drain(self, max_jobs: int = 1000) -> int:
        """Proses semua job yang siap (dipakai tes dan skrip seed)."""
        n = 0
        while n < max_jobs and await self.run_one():
            n += 1
        return n

    async def forever(self, stop: asyncio.Event) -> None:
        while not stop.is_set():
            if not await self.run_one():
                try:
                    await asyncio.wait_for(stop.wait(), timeout=self.cfg.worker_poll_seconds)
                except TimeoutError:
                    pass

    # ───────── handler: ekstraksi ─────────
    async def extract_batch(self, payload: dict[str, Any]) -> None:
        team_id = UUID(payload["team_id"])
        async with self.db.service_tx() as conn:
            tier = await conn.fetchval("select tier::text from teams where id = $1", team_id)
            cur = await conn.fetchrow("select * from extraction_cursors where team_id = $1 "
                                      "for update", team_id)
            new = await conn.fetch(
                """select m.id, m.author_id, m.body, m.created_at, u.display_name
                   from messages m left join users u on u.id = m.author_id
                   where m.team_id = $1 and m.room = 'team'
                     and ($2::timestamptz is null or (m.created_at, m.id) > ($2, $3::uuid))
                   order by m.created_at, m.id limit $4""",
                team_id, cur["last_created_at"] if cur else None,
                cur["last_message_id"] if cur else None, MAX_BATCH)
            if not new:
                return
            before = await conn.fetch(
                """select m.id, m.author_id, m.body, m.created_at, u.display_name
                   from messages m left join users u on u.id = m.author_id
                   where m.team_id = $1 and m.room = 'team' and (m.created_at, m.id) < ($2, $3)
                   order by m.created_at desc, m.id desc limit $4""",
                team_id, new[0]["created_at"], new[0]["id"], CONTEXT_BEFORE)
            rows = [*reversed(before), *new]
            msgs = [ChatMessage(id=r["id"], author_id=r["author_id"],
                                author_name=r["display_name"] or "anggota", body=r["body"],
                                created_at=r["created_at"]) for r in rows]
            members = [Member(id=r["id"], name=r["display_name"]) for r in await conn.fetch(
                """select u.id, u.display_name from memberships m join users u on u.id = m.user_id
                   where m.team_id = $1""", team_id)]
            existing = await conn.fetch(
                """select id, content ->> 'title' as title from memory_items where team_id = $1
                   and scope = 'team' and status in ('proposed', 'confirmed')""", team_id)
        team = TeamContext(team_id, tier)
        result = await pipeline.extract(self.gw, team, msgs, members,
                                        [r["title"] for r in existing if r["title"]])
        by_id = {m.id: m for m in msgs}
        valid = [g for g in result.grounded if g.valid]
        texts = [retrieval.item_text(g.candidate.content, g.candidate.type.value) for g in valid]
        vectors = await self.gw.embed(texts)

        async with self.db.service_tx() as conn:
            neighbors = [(r["item_id"], _parse_vec(r["vector"])) for r in await conn.fetch(
                """select e.item_id, e.vector::text as vector from embeddings e
                   join memory_items i on i.id = e.item_id
                   where i.team_id = $1 and i.scope = 'team' and i.status in ('proposed','confirmed')""",
                team_id)]
            for g, vec in zip(valid, vectors, strict=True):
                cand = g.candidate
                action, target, sim = pipeline.dedupe(vec, neighbors)
                if action == "duplicate":
                    log.info("extract.duplicate", target=str(target), sim=round(sim, 3))
                    continue
                content = dict(cand.content)
                if action == "update" and target is not None:
                    content["supersedes_candidate"] = str(target)
                src_ids = sorted({e.message_id for e in cand.evidence}, key=str)
                anchor = next((e.message_id for e in cand.evidence if e.field == "chosen_option"),
                              src_ids[0])
                owner = content.get("pic_user_id") or by_id[anchor].author_id
                item_id = await conn.fetchval(
                    """insert into memory_items (team_id, type, content, owner_id, scope, status,
                         valid_from, source_message_ids, prompt_version, model_version)
                       values ($1,$2,$3,$4,'team','proposed',$5,$6,$7,$8) returning id""",
                    team_id, cand.type.value, content, owner, by_id[anchor].created_at, src_ids,
                    result.prompt_version, result.model)
                for e in cand.evidence:
                    await conn.execute(
                        "insert into memory_evidence (item_id, field, message_id, quote) "
                        "values ($1,$2,$3,$4)", item_id, e.field, e.message_id, e.quote)
                await conn.execute(
                    "insert into embeddings (item_id, model, vector) values ($1,$2,$3::vector)",
                    item_id, self.gw.embedder.model, retrieval.vector_literal(vec))
                neighbors.append((item_id, vec))
                await emit(conn, team_id, "memory_proposed", item_id,
                           {"dedupe": action, "similarity": round(sim, 4)})
            last = new[-1]
            await conn.execute(
                """insert into extraction_cursors (team_id, last_created_at, last_message_id)
                   values ($1,$2,$3) on conflict (team_id) do update set
                   last_created_at = excluded.last_created_at, last_message_id = excluded.last_message_id""",
                team_id, last["created_at"], last["id"])
            await audit(conn, team_id=team_id, actor=None, agent="worker", action="extract.batch",
                        object_type="team", object_id=team_id, allowed=True,
                        reason=f"messages={len(new)} valid={len(valid)} "
                               f"rejected={len(result.grounded) - len(valid)}")

    # ───────── handler: item dikonfirmasi ─────────
    async def item_confirmed(self, payload: dict[str, Any]) -> None:
        item_id = UUID(payload["item_id"])
        async with self.db.service_tx() as conn:
            item = await conn.fetchrow("select * from memory_items where id = $1", item_id)
            if item is None or item["status"] != "confirmed":
                return
            team_id = item["team_id"]
            tier = await conn.fetchval("select tier::text from teams where id = $1", team_id)
            kcs = await conn.fetch("select id, name from knowledge_components where team_id = $1 "
                                   "and merged_into is null", team_id)
            linked = await conn.fetch("select dst_kc_id from memory_edges where src_item_id = $1 "
                                      "and kind = 'about_kc'", item_id)
            quotes = [r["quote"] for r in await conn.fetch(
                "select quote from memory_evidence where item_id = $1", item_id)]
            has_dep = await conn.fetchval(
                "select exists(select 1 from memory_edges where src_item_id = $1 and kind = 'depends_on')",
                item_id)
            authors = [r["author_id"] for r in await conn.fetch(
                "select distinct author_id from messages where id = any($1::uuid[]) "
                "and author_id is not null", item["source_message_ids"])]
            has_emb = await conn.fetchval("select exists(select 1 from embeddings where item_id = $1)",
                                          item_id)
        team = TeamContext(team_id, tier)
        text = retrieval.item_text(item["content"], item["type"])

        kc_ids: list[UUID] = [r["dst_kc_id"] for r in linked]
        if not kc_ids:
            hint = list(item["content"].get("kc_names") or [])
            tagged = await pipeline.tag_kc(self.gw, team, text, [k["name"] for k in kcs] + hint)
            names = [m.kc_name for m in tagged.kcs][:2] or ["Umum"]
            async with self.db.service_tx() as conn:
                for name in names:
                    kid = await conn.fetchval(
                        """insert into knowledge_components (team_id, name, created_by)
                           values ($1, $2, 'ai') on conflict (team_id, name)
                           do update set name = excluded.name returning id""", team_id, name)
                    kc_ids.append(kid)
                    await conn.execute(
                        """insert into memory_edges (team_id, kind, src_item_id, dst_kc_id)
                           values ($1, 'about_kc', $2, $3) on conflict do nothing""",
                        team_id, item_id, kid)
        vec = None if has_emb else (await self.gw.embed([text]))[0]

        drafts: list[tuple[UUID, pipeline.QuestionDraft]] = []
        if item["type"] == "decision":
            async with self.db.service_tx() as conn:
                existing_q = await conn.fetchval("select count(*) from questions where item_id = $1",
                                                 item_id)
            if existing_q == 0:
                kc_names = {r["id"]: r["name"] for r in kcs}
                for kid in kc_ids[:1]:  # satu KC utama per item agar beban soal tetap kecil
                    name = kc_names.get(kid) or await self._kc_name(kid)
                    for d in await pipeline.generate_questions(
                            self.gw, team, item["content"], name, quotes, has_dep):
                        drafts.append((kid, d))

        async with self.db.service_tx() as conn:
            if vec is not None:
                await conn.execute(
                    """insert into embeddings (item_id, model, vector) values ($1,$2,$3::vector)
                       on conflict (item_id) do nothing""",
                    item_id, self.gw.embedder.model, retrieval.vector_literal(vec))
            for kid in kc_ids:
                for uid in {item["owner_id"], *authors} - {None}:
                    await conn.execute(
                        "insert into kc_contributors (kc_id, user_id) values ($1,$2) "
                        "on conflict do nothing", kid, uid)
            for kid, d in drafts:
                await conn.execute(
                    """insert into questions (team_id, kc_id, item_id, stem, bloom_level,
                         reference_answer, rubric, irt_a, irt_b, answerable, prompt_version)
                       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)""",
                    team_id, kid, item_id, d.question.stem, d.question.bloom_level,
                    d.question.reference_answer,
                    [c.model_dump() for c in d.question.rubric], d.irt_a, d.irt_b, d.answerable,
                    d.prompt_version)
            # Fan-out delta digest: relevansi lebih tinggi bagi kontributor KC yang sama.
            event_id = UUID(payload["event_id"]) if payload.get("event_id") else None
            if event_id is not None:
                contributors = {r["user_id"] for r in await conn.fetch(
                    "select user_id from kc_contributors where kc_id = any($1::uuid[])", kc_ids)}
                for r in await conn.fetch("select user_id from memberships where team_id = $1",
                                          team_id):
                    if r["user_id"] == item["confirmed_by"]:
                        continue
                    rel = 1.0 if r["user_id"] in contributors else 0.5
                    await conn.execute(
                        """insert into agent_inbox (user_id, team_id, event_id, relevance)
                           values ($1,$2,$3,$4) on conflict (user_id, event_id) do nothing""",
                        r["user_id"], team_id, event_id, rel)
                await conn.execute("update outbox_events set processed_at = now() where id = $1",
                                   event_id)

    async def _kc_name(self, kc_id: UUID) -> str:
        async with self.db.service_tx() as conn:
            return await conn.fetchval("select name from knowledge_components where id = $1", kc_id)

    # ───────── handler: grading ─────────
    async def grade(self, payload: dict[str, Any]) -> None:
        attempt_id = UUID(payload["attempt_id"])
        async with self.db.service_tx() as conn:
            a = await conn.fetchrow(
                """select a.*, q.stem, q.rubric, q.reference_answer, q.kc_id, i.owner_id as item_owner,
                          t.tier::text as tier
                   from check_attempts a join questions q on q.id = a.question_id
                   join memory_items i on i.id = q.item_id join teams t on t.id = a.team_id
                   where a.id = $1""", attempt_id)
            if a is None or a["status"] != "grading":
                return
            k = self.cfg.grader_k_pro if a["tier"] == "pro" else self.cfg.grader_k_free
            cal = await conn.fetch(
                """select uncertainty, ai_grade, human_grade from check_attempts
                   where team_id = $1 and human_grade is not null and ai_grade is not null
                     and uncertainty is not null and coalesce(array_length(sample_grades, 1), 0) = $2""",
                a["team_id"], k)
        if len(cal) >= self.cfg.conformal_min_n:
            points = [conformal.CalibrationPoint(r["uncertainty"], r["ai_grade"] != r["human_grade"])
                      for r in cal]
            lam = conformal.conformal_lambda(points, self.cfg.conformal_alpha,
                                             conformal.possible_lambdas(k))
            source = "conformal"
        else:
            lam, source = conformal.heuristic_lambda(k), "heuristic"
        team = TeamContext(a["team_id"], a["tier"], a["user_id"])
        res = await pipeline.grade(self.gw, team, stem=a["stem"], rubric=a["rubric"],
                                   reference_answer=a["reference_answer"], answer=a["answer"],
                                   k=k, lam=lam)
        async with self.db.service_tx() as conn:
            await conn.execute(
                """update check_attempts set ai_grade = $2::smallint, sample_grades = $3::smallint[],
                     uncertainty = $4, abstained = $5::boolean, lambda_used = $6, lambda_source = $7,
                     feedback = $8, final_grade = case when $5::boolean then null else $2::smallint end,
                     graded_by = case when $5 then null else 'ai'::grader_kind end,
                     status = case when $5 then 'abstained'::attempt_status
                                   else 'graded'::attempt_status end,
                     graded_at = case when $5 then null else now() end
                   where id = $1 and status = 'grading'""",
                attempt_id, res.ai_grade, res.sample_grades, res.uncertainty, res.abstained,
                lam, source, res.feedback)
            if res.abstained:
                explainer = a["item_owner"] if a["item_owner"] not in (None, a["user_id"]) else None
                if explainer is None:
                    explainer = await conn.fetchval(
                        """select m.user_id from mastery m join memberships ms
                             on ms.user_id = m.user_id and ms.team_id = $3
                           where m.kc_id = $1 and m.user_id <> $2 order by m.p_mastery desc limit 1""",
                        a["kc_id"], a["user_id"], a["team_id"])
                if explainer is None:
                    explainer = await conn.fetchval(
                        "select user_id from memberships where team_id = $1 and user_id <> $2 "
                        "order by role desc, joined_at limit 1", a["team_id"], a["user_id"])
                if explainer is not None:
                    await conn.execute(
                        """insert into peer_requests (team_id, attempt_id, explainer_id, learner_id)
                           values ($1,$2,$3,$4) on conflict (attempt_id) do nothing""",
                        a["team_id"], attempt_id, explainer, a["user_id"])
            elif not a["ai_assisted"]:
                await apply_evidence(conn, a["user_id"], a["kc_id"], res.ai_grade == 2)


def _parse_vec(text: str) -> list[float]:
    return [float(x) for x in text.strip("[]").split(",") if x]


async def main() -> None:
    settings = get_settings()
    configure_logging(settings.log_format)
    database = Database(settings.database_url, min_size=1, max_size=4,
                        statement_cache_size=settings.db_statement_cache_size)
    await database.connect()
    assert database.pool is not None
    worker = Worker(database, build_gateway(settings, database.pool), settings)
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, stop.set)
        except NotImplementedError:  # Windows
            pass
    log.info("worker.start", worker_id=settings.worker_id)
    try:
        await worker.forever(stop)
    finally:
        await database.close()


if __name__ == "__main__":
    asyncio.run(main())
