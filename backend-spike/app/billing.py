"""Ledger kredit Pro mode simulasi (PDF ide 10.2; konvensi tanda 07-review A7).

Biaya provider  c = t_in * p_in + t_out * p_out                (USD)
Harga ke tim    P = ceil(c * (1+m) * kurs * k_fx + f_call)     (IDR)
Tahanan         H = ceil((t_in*p_in + t_max*p_out) * (1+m) * kurs * k_fx + f_call)
Entri: hold = -H, setelah respons release = +H (penuh) lalu charge = -P. Bersih = -P.
Saldo dijaga tidak negatif dengan mengunci baris tim sebelum hold.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

import asyncpg

from app.errors import InsufficientCredit
from app.gateway.base import TeamContext

MTOK = Decimal(1_000_000)


@dataclass(frozen=True, slots=True)
class Price:
    id: UUID | None
    price_in_usd_per_mtok: Decimal
    price_out_usd_per_mtok: Decimal
    usd_idr: Decimal
    fx_buffer: Decimal
    margin: Decimal
    f_call_idr: Decimal


def provider_cost_usd(price: Price, tokens_in: int, tokens_out: int) -> Decimal:
    return (Decimal(tokens_in) * price.price_in_usd_per_mtok
            + Decimal(tokens_out) * price.price_out_usd_per_mtok) / MTOK


def _to_idr(price: Price, usd: Decimal) -> int:
    idr = usd * (1 + price.margin) * price.usd_idr * price.fx_buffer + price.f_call_idr
    return math.ceil(idr)


def team_price_idr(price: Price, tokens_in: int, tokens_out: int) -> int:
    return _to_idr(price, provider_cost_usd(price, tokens_in, tokens_out))


def hold_amount_idr(price: Price, est_tokens_in: int, max_tokens_out: int) -> int:
    return _to_idr(price, provider_cost_usd(price, est_tokens_in, max_tokens_out))


async def balance(conn: asyncpg.Connection, team_id: UUID) -> int:
    return int(await conn.fetchval(
        "select coalesce(sum(amount_idr), 0) from credit_ledger where team_id = $1", team_id))


async def latest_price(conn: asyncpg.Connection, provider: str, model: str) -> Price | None:
    r = await conn.fetchrow(
        """select * from model_prices where provider = $1 and model = $2
           and effective_from <= now() order by version desc limit 1""", provider, model)
    if r is None:
        return None
    return Price(r["id"], r["price_in_usd_per_mtok"], r["price_out_usd_per_mtok"], r["usd_idr"],
                 r["fx_buffer"], r["margin"], r["f_call_idr"])


@dataclass(slots=True)
class Hold:
    hold_id: UUID
    team_id: UUID
    user_id: UUID | None
    amount: int
    price: Price
    model: str


class DbMeter:
    """Implementasi Meter berbasis Postgres. Tiap langkah memakai transaksinya sendiri agar
    tahanan tetap tercatat walau panggilan LLM gagal di tengah jalan."""

    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def before(self, team: TeamContext, provider: str, model: str, est_tokens_in: int,
                     max_tokens_out: int) -> Hold | None:
        if team.team_id is None:
            return None
        async with self._pool.acquire() as conn, conn.transaction():
            await conn.execute("set local role service_role")
            price = await latest_price(conn, provider, model)
            if price is None:
                raise InsufficientCredit(f"Tabel harga belum memuat {provider}/{model}")
            amount = hold_amount_idr(price, est_tokens_in, max_tokens_out)
            await conn.execute("select 1 from teams where id = $1 for update", team.team_id)
            bal = await balance(conn, team.team_id)
            if bal < amount:
                raise InsufficientCredit(f"Saldo Rp{bal} < tahanan Rp{amount}",
                                         balance_idr=bal, hold_idr=amount)
            hold_id = uuid4()
            await conn.execute(
                """insert into credit_ledger (id, team_id, user_id, entry_type, amount_idr, model,
                   price_version_id, hold_id) values ($1,$2,$3,'hold',$4,$5,$6,$1)""",
                hold_id, team.team_id, team.user_id, -amount, model, price.id)
            return Hold(hold_id, team.team_id, team.user_id, amount, price, model)

    async def after(self, handle: Hold | None, tokens_in: int, tokens_out: int) -> int:
        if handle is None:
            return 0
        cost = team_price_idr(handle.price, tokens_in, tokens_out)
        async with self._pool.acquire() as conn, conn.transaction():
            await conn.execute("set local role service_role")
            await self._release(conn, handle)
            await conn.execute(
                """insert into credit_ledger (team_id, user_id, entry_type, amount_idr, tokens_in,
                   tokens_out, model, price_version_id, hold_id)
                   values ($1,$2,'charge',$3,$4,$5,$6,$7,$8)""",
                handle.team_id, handle.user_id, -cost, tokens_in, tokens_out, handle.model,
                handle.price.id, handle.hold_id)
        return cost

    async def abort(self, handle: Hold | None) -> None:
        if handle is None:
            return
        async with self._pool.acquire() as conn, conn.transaction():
            await conn.execute("set local role service_role")
            await self._release(conn, handle)

    @staticmethod
    async def _release(conn: asyncpg.Connection, handle: Hold) -> None:
        await conn.execute(
            """insert into credit_ledger (team_id, user_id, entry_type, amount_idr, model,
               price_version_id, hold_id) values ($1,$2,'release',$3,$4,$5,$6)""",
            handle.team_id, handle.user_id, handle.amount, handle.model, handle.price.id,
            handle.hold_id)


def ledger_summary(rows: list[dict[str, Any]]) -> dict[str, int]:
    out: dict[str, int] = {}
    for r in rows:
        out[r["entry_type"]] = out.get(r["entry_type"], 0) + int(r["amount_idr"])
    return out
