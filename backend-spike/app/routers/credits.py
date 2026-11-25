from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel, Field

from app import billing
from app.auth import CurrentUser
from app.db import Database, elevate
from app.deps import db
from app.errors import BadRequest
from app.services.common import audit, require_lead

router = APIRouter(prefix="/v1/teams/{team_id}/credits", tags=["credits"])
DB = Annotated[Database, Depends(db)]
MIN_TOPUP_IDR = 10_000  # agar MDR QRIS 0,7% tidak menggerus margin (PDF ide 10.2)


class TopupIn(BaseModel):
    amount_idr: int = Field(ge=MIN_TOPUP_IDR, le=5_000_000)


@router.get("")
async def get_credits(team_id: UUID, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_lead(conn, team_id)
        rows = await conn.fetch(
            """select entry_type, amount_idr, model, tokens_in, tokens_out, created_at
               from credit_ledger where team_id = $1 order by created_at desc limit 100""", team_id)
        bal = await conn.fetchval(
            "select coalesce(sum(amount_idr),0) from credit_ledger where team_id = $1", team_id)
    return {"balance_idr": int(bal), "entries": [dict(r) for r in rows],
            "summary": billing.ledger_summary([dict(r) for r in rows])}


@router.post("/topup")
async def topup(team_id: UUID, body: TopupIn, user: CurrentUser, database: DB,
                idempotency_key: Annotated[str | None, Header()] = None) -> dict:
    """Top-up SIMULASI. Tidak ada payment gateway di MVP."""
    if not idempotency_key:
        raise BadRequest("Header Idempotency-Key wajib")
    async with database.user_tx(user.claims) as conn:
        await require_lead(conn, team_id)
        await elevate(conn)
        await conn.execute(
            """insert into credit_ledger (team_id, user_id, entry_type, amount_idr, idempotency_key)
               values ($1, $2, 'topup', $3, $4) on conflict (team_id, idempotency_key) do nothing""",
            team_id, user.user_id, body.amount_idr, idempotency_key)
        await audit(conn, team_id=team_id, actor=user.user_id, agent="user",
                    action="credits.topup_simulated", object_type="team", object_id=team_id,
                    allowed=True)
        bal = await billing.balance(conn, team_id)
    return {"balance_idr": bal, "simulated": True}
