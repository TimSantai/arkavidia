"""Merakit Gateway dari Settings, plus Recorder berbasis tabel llm_calls."""

from __future__ import annotations

from uuid import UUID

import asyncpg

from app.billing import DbMeter
from app.config import Settings
from app.gateway.base import CallRecord, ChatProvider, Route
from app.gateway.fake import FakeProvider
from app.gateway.providers import HashingEmbedder, LiteLLMEmbedder, LiteLLMProvider
from app.gateway.router import Gateway

TASKS = ("extract", "tag_kc", "qgen", "answerable", "grade", "agent", "briefing")


class DbRecorder:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def record(self, rec: CallRecord) -> None:
        async with self._pool.acquire() as conn:
            await conn.execute(
                """insert into llm_calls (team_id, task, provider, model, prompt_version,
                   input_hash, tokens_in, tokens_out, latency_ms, cost_idr, status, error,
                   response_text) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)""",
                rec.team_id, rec.task, rec.provider, rec.model, rec.prompt_version,
                rec.input_hash, rec.tokens_in, rec.tokens_out, rec.latency_ms, rec.cost_idr,
                rec.status, rec.error, rec.response_text)

    async def replay(self, task: str, input_hash: str) -> str | None:
        async with self._pool.acquire() as conn:
            return await conn.fetchval(
                """select response_text from llm_calls where task = $1 and input_hash = $2
                   and status = 'ok' order by created_at desc limit 1""", task, input_hash)

    async def tokens_used_today(self, team_id: UUID) -> tuple[int, int]:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """select coalesce((select sum(tokens_in + tokens_out) from llm_calls
                     where team_id = $1 and created_at >= date_trunc('day', now())), 0) as used,
                   (select daily_token_quota from teams where id = $1) as quota""", team_id)
        return int(row["used"]), int(row["quota"] or 10**12)


def _routes(primary: ChatProvider, model: str, fallback: ChatProvider | None,
            fallback_model: str | None) -> dict[str, list[Route]]:
    chain = [Route(primary, model)]
    if fallback is not None and fallback_model:
        chain.append(Route(fallback, fallback_model))
    return {t: chain for t in TASKS}


def build_gateway(settings: Settings, pool: asyncpg.Pool,
                  provider_override: ChatProvider | None = None) -> Gateway:
    if provider_override is not None or settings.llm_backend == "fake":
        p = provider_override or FakeProvider()
        routes = {"free": _routes(p, "fake", None, None), "pro": _routes(p, "fake", None, None)}
    else:
        if not settings.llm_free_primary_model or not settings.llm_pro_primary_model:
            raise RuntimeError("LLM_BACKEND=litellm butuh LLM_FREE_PRIMARY_MODEL dan LLM_PRO_PRIMARY_MODEL")

        def key(s):
            return s.get_secret_value() if s else None
        free = LiteLLMProvider("free", key(settings.llm_free_tier_api_key))
        pro = LiteLLMProvider("pro", key(settings.llm_pro_api_key))
        fb = LiteLLMProvider("fallback", key(settings.llm_fallback_api_key))
        routes = {
            "free": _routes(free, settings.llm_free_primary_model, fb,
                            settings.llm_free_fallback_model),
            "pro": _routes(pro, settings.llm_pro_primary_model, fb,
                           settings.llm_pro_fallback_model),
        }
    if settings.embedding_backend == "hashing":
        embedder = HashingEmbedder(settings.embedding_dim)
    else:
        embedder = LiteLLMEmbedder(settings.embedding_model, settings.embedding_dim,
                                   settings.llm_pro_api_key.get_secret_value()
                                   if settings.llm_pro_api_key else None)
    return Gateway(routes, embedder, DbRecorder(pool), DbMeter(pool),
                   replay=settings.demo_replay, default_timeout=settings.llm_timeout_seconds)
