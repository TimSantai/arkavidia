"""Isi data demo ke Postgres LOKAL (memakai shim auth.users). Jangan dijalankan ke Supabase cloud.

    python -m scripts.seed_demo            # memakai DATABASE_URL dan SUPABASE_JWT_SECRET dari .env

Mencetak token JWT tiap anggota agar bisa dipakai di Swagger UI (/docs) atau frontend.
"""

from __future__ import annotations

import asyncio
import time
import uuid

import asyncpg
import httpx
import jwt

from app.config import Database, get_settings
from app.gateway.factory import build_gateway
from app.main import create_app
from app.worker import Worker

MEMBERS = ["Rani", "Dimas", "Sari", "Budi"]
CHAT = [
    ("Dimas", "Auth pakai Firebase aja gimana?"),
    ("Rani", "Oke kita pakai Supabase untuk auth karena RLS-nya bawaan dan gratis untuk pilot."),
    ("Sari", "Sepakat kita pakai FastAPI untuk layanan AI karena tim sudah paham Python."),
    ("Budi", "Deal kita pakai pgvector untuk pencarian karena cukup satu database."),
    ("Dimas", "Nanti malam lanjut ya."),
]


def token(uid: uuid.UUID, secret: str) -> str:
    now = int(time.time())
    return jwt.encode({"sub": str(uid), "aud": "authenticated", "role": "authenticated",
                       "iat": now, "exp": now + 7 * 24 * 3600}, secret, algorithm="HS256")


async def main() -> None:
    s = get_settings()
    secret = s.supabase_jwt_secret.get_secret_value() if s.supabase_jwt_secret else None
    if not secret:
        raise SystemExit("SUPABASE_JWT_SECRET wajib untuk seed lokal")
    s = s.model_copy(update={"extract_idle_seconds": 0})
    conn = await asyncpg.connect(s.database_url)
    users = {}
    for name in MEMBERS:
        uid = uuid.uuid4()
        await conn.execute("insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3::jsonb)",
                           uid, f"{name.lower()}.{uid.hex[:4]}@demo.local", f'{{"name": "{name}"}}')
        users[name] = {"Authorization": f"Bearer {token(uid, secret)}"}
    await conn.close()

    app = create_app(s)
    db = Database(s.database_url)
    await db.connect()
    async with app.router.lifespan_context(app), httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://seed") as c:
        worker = Worker(db, build_gateway(s, db.pool), s)
        team = (await c.post("/v1/teams", json={"name": "Tim Demo BERSAMA"},
                             headers=users["Rani"])).json()["team"]["id"]
        for name in MEMBERS[1:]:
            inv = (await c.post(f"/v1/teams/{team}/invites", json={}, headers=users["Rani"])).json()
            await c.post(f"/v1/invites/{inv['invite_token']}/accept", headers=users[name])
        for name, body in CHAT:
            await c.post(f"/v1/teams/{team}/messages", headers=users[name],
                         json={"room": "team", "body": body, "client_msg_id": str(uuid.uuid4())})
        await c.post(f"/v1/teams/{team}/notes", headers=users["Rani"],
                     json={"title": "Catatan pribadi", "text": "Belum paham beda RLS dan policy Cedar."})
        await worker.drain()
        brain = (await c.get(f"/v1/teams/{team}/brain", headers=users["Dimas"])).json()["items"]
        for item in brain:
            await c.post(f"/v1/memory/{item['id']}/confirm", headers=users["Dimas"],
                         json={"action": "confirm"})
        await worker.drain()
        for name in MEMBERS:
            await c.patch("/v1/me", headers=users[name], json={"consent_explainback": True})
        print(f"team_id = {team}\nusul dikonfirmasi = {len(brain)}")
    await db.close()
    for name, h in users.items():
        print(f"{name}: {h['Authorization']}")


if __name__ == "__main__":
    asyncio.run(main())
