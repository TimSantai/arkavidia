from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from pydantic import BaseModel, Field

from app.config import Database, Settings, elevate
from app.deps import db, settings
from app.features.auth import CurrentUser
from app.features.common import decode_cursor, encode_cursor, enqueue, require_member

router = APIRouter(prefix="/v1/teams/{team_id}/messages", tags=["rooms"])
DB = Annotated[Database, Depends(db)]
CFG = Annotated[Settings, Depends(settings)]


class MessageIn(BaseModel):
    room: Literal["team", "private"]
    body: str = Field(min_length=1, max_length=8000)
    client_msg_id: str = Field(min_length=1, max_length=100)


def _msg(r) -> dict:
    return {"id": r["id"], "team_id": r["team_id"], "room": r["room"],
            "author_id": r["author_id"], "body": r["body"], "created_at": r["created_at"]}


@router.post("", status_code=status.HTTP_201_CREATED)
async def send_message(team_id: UUID, body: MessageIn, user: CurrentUser, database: DB,
                       cfg: CFG, response: Response) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        row = await conn.fetchrow(
            """insert into messages (team_id, room, author_id, body, client_msg_id)
               values ($1, $2, $3, $4, $5)
               on conflict (author_id, client_msg_id) do nothing returning *""",
            team_id, body.room, user.user_id, body.body, body.client_msg_id)
        if row is None:  # idempotensi: kembalikan pesan pertama
            row = await conn.fetchrow(
                "select * from messages where author_id = $1 and client_msg_id = $2",
                user.user_id, body.client_msg_id)
            response.status_code = status.HTTP_200_OK
            return {"message": _msg(row), "duplicate": True}
        if body.room == "team":
            await elevate(conn)
            pending = await conn.fetchval(
                """select count(*) from messages m
                   left join extraction_cursors c on c.team_id = m.team_id
                   where m.team_id = $1 and m.room = 'team'
                     and (c.team_id is null
                          or (m.created_at, m.id) > (c.last_created_at, c.last_message_id))""",
                team_id)
            delay = 0 if pending >= cfg.extract_batch_size else cfg.extract_idle_seconds
            await enqueue(conn, "extract_batch", {"team_id": str(team_id)},
                          key=f"extract:{team_id}",
                          run_after=datetime.now(UTC) + timedelta(seconds=delay), debounce=True)
    return {"message": _msg(row), "duplicate": False}


@router.get("")
async def list_messages(team_id: UUID, user: CurrentUser, database: DB,
                        room: Literal["team", "private"] = "team",
                        limit: Annotated[int, Query(ge=1, le=100)] = 50,
                        cursor: str | None = None) -> dict:
    cur = decode_cursor(cursor)
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, team_id)
        rows = await conn.fetch(
            """select * from messages where team_id = $1 and room = $2
               and ($3::timestamptz is null or (created_at, id) < ($3, $4::uuid))
               order by created_at desc, id desc limit $5""",
            team_id, room, cur[0] if cur else None, cur[1] if cur else None, limit + 1)
    items = [_msg(r) for r in rows[:limit]]
    nxt = encode_cursor(rows[limit - 1]["created_at"], rows[limit - 1]["id"]) if len(rows) > limit else None
    return {"items": items, "next_cursor": nxt}
