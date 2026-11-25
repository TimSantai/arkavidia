from __future__ import annotations

from datetime import datetime
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.auth import CurrentUser
from app.db import Database, elevate
from app.deps import db
from app.errors import NotFound
from app.services.brain import apply_action
from app.services.common import audit, require_member

router = APIRouter(prefix="/v1", tags=["brain"])
DB = Annotated[Database, Depends(db)]


class ConfirmIn(BaseModel):
    action: Literal["confirm", "edit", "reject"]
    content: dict[str, Any] | None = None
    ai_assisted: bool | None = None


class NoteIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    text: str = Field(min_length=1, max_length=8000)


class KCPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    criticality: int | None = Field(default=None, ge=1, le=3)


@router.get("/teams/{team_id}/brain")
async def get_brain(team_id: UUID, user: CurrentUser, database: DB,
                    as_of: datetime | None = None,
                    status_: Annotated[str | None, Query(alias="status")] = None,
                    kc_id: UUID | None = None) -> dict:
    """Project Brain. Tanpa as_of: semua item tim (termasuk proposed). Dengan as_of: item yang
    berlaku dan sudah tercatat pada waktu itu (semantik bitemporal, blueprint 02 bagian 3)."""
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        rows = await conn.fetch(
            """select i.id, i.type, i.content, i.status, i.ai_assisted, i.owner_id,
                      i.valid_from, i.valid_to, i.recorded_at, i.confirmed_by, i.prompt_version
               from memory_items i
               where i.team_id = $1 and i.scope = 'team'
                 and ($2::timestamptz is null or (
                      i.status in ('confirmed','superseded') and i.recorded_at <= $2
                      and i.valid_from <= $2 and (i.valid_to is null or i.valid_to > $2)))
                 and ($3::text is null or i.status::text = $3)
                 and ($4::uuid is null or exists (select 1 from memory_edges e where
                      e.src_item_id = i.id and e.kind = 'about_kc' and e.dst_kc_id = $4))
               order by i.recorded_at desc""", team_id, as_of, status_, kc_id)
        ids = [r["id"] for r in rows]
        ev = await conn.fetch("select item_id, field, message_id, quote from memory_evidence "
                              "where item_id = any($1::uuid[])", ids)
        edges = await conn.fetch(
            """select e.src_item_id, e.kind, e.dst_item_id, e.dst_kc_id, k.name as kc_name
               from memory_edges e left join knowledge_components k on k.id = e.dst_kc_id
               where e.src_item_id = any($1::uuid[])""", ids)
    by_ev: dict[UUID, list] = {}
    for e in ev:
        by_ev.setdefault(e["item_id"], []).append(
            {"field": e["field"], "message_id": e["message_id"], "quote": e["quote"]})
    by_edge: dict[UUID, list] = {}
    for e in edges:
        by_edge.setdefault(e["src_item_id"], []).append(
            {"kind": e["kind"], "dst_item_id": e["dst_item_id"], "dst_kc_id": e["dst_kc_id"],
             "kc_name": e["kc_name"]})
    return {"as_of": as_of, "items": [
        {**dict(r), "evidence": by_ev.get(r["id"], []), "edges": by_edge.get(r["id"], [])}
        for r in rows]}


@router.post("/memory/{item_id}/confirm")
async def confirm(item_id: UUID, body: ConfirmIn, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        item = await apply_action(conn, user_id=user.user_id, item_id=item_id, action=body.action,
                                  content=body.content, ai_assisted=body.ai_assisted)
    return {"item": item}


@router.post("/teams/{team_id}/notes", status_code=status.HTTP_201_CREATED)
async def create_private_note(team_id: UUID, body: NoteIn, user: CurrentUser, database: DB) -> dict:
    """Catatan pribadi (M1). Hanya pemilik dan Personal Agent-nya yang bisa membaca."""
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        row = await conn.fetchrow(
            """insert into memory_items (team_id, type, content, owner_id, scope, status, valid_from)
               values ($1, 'note', $2, $3, 'private', 'confirmed', now()) returning id""",
            team_id, {"title": body.title, "text": body.text}, user.user_id)
        await elevate(conn)
        await audit(conn, team_id=team_id, actor=user.user_id, agent="user", action="note.create",
                    object_type="memory_item", object_id=row["id"], allowed=True)
    return {"item": {"id": row["id"], "scope": "private"}}


@router.get("/teams/{team_id}/kcs")
async def list_kcs(team_id: UUID, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        rows = await conn.fetch("select id, name, criticality, created_by from knowledge_components "
                                "where team_id = $1 and merged_into is null order by name", team_id)
    return {"items": [dict(r) for r in rows]}


@router.patch("/kcs/{kc_id}")
async def patch_kc(kc_id: UUID, body: KCPatch, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        row = await conn.fetchrow(
            """update knowledge_components set name = coalesce($2, name),
                 criticality = coalesce($3, criticality) where id = $1
               returning id, team_id, name, criticality""", kc_id, body.name, body.criticality)
        if row is None:
            raise NotFound("KC tidak ditemukan")
    return {"kc": dict(row)}
