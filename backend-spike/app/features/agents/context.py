"""Perakitan context bundle untuk agent: retrieval (RLS) -> policy lapis 2 -> packing."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

import asyncpg

from app import policy, retrieval
from app.ai.schemas import ContextItem
from app.config import Settings, drop_to_user, elevate
from app.features.common import audit
from app.gateway.router import Gateway


@dataclass(slots=True)
class Bundle:
    items: list[ContextItem]
    denied: list[tuple[ContextItem, policy.Decision]]


async def build_bundle(conn: asyncpg.Connection, gw: Gateway, settings: Settings, *,
                       user_id: UUID, team_id: UUID, tier: str, question: str,
                       agent: policy.AgentKind, as_of: datetime | None = None) -> Bundle:
    as_of = as_of or datetime.now(UTC)
    [qvec] = await gw.embed([question])
    ids = await retrieval.hybrid_search(conn, team_id=team_id, query=question, query_vec=qvec,
                                        as_of=as_of)
    candidates = await retrieval.load_context(conn, ids, as_of)
    kept, denied = policy.filter_bundle(user_id=user_id, team_id=team_id,
                                        member_team_ids=[team_id], agent=agent, tier=tier,
                                        items=candidates)
    if denied:
        await elevate(conn)
        for item, d in denied:
            await audit(conn, team_id=team_id, actor=user_id, agent=agent.value,
                        action="context.read", object_type="memory_item",
                        object_id=item.item_id, allowed=False, reason=d.reason)
        await drop_to_user(conn)
    return Bundle(retrieval.pack(kept, settings.context_token_budget), denied)
