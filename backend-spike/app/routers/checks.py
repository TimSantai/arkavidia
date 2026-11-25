from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, Response, status
from pydantic import BaseModel, Field

from app.ai import irt
from app.auth import CurrentUser
from app.config import Settings
from app.db import Database, elevate
from app.deps import db, settings
from app.errors import BadRequest, Conflict, NotFound, PolicyDenied
from app.services.common import audit, require_member
from app.services.mastery import apply_evidence
from app.services.understanding import team_understanding

router = APIRouter(prefix="/v1", tags=["explain-back"])
DB = Annotated[Database, Depends(db)]
CFG = Annotated[Settings, Depends(settings)]
EXCLUDE_MASTERED = 0.9
RECENT_DAYS = 14


class AnswerIn(BaseModel):
    answer: str = Field(min_length=1, max_length=4000)
    ai_assisted: bool = False


class PeerGradeIn(BaseModel):
    grade: int = Field(ge=0, le=2)


@router.get("/checks/next", response_model=None)
async def next_check(team_id: UUID, user: CurrentUser, database: DB, cfg: CFG) -> Response | dict:
    now = datetime.now(UTC)
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        if not await conn.fetchval("select consent_explainback from users where id = $1",
                                   user.user_id):
            raise PolicyDenied("Persetujuan explain-back belum diberikan (PATCH /v1/me)")
        done = await conn.fetchval(
            "select count(*) from check_attempts where user_id = $1 and team_id = $2 "
            "and created_at >= $3", user.user_id, team_id, now - timedelta(days=7))
        if done >= cfg.checks_per_week:
            return Response(status_code=status.HTTP_204_NO_CONTENT)
        cands = await conn.fetch(
            """select q.id, q.stem, q.bloom_level, q.irt_a, q.irt_b, q.kc_id, k.name as kc_name,
                      i.ai_assisted
               from questions q join memory_items i on i.id = q.item_id
               join knowledge_components k on k.id = q.kc_id
               where q.team_id = $1 and q.answerable and i.status = 'confirmed'
                 and not exists (select 1 from check_attempts a where a.question_id = q.id
                   and a.user_id = $2 and (a.created_at >= $3 or a.status = 'grading'))""",
            team_id, user.user_id, now - timedelta(days=RECENT_DAYS))
        mastery = {r["kc_id"]: r["p_mastery"] for r in await conn.fetch(
            "select kc_id, p_mastery from mastery where user_id = $1", user.user_id)}
        own = {r["kc_id"] for r in await conn.fetch(
            "select kc_id from kc_contributors where user_id = $1", user.user_id)}
        degree = {r["dst_kc_id"]: r["n"] for r in await conn.fetch(
            """select dst_kc_id, count(*) as n from memory_edges
               where team_id = $1 and kind = 'about_kc' group by dst_kc_id""", team_id)}
        history = await conn.fetch(
            """select q.irt_a, q.irt_b, a.final_grade from check_attempts a
               join questions q on q.id = a.question_id
               where a.user_id = $1 and a.team_id = $2 and a.final_grade is not null""",
            user.user_id, team_id)
    theta, se = irt.estimate_theta(
        [irt.Response(r["irt_a"], r["irt_b"], r["final_grade"] == 2) for r in history])
    max_deg = max(degree.values(), default=1)
    pool = [c for c in cands if mastery.get(c["kc_id"], 0.0) < EXCLUDE_MASTERED]
    by_id = {str(c["id"]): c for c in pool}
    sel = irt.select_next(theta, [
        irt.CandidateQuestion(str(c["id"]), c["irt_a"], c["irt_b"], irt.priority_weight(
            not_own_kc=c["kc_id"] not in own, ai_assisted=c["ai_assisted"],
            centrality=degree.get(c["kc_id"], 0) / max_deg)) for c in pool])
    if sel is None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    q = by_id[sel.question_id]
    return {"question": {"id": q["id"], "stem": q["stem"], "kc_name": q["kc_name"],
                         "bloom_level": q["bloom_level"]},
            "remaining_this_week": cfg.checks_per_week - done - 1,
            "selection": {"theta": round(theta, 3), "theta_se": round(se, 3),
                          "information": round(sel.information, 4), "score": round(sel.score, 4)}}


@router.post("/checks/{question_id}/answer", status_code=status.HTTP_202_ACCEPTED)
async def answer_check(question_id: UUID, body: AnswerIn, user: CurrentUser, database: DB,
                       idempotency_key: Annotated[str | None, Header()] = None) -> dict:
    if not idempotency_key:
        raise BadRequest("Header Idempotency-Key wajib")
    async with database.user_tx(user.claims) as conn:
        q = await conn.fetchrow("select id, team_id from questions where id = $1", question_id)
        if q is None:
            raise NotFound("Soal tidak ditemukan")
        if not await conn.fetchval("select consent_explainback from users where id = $1",
                                   user.user_id):
            raise PolicyDenied("Persetujuan explain-back belum diberikan")
        row = await conn.fetchrow(
            """insert into check_attempts (team_id, user_id, question_id, client_key, answer,
                 ai_assisted) values ($1,$2,$3,$4,$5,$6)
               on conflict (user_id, client_key) do nothing returning id, status""",
            q["team_id"], user.user_id, question_id, idempotency_key, body.answer, body.ai_assisted)
        if row is None:
            row = await conn.fetchrow("select id, status from check_attempts where user_id = $1 "
                                      "and client_key = $2", user.user_id, idempotency_key)
            return {"attempt_id": row["id"], "status": row["status"], "duplicate": True}
        await elevate(conn)
        await conn.execute(
            "insert into jobs (kind, payload, idempotency_key) values ('grade', $1, $2)",
            {"attempt_id": str(row["id"])}, f"grade:{row['id']}")
    return {"attempt_id": row["id"], "status": "grading", "duplicate": False}


