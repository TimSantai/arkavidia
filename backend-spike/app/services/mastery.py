from __future__ import annotations

from uuid import UUID

import asyncpg

from app.ai import bkt


async def apply_evidence(conn: asyncpg.Connection, user_id: UUID, kc_id: UUID,
                         correct: bool) -> float:
    """Perbarui P(L) dengan satu bukti explain-back. Dipanggil dengan service_role."""
    row = await conn.fetchrow(
        "select p_mastery from mastery where user_id = $1 and kc_id = $2 for update",
        user_id, kc_id)
    p_prev = row["p_mastery"] if row else bkt.DEFAULT_PARAMS.p_init
    p_new = bkt.update(p_prev, correct)
    await conn.execute(
        """insert into mastery (user_id, kc_id, p_mastery, n_evidence, last_evidence_at)
           values ($1, $2, $3, 1, now())
           on conflict (user_id, kc_id) do update set p_mastery = excluded.p_mastery,
             n_evidence = mastery.n_evidence + 1, last_evidence_at = now()""",
        user_id, kc_id, p_new)
    return p_new
