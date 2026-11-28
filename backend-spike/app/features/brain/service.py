"""Siklus hidup memory_items: propose -> confirm/edit/reject -> supersede (bitemporal)."""

from __future__ import annotations

from typing import Any, Literal
from uuid import UUID

import asyncpg

from app.ai.grounding import REQUIRED_FIELDS
from app.ai.schemas import DecisionContent, MemoryType
from app.config import elevate
from app.errors import BadRequest, Conflict, NotFound
from app.features.common import audit, emit, enqueue

Action = Literal["confirm", "edit", "reject"]


def validate_content(type_: str, content: dict[str, Any]) -> dict[str, Any]:
    mt = MemoryType(type_)
    if mt == MemoryType.DECISION:
        extra = {k: v for k, v in content.items() if k == "supersedes_candidate"}
        model = DecisionContent.model_validate(content)
        return {**model.model_dump(mode="json", exclude_none=True), **extra}
    if not content.get("title"):
        raise BadRequest("content.title wajib")
    for f in REQUIRED_FIELDS[mt]:
        if not content.get(f):
            raise BadRequest(f"content.{f} wajib")
    return content


async def _supersede(conn: asyncpg.Connection, old_id: UUID, new_id: UUID, team_id: UUID) -> None:
    """Tutup versi lama (valid_to) dan catat edge supersedes. Dipanggil setelah elevate."""
    await conn.execute(
        """update memory_items o set status = 'superseded',
             valid_to = greatest(n.valid_from, o.valid_from + interval '1 microsecond')
           from memory_items n
           where o.id = $1 and n.id = $2 and o.status = 'confirmed' and o.team_id = $3""",
        old_id, new_id, team_id)
    await conn.execute(
        """insert into memory_edges (team_id, kind, src_item_id, dst_item_id)
           values ($1, 'supersedes', $2, $3) on conflict do nothing""", team_id, new_id, old_id)


async def apply_action(conn: asyncpg.Connection, *, user_id: UUID, item_id: UUID,
                       action: Action, content: dict[str, Any] | None,
                       ai_assisted: bool | None) -> dict[str, Any]:
    # Langkah 1 di bawah RLS: item harus terlihat oleh pengguna.
    item = await conn.fetchrow("select * from memory_items where id = $1 for update", item_id)
    if item is None:
        raise NotFound("Item tidak ditemukan")
    if item["scope"] != "team":
        raise Conflict("Hanya item tim (M2) yang melalui propose-confirm")
    team_id = item["team_id"]

    if action == "reject":
        if item["status"] != "proposed":
            raise Conflict(f"Item berstatus {item['status']}, tidak bisa ditolak")
        await conn.execute("update memory_items set status = 'rejected' where id = $1", item_id)
        result_id = item_id
    elif item["status"] == "proposed":
        new_content = validate_content(item["type"], content) if content else item["content"]
        await conn.execute(
            """update memory_items set status = 'confirmed', content = $2,
                 ai_assisted = coalesce($3, ai_assisted), confirmed_by = $4,
                 confirmed_at = now(), valid_from = coalesce(valid_from, now())
               where id = $1""", item_id, new_content, ai_assisted, user_id)
        result_id = item_id
        target = new_content.get("supersedes_candidate")
        await elevate(conn)
        if target:
            await _supersede(conn, UUID(str(target)), item_id, team_id)
    elif item["status"] == "confirmed" and action == "edit":
        if not content:
            raise BadRequest("edit butuh content")
        new_content = validate_content(item["type"], content)
        await elevate(conn)
        result_id = await conn.fetchval(
            """insert into memory_items (team_id, type, content, owner_id, scope, sensitivity,
                 status, ai_assisted, valid_from, source_message_ids, prompt_version,
                 model_version, confirmed_by, confirmed_at)
               values ($1,$2,$3,$4,'team',$5,'confirmed',$6, now(),$7,$8,$9,$10, now())
               returning id""",
            team_id, item["type"], new_content, item["owner_id"], item["sensitivity"],
            item["ai_assisted"] if ai_assisted is None else ai_assisted,
            item["source_message_ids"], item["prompt_version"], item["model_version"], user_id)
        # Salin bukti hanya untuk field yang nilainya tidak berubah.
        same = [k for k, v in new_content.items() if item["content"].get(k) == v]
        await conn.execute(
            """insert into memory_evidence (item_id, field, message_id, quote)
               select $1, field, message_id, quote from memory_evidence
               where item_id = $2 and field = any($3::text[])""", result_id, item_id, same)
        await conn.execute(
            """insert into memory_edges (team_id, kind, src_item_id, dst_kc_id)
               select team_id, 'about_kc', $1, dst_kc_id from memory_edges
               where src_item_id = $2 and kind = 'about_kc'""", result_id, item_id)
        await _supersede(conn, item_id, result_id, team_id)
    else:
        raise Conflict(f"Aksi {action} tidak berlaku untuk status {item['status']}")

    await elevate(conn)
    evt = await emit(conn, team_id, f"memory_{action}ed",
                     result_id, {"by": str(user_id)})
    if action != "reject":
        await enqueue(conn, "item_confirmed", {"item_id": str(result_id), "event_id": str(evt)},
                      key=f"item_confirmed:{result_id}")
    await audit(conn, team_id=team_id, actor=user_id, agent="user", action=f"memory.{action}",
                object_type="memory_item", object_id=result_id, allowed=True)
    row = await conn.fetchrow("select id, status, content, valid_from, valid_to from memory_items "
                              "where id = $1", result_id)
    return dict(row)
