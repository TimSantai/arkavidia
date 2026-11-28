from __future__ import annotations

from typing import Any
from uuid import UUID

import asyncpg

from app.features.auth.schemas import UserProfile


class AuthRepository:
    """Persistence adapter for the application profile linked to auth.users."""

    async def upsert_profile(
        self,
        conn: asyncpg.Connection,
        *,
        user_id: UUID,
        email: str | None,
        metadata: dict[str, Any],
    ) -> UserProfile:
        display_name = str(metadata.get("name") or metadata.get("full_name") or "").strip()
        if not display_name:
            display_name = (email or "anggota").split("@", 1)[0][:120] or "anggota"

        row = await conn.fetchrow(
            """insert into public.users (id, display_name)
               values ($1, $2)
               on conflict (id) do update set
                 display_name = case when public.users.display_name = '' then excluded.display_name
                                     else public.users.display_name end,
                 updated_at = now()
               returning id, display_name, is_active, consent_explainback, consent_voice,
                         consent_at, created_at, updated_at""",
            user_id,
            display_name[:120],
        )
        if row is None:
            raise RuntimeError("Profil pengguna tidak dapat disinkronkan")
        return UserProfile.model_validate(dict(row))

    async def get_profile(self, conn: asyncpg.Connection, user_id: UUID) -> UserProfile | None:
        row = await conn.fetchrow(
            """select id, display_name, is_active, consent_explainback, consent_voice,
                      consent_at, created_at, updated_at
               from public.users where id = $1""",
            user_id,
        )
        return UserProfile.model_validate(dict(row)) if row else None
