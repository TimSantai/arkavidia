from __future__ import annotations

import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app.auth import CurrentUser
from app.db import Database, elevate
from app.deps import db
from app.errors import Conflict, NotFound
from app.services.common import audit, require_lead

router = APIRouter(prefix="/v1", tags=["teams"])
DB = Annotated[Database, Depends(db)]
MAX_MEMBERS = 6


class TeamIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class InviteIn(BaseModel):
    expires_in_hours: int = Field(default=72, ge=1, le=24 * 14)


class ConsentIn(BaseModel):
    consent_explainback: bool | None = None
    consent_voice: bool | None = None
    display_name: str | None = Field(default=None, min_length=1, max_length=120)


@router.post("/teams", status_code=status.HTTP_201_CREATED)
async def create_team(body: TeamIn, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        if not await conn.fetchval("select exists(select 1 from users where id = $1)", user.user_id):
            raise NotFound("Profil pengguna belum ada")
        await elevate(conn)  # pembuatan tim: tidak ada baris yang bisa diperiksa RLS sebelumnya
        team = await conn.fetchrow("insert into teams (name) values ($1) returning *", body.name)
        await conn.execute(
            "insert into memberships (team_id, user_id, role) values ($1, $2, 'lead')",
            team["id"], user.user_id)
        await audit(conn, team_id=team["id"], actor=user.user_id, agent="user",
                    action="team.create", object_type="team", object_id=team["id"], allowed=True)
    return {"team": {"id": team["id"], "name": team["name"], "tier": team["tier"], "role": "lead"}}


@router.get("/teams")
async def list_teams(user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        rows = await conn.fetch(
            """select t.id, t.name, t.tier, m.role from teams t
               join memberships m on m.team_id = t.id and m.user_id = $1 order by t.created_at""",
            user.user_id)
        return {"items": [dict(r) for r in rows]}


@router.get("/teams/{team_id}/members")
async def list_members(team_id: UUID, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        rows = await conn.fetch(
            """select u.id, u.display_name, m.role from memberships m join users u on u.id = m.user_id
               where m.team_id = $1 order by m.joined_at""", team_id)
        if not rows:
            raise NotFound("Tim tidak ditemukan")
        return {"items": [dict(r) for r in rows]}


@router.post("/teams/{team_id}/invites", status_code=status.HTTP_201_CREATED)
async def create_invite(team_id: UUID, body: InviteIn, user: CurrentUser, database: DB) -> dict:
    token = secrets.token_urlsafe(24)
    expires = datetime.now(UTC) + timedelta(hours=body.expires_in_hours)
    async with database.user_tx(user.claims) as conn:
        await require_lead(conn, team_id)
        await elevate(conn)
        await conn.execute(
            "insert into invites (team_id, token_hash, created_by, expires_at) values ($1,$2,$3,$4)",
            team_id, hashlib.sha256(token.encode()).hexdigest(), user.user_id, expires)
    return {"invite_token": token, "expires_at": expires}


@router.post("/invites/{token}/accept")
async def accept_invite(token: str, user: CurrentUser, database: DB) -> dict:
    digest = hashlib.sha256(token.encode()).hexdigest()
    async with database.service_tx() as conn:
        inv = await conn.fetchrow(
            "select * from invites where token_hash = $1 for update", digest)
        if inv is None or inv["used_at"] is not None or inv["expires_at"] < datetime.now(UTC):
            raise NotFound("Undangan tidak valid atau kedaluwarsa")
        await conn.execute("select 1 from teams where id = $1 for update", inv["team_id"])
        n = await conn.fetchval("select count(*) from memberships where team_id = $1", inv["team_id"])
        if n >= MAX_MEMBERS:
            raise Conflict(f"Tim sudah {MAX_MEMBERS} anggota")
        row = await conn.fetchrow(
            """insert into memberships (team_id, user_id) values ($1, $2)
               on conflict (team_id, user_id) do nothing returning id""", inv["team_id"], user.user_id)
        if row is None:
            raise Conflict("Sudah menjadi anggota tim")
        await conn.execute("update invites set used_by = $1, used_at = now() where id = $2",
                           user.user_id, inv["id"])
        await audit(conn, team_id=inv["team_id"], actor=user.user_id, agent="user",
                    action="team.join", object_type="team", object_id=inv["team_id"], allowed=True)
    return {"membership": {"team_id": inv["team_id"], "role": "member"}}


@router.get("/me")
async def me(user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        row = await conn.fetchrow("select * from users where id = $1", user.user_id)
        if row is None:
            raise NotFound("Profil tidak ditemukan")
        return {"user": dict(row)}


@router.patch("/me")
async def update_me(body: ConsentIn, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        row = await conn.fetchrow(
            """update users set
                 consent_explainback = coalesce($2, consent_explainback),
                 consent_voice = coalesce($3, consent_voice),
                 display_name = coalesce($4, display_name),
                 consent_at = case when $2::bool is not null or $3::bool is not null
                                   then now() else consent_at end
               where id = $1 returning *""",
            user.user_id, body.consent_explainback, body.consent_voice, body.display_name)
        return {"user": dict(row)}
