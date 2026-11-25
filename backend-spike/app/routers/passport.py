from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field, model_validator

from app.ai import pii
from app.auth import CurrentUser
from app.db import Database, elevate
from app.deps import db
from app.errors import BadRequest, NotFound, PolicyDenied
from app.retrieval import item_text
from app.services.common import audit, emit, require_member

router = APIRouter(prefix="/v1/passport", tags=["passport"])
DB = Annotated[Database, Depends(db)]


class PreviewIn(BaseModel):
    team_id: UUID
    source_item_id: UUID | None = None
    text: str | None = Field(default=None, max_length=8000)

    @model_validator(mode="after")
    def _one(self) -> PreviewIn:
        if (self.source_item_id is None) == (self.text is None):
            raise ValueError("isi tepat satu: source_item_id atau text")
        return self


class ShareIn(BaseModel):
    team_id: UUID
    title: str = Field(min_length=1, max_length=200)
    masked_text: str = Field(min_length=1, max_length=8000)
    source_item_id: UUID | None = None


async def _names(conn, team_id: UUID) -> list[str]:
    # Nama anggota tim sendiri tidak disamarkan; daftar kontak eksternal belum ada di MVP.
    return []


@router.post("/preview")
async def preview(body: PreviewIn, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, body.team_id)
        text = body.text
        if body.source_item_id is not None:
            row = await conn.fetchrow(
                "select type, content, owner_id, scope from memory_items where id = $1",
                body.source_item_id)
            if row is None or row["owner_id"] != user.user_id or row["scope"] != "private":
                raise NotFound("Catatan pribadi tidak ditemukan")
            text = item_text(row["content"], row["type"])
        spans = pii.scan(text or "", await _names(conn, body.team_id))
    return {"masked_text": pii.mask(text or "", spans),
            "spans": [{"start": s.start, "end": s.end, "kind": s.kind} for s in spans]}


@router.post("/share", status_code=status.HTTP_201_CREATED)
async def share(body: ShareIn, user: CurrentUser, database: DB) -> dict:
    """Bagikan teks yang SUDAH disetujui pengguna ke M2 sebagai usulan (propose-confirm)."""
    remaining = pii.scan(body.masked_text) + pii.scan(body.title)
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, body.team_id)
        if body.source_item_id is not None:
            ok = await conn.fetchval(
                "select exists(select 1 from memory_items where id = $1 and owner_id = $2)",
                body.source_item_id, user.user_id)
            if not ok:
                raise NotFound("Catatan sumber tidak ditemukan")
        await elevate(conn)
        if remaining:
            await audit(conn, team_id=body.team_id, actor=user.user_id, agent="user",
                        action="passport.share", object_type="memory_item",
                        object_id=body.source_item_id, allowed=False, reason="PII tersisa")
            raise PolicyDenied("Masih ada PII yang belum disamarkan",
                               spans=[{"start": s.start, "end": s.end, "kind": s.kind}
                                      for s in remaining])
        if not body.masked_text.strip():
            raise BadRequest("Teks kosong")
        shared_id = await conn.fetchval(
            """insert into memory_items (team_id, type, content, owner_id, scope, status, recorded_at)
               values ($1, 'note', $2, $3, 'team', 'proposed', now()) returning id""",
            body.team_id, {"title": body.title, "text": body.masked_text, "from_passport": True},
            user.user_id)
        await conn.execute(
            """insert into passport_shares (team_id, source_item_id, shared_item_id, approved_by)
               values ($1, $2, $3, $4)""", body.team_id, body.source_item_id, shared_id, user.user_id)
        await emit(conn, body.team_id, "memory_proposed", shared_id, {"via": "passport"})
        await audit(conn, team_id=body.team_id, actor=user.user_id, agent="user",
                    action="passport.share", object_type="memory_item", object_id=shared_id,
                    allowed=True)
    return {"shared_item": {"id": shared_id, "status": "proposed", "scope": "team"}}