@router.get("/checks/attempts/{attempt_id}")
async def get_attempt(attempt_id: UUID, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        r = await conn.fetchrow(
            """select a.id, a.status, a.final_grade, a.feedback, a.abstained, a.user_id,
                      p.id as peer_request_id
               from check_attempts a left join peer_requests p on p.attempt_id = a.id
               where a.id = $1""", attempt_id)
        if r is None or r["user_id"] != user.user_id:
            raise NotFound("Attempt tidak ditemukan")
    # Nilai tidak ditampilkan sebagai angka kepada pengguna (bukan nilai akademis).
    verdict = None if r["final_grade"] is None else ("paham" if r["final_grade"] == 2 else "belum")
    return {"status": r["status"], "verdict": verdict, "feedback": r["feedback"],
            "abstained": r["abstained"], "peer_request_id": r["peer_request_id"]}


@router.get("/peer-requests")
async def my_peer_requests(user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        rows = await conn.fetch(
            """select p.id, p.status, p.learner_id, p.explainer_id, q.stem, a.answer
               from peer_requests p join check_attempts a on a.id = p.attempt_id
               join questions q on q.id = a.question_id
               where p.explainer_id = $1 and p.status = 'open' order by p.created_at""",
            user.user_id)
    return {"items": [dict(r) for r in rows]}


@router.post("/peer-requests/{request_id}/grade")
async def peer_grade(request_id: UUID, body: PeerGradeIn, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        pr = await conn.fetchrow("select * from peer_requests where id = $1 and explainer_id = $2 "
                                 "for update", request_id, user.user_id)
        if pr is None:
            raise NotFound("Permintaan tidak ditemukan")
        if pr["status"] != "open":
            raise Conflict("Sudah dinilai")
        await conn.execute(
            """update check_attempts set human_grade = $2, final_grade = $2, graded_by = 'peer',
                 status = 'peer_graded', graded_at = now() where id = $1""",
            pr["attempt_id"], body.grade)
        await conn.execute("update peer_requests set status = 'done' where id = $1", request_id)
        await elevate(conn)
        att = await conn.fetchrow(
            """select a.user_id, a.ai_assisted, q.kc_id from check_attempts a
               join questions q on q.id = a.question_id where a.id = $1""", pr["attempt_id"])
        if not att["ai_assisted"]:
            await apply_evidence(conn, att["user_id"], att["kc_id"], body.grade == 2)
        await audit(conn, team_id=pr["team_id"], actor=user.user_id, agent="user",
                    action="check.peer_grade", object_type="check_attempt",
                    object_id=pr["attempt_id"], allowed=True)
    return {"status": "peer_graded"}


@router.get("/teams/{team_id}/understanding")
async def understanding(team_id: UUID, user: CurrentUser, database: DB, cfg: CFG) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        await elevate(conn)  # agregat dihitung dengan service_role; hanya agregat yang keluar
        data = await team_understanding(conn, team_id, cfg.mastery_tau)
    return {**data, "computed_at": datetime.now(UTC)}


@router.get("/me/understanding")
async def my_understanding(team_id: UUID, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        rows = await conn.fetch(
            """select k.id as kc_id, k.name, m.p_mastery, m.n_evidence from mastery m
               join knowledge_components k on k.id = m.kc_id
               where m.user_id = $1 and k.team_id = $2 order by k.name""", user.user_id, team_id)
    return {"kcs": [dict(r) for r in rows]}


@router.get("/me/digest")
async def digest(team_id: UUID, user: CurrentUser, database: DB, since: datetime | None = None,
                 mark_delivered: bool = False) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        await elevate(conn)  # outbox_events internal; filter user_id = pemanggil ditegakkan di query
        rows = await conn.fetch(
            """select a.id, a.event_id, a.relevance, a.delivered, a.created_at, i.id as item_id,
                      i.content ->> 'title' as title, e.type as kind
               from agent_inbox a
               join outbox_events e on e.id = a.event_id
               left join memory_items i on i.id = e.object_id
               where a.user_id = $1 and a.team_id = $2 and ($3::timestamptz is null or a.created_at >= $3)
               order by a.relevance desc, a.created_at desc limit 50""",
            user.user_id, team_id, since)
        if mark_delivered and rows:
            await conn.execute("update agent_inbox set delivered = true where id = any($1::uuid[])",
                               [r["id"] for r in rows])
    return {"events": [{"kind": r["kind"], "item_id": r["item_id"], "summary": r["title"],
                        "relevance": r["relevance"], "delivered": r["delivered"]} for r in rows]}
