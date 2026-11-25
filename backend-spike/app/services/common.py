"""Operasi bersama untuk router dan worker."""

from __future__ import annotations

import base64
import json
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

import asyncpg

from app.errors import BadRequest, NotFound, PolicyDenied
from app.gateway.base import TeamContext


async def require_member(conn: asyncpg.Connection, team_id: UUID) -> None:
    """Dipanggil di bawah RLS. 404 (bukan 403) agar keberadaan tim lain tidak bocor."""
    if not await conn.fetchval("select public.is_member($1)", team_id):
        raise NotFound("Tim tidak ditemukan")


async def require_lead(conn: asyncpg.Connection, team_id: UUID) -> None:
    await require_member(conn, team_id)
    if not await conn.fetchval("select public.is_lead($1)", team_id):
        raise PolicyDenied("Hanya lead tim")


async def team_context(conn: asyncpg.Connection, team_id: UUID,
                       user_id: UUID | None) -> TeamContext:
    tier = await conn.fetchval("select tier::text from teams where id = $1", team_id)
    if tier is None:
        raise NotFound("Tim tidak ditemukan")
    return TeamContext(team_id, tier, user_id)


async def audit(conn: asyncpg.Connection, *, team_id: UUID | None, actor: UUID | None,
                agent: str, action: str, object_type: str | None, object_id: UUID | None,
                allowed: bool, reason: str | None = None) -> None:
    await conn.execute(
        """insert into audit_log (team_id, actor_user_id, actor_agent, action, object_type,
           object_id, policy_decision, reason) values ($1,$2,$3,$4,$5,$6,$7,$8)""",
        team_id, actor, agent, action, object_type, object_id,
        "allow" if allowed else "deny", reason)


async def enqueue(conn: asyncpg.Connection, kind: str, payload: dict[str, Any], *,
                  key: str | None = None, run_after: datetime | None = None,
                  debounce: bool = False) -> None:
    """Masukkan job. Dengan `key`, hanya ada satu job antre per kunci; `debounce=True`
    menggeser run_after job antre yang sudah ada."""
    if key is None:
        await conn.execute(
            "insert into jobs (kind, payload, run_after) values ($1, $2, coalesce($3, now()))",
            kind, payload, run_after)
        return
    update = "run_after = excluded.run_after, updated_at = now()" if debounce else "updated_at = now()"
    await conn.execute(
        f"""insert into jobs (kind, payload, run_after, idempotency_key)
            values ($1, $2, coalesce($3, now()), $4)
            on conflict (idempotency_key) where status = 'queued' do update set {update}""",
        kind, payload, run_after, key)


async def emit(conn: asyncpg.Connection, team_id: UUID, type_: str, object_id: UUID | None,
               payload: dict[str, Any] | None = None) -> UUID:
    return await conn.fetchval(
        """insert into outbox_events (team_id, type, object_id, payload)
           values ($1,$2,$3,$4) returning id""", team_id, type_, object_id, payload or {})


def encode_cursor(created_at: datetime, row_id: UUID) -> str:
    raw = json.dumps([created_at.isoformat(), str(row_id)]).encode()
    return base64.urlsafe_b64encode(raw).decode()


def decode_cursor(cursor: str | None) -> tuple[datetime, UUID] | None:
    if not cursor:
        return None
    try:
        ts, rid = json.loads(base64.urlsafe_b64decode(cursor.encode()))
        return datetime.fromisoformat(ts), UUID(rid)
    except (ValueError, TypeError) as exc:
        raise BadRequest("cursor tidak valid") from exc


def week_ago(now: datetime) -> datetime:
    return now - timedelta(days=7)
