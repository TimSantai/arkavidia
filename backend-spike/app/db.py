"""Akses Postgres. Setiap request pengguna berjalan dalam transaksi dengan
`SET LOCAL ROLE authenticated` + `request.jwt.claims`, sehingga RLS (IFC lapis 1) berlaku.
Koneksi service_role hanya untuk worker dan efek samping internal yang sudah diotorisasi.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

import asyncpg


async def _init_conn(conn: asyncpg.Connection) -> None:
    for typ in ("json", "jsonb"):
        await conn.set_type_codec(typ, encoder=json.dumps, decoder=json.loads,
                                  schema="pg_catalog")


class Database:
    def __init__(self, dsn: str, *, min_size: int = 1, max_size: int = 10,
                 statement_cache_size: int = 100) -> None:
        self._dsn = dsn
        self._min, self._max, self._cache = min_size, max_size, statement_cache_size
        self.pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        self.pool = await asyncpg.create_pool(
            self._dsn, min_size=self._min, max_size=self._max, init=_init_conn,
            statement_cache_size=self._cache)

    async def close(self) -> None:
        if self.pool is not None:
            await self.pool.close()

    def _require(self) -> asyncpg.Pool:
        if self.pool is None:
            raise RuntimeError("Database belum terhubung")
        return self.pool

    @asynccontextmanager
    async def user_tx(self, claims: dict[str, Any]) -> AsyncIterator[asyncpg.Connection]:
        async with self._require().acquire() as conn, conn.transaction():
            await conn.execute("select set_config('request.jwt.claims', $1, true)",
                               json.dumps(claims))
            await conn.execute("set local role authenticated")
            yield conn

    @asynccontextmanager
    async def service_tx(self) -> AsyncIterator[asyncpg.Connection]:
        async with self._require().acquire() as conn, conn.transaction():
            await conn.execute("set local role service_role")
            yield conn


async def elevate(conn: asyncpg.Connection) -> None:
    """Naikkan ke service_role di transaksi yang sama, SETELAH otorisasi di bawah RLS selesai.
    Dipakai agar perubahan state + outbox/jobs tetap atomik."""
    await conn.execute("set local role service_role")


async def drop_to_user(conn: asyncpg.Connection) -> None:
    await conn.execute("set local role authenticated")
