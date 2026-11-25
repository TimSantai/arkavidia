"""Tes integrasi: Postgres sungguhan (dengan pgvector) + aplikasi FastAPI + worker,
memakai FakeProvider (tanpa jaringan). Set TEST_DATABASE_URL ke DSN admin, contoh:
TEST_DATABASE_URL=postgresql://postgres@localhost:5432/postgres
Database baru `bersama_test_<acak>` dibuat lalu dihapus per sesi tes."""

from __future__ import annotations

import os
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse, urlunparse

import asyncpg
import httpx
import jwt
import pytest
from pydantic import SecretStr

from app.config import Settings
from app.db import Database
from app.gateway.factory import build_gateway
from app.gateway.fake import FakeProvider
from app.main import create_app
from app.worker import Worker

ROOT = Path(__file__).resolve().parents[2]
SECRET = "test-secret-minimal-32-karakter-panjangnya!!"
ADMIN_DSN = os.environ.get("TEST_DATABASE_URL")

pytestmark = pytest.mark.integration


def _with_db(dsn: str, name: str) -> str:
    u = urlparse(dsn)
    return urlunparse(u._replace(path=f"/{name}"))


@pytest.fixture(scope="session")
async def database_url():
    if not ADMIN_DSN:
        pytest.skip("TEST_DATABASE_URL tidak di-set")
    name = f"bersama_test_{uuid.uuid4().hex[:8]}"
    admin = await asyncpg.connect(ADMIN_DSN)
    await admin.execute(f'create database "{name}"')
    await admin.close()
    url = _with_db(ADMIN_DSN, name)
    conn = await asyncpg.connect(url)
    for f in [ROOT / "supabase/local/00_supabase_shim.sql",
              *sorted((ROOT / "supabase/migrations").glob("*.sql"))]:
        await conn.execute(f.read_text())
    await conn.close()
    yield url
    admin = await asyncpg.connect(ADMIN_DSN)
    await admin.execute(f'drop database if exists "{name}" with (force)')
    await admin.close()


@pytest.fixture(scope="session")
def settings(database_url) -> Settings:
    return Settings(database_url=database_url, supabase_jwt_secret=SecretStr(SECRET),
                    llm_backend="fake", extract_idle_seconds=0, log_format="console",
                    conformal_min_n=100, db_pool_max=5)


@pytest.fixture(scope="session")
def provider() -> FakeProvider:
    return FakeProvider()


@pytest.fixture(scope="session")
async def app(settings, provider):
    application = create_app(settings, provider_override=provider)
    async with application.router.lifespan_context(application):
        yield application


@pytest.fixture(scope="session")
async def client(app):
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),
                                 base_url="http://test") as c:
        yield c


@pytest.fixture(scope="session")
async def worker(app, settings, provider):
    db = Database(settings.database_url, max_size=3)
    await db.connect()
    yield Worker(db, build_gateway(settings, db.pool, provider), settings)
    await db.close()


@pytest.fixture(scope="session")
async def admin_conn(database_url):
    conn = await asyncpg.connect(database_url)
    yield conn
    await conn.close()


class User:
    def __init__(self, uid: uuid.UUID, name: str):
        self.id, self.name = uid, name
        now = int(time.time())
        token = jwt.encode({"sub": str(uid), "aud": "authenticated", "role": "authenticated",
                            "exp": now + 3600, "iat": now}, SECRET, algorithm="HS256")
        self.h = {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def make_user(admin_conn):
    async def _make(name: str) -> User:
        uid = uuid.uuid4()
        await admin_conn.execute(
            "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb)",
            uid, f"{name.lower()}-{uid.hex[:6]}@contoh.ac.id", f'{{"name": "{name}"}}')
        return User(uid, name)
    return _make


@pytest.fixture(scope="session")
def make_team(client, make_user):
    async def _make(*names: str) -> tuple[str, list[User]]:
        users = [await make_user(n) for n in names]
        r = await client.post("/v1/teams", json={"name": f"Tim {names[0]}"}, headers=users[0].h)
        assert r.status_code == 201, r.text
        team_id = r.json()["team"]["id"]
        for u in users[1:]:
            inv = await client.post(f"/v1/teams/{team_id}/invites", json={}, headers=users[0].h)
            assert inv.status_code == 201, inv.text
            acc = await client.post(f"/v1/invites/{inv.json()['invite_token']}/accept",
                                    headers=u.h)
            assert acc.status_code == 200, acc.text
        return team_id, users
    return _make
