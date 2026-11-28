"""Retrieval hybrid: FTS Postgres + pgvector, digabung RRF (k=60), ekspansi graf 1-hop,
filter as-of, lalu packing dengan anggaran token (blueprint 04 bagian 3).

Semua query berjalan di koneksi pengguna (RLS aktif). Policy lapis 2 diterapkan pemanggil.
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from typing import Any
from uuid import UUID

import asyncpg

from app.ai.schemas import ContextItem, Evidence, MemoryType, Scope, Sensitivity

RRF_K = 60


def rrf(rankings: Sequence[Sequence[UUID]], k: int = RRF_K) -> list[tuple[UUID, float]]:
    scores: dict[UUID, float] = {}
    for ranking in rankings:
        for rank, item_id in enumerate(ranking, start=1):
            scores[item_id] = scores.get(item_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda kv: (-kv[1], str(kv[0])))


def approx_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def pack(items: Sequence[ContextItem], budget_tokens: int) -> list[ContextItem]:
    out, used = [], 0
    for it in items:
        cost = approx_tokens(it.text)
        if used + cost > budget_tokens:
            continue
        out.append(it)
        used += cost
    return out


def vector_literal(vec: Sequence[float]) -> str:
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"


def item_text(content: dict[str, Any], type_: str) -> str:
    parts = [content.get("title") or ""]
    if content.get("chosen_option"):
        parts.append(f"Pilihan: {content['chosen_option']}")
    if content.get("rationale"):
        parts.append(f"Alasan: {content['rationale']}")
    alts = content.get("alternatives_rejected") or []
    if alts:
        parts.append("Alternatif ditolak: " + "; ".join(
            f"{a.get('option')} ({a.get('reason') or '-'})" for a in alts))
    if content.get("text"):
        parts.append(str(content["text"]))
    return f"[{type_}] " + " | ".join(p for p in parts if p)


# Item yang "berlaku" pada as_of: lihat docs/blueprint/02 bagian 3 (semantik bitemporal).
_AS_OF = """
  and (
    (i.status in ('confirmed','superseded') and i.recorded_at <= $AS
      and (i.valid_from is null or i.valid_from <= $AS)
      and (i.valid_to is null or i.valid_to > $AS))
    or (i.scope = 'private' and i.status <> 'rejected')
  )
"""


async def hybrid_search(conn: asyncpg.Connection, *, team_id: UUID, query: str,
                        query_vec: Sequence[float] | None, as_of: datetime,
                        limit: int = 20) -> list[UUID]:
    fts_sql = f"""
      select i.id from memory_items i
      where i.team_id = $1 and i.fts @@ websearch_to_tsquery('indonesian', $2)
      {_AS_OF.replace('$AS', '$3')}
      order by ts_rank(i.fts, websearch_to_tsquery('indonesian', $2)) desc, i.id
      limit $4"""
    fts_ids = [r["id"] for r in await conn.fetch(fts_sql, team_id, query, as_of, limit)]
    vec_ids: list[UUID] = []
    if query_vec is not None:
        vec_sql = f"""
          select i.id from memory_items i join embeddings e on e.item_id = i.id
          where i.team_id = $1 {_AS_OF.replace('$AS', '$3')}
          order by e.vector <=> $2::vector, i.id
          limit $4"""
        vec_ids = [r["id"] for r in await conn.fetch(
            vec_sql, team_id, vector_literal(query_vec), as_of, limit)]
    fused = [i for i, _ in rrf([fts_ids, vec_ids])]
    # Ekspansi graf 1-hop lewat depends_on dan about_kc (KC yang sama).
    if fused:
        neighbors = await conn.fetch(
            """
            select distinct e2.src_item_id as id from memory_edges e1
              join memory_edges e2 on e2.kind = 'about_kc' and e2.dst_kc_id = e1.dst_kc_id
             where e1.kind = 'about_kc' and e1.src_item_id = any($1::uuid[])
            union
            select dst_item_id from memory_edges
             where kind = 'depends_on' and src_item_id = any($1::uuid[])
            """, fused[:5])
        for r in neighbors:
            if r["id"] not in fused:
                fused.append(r["id"])
    return fused[: limit + 10]


async def load_context(conn: asyncpg.Connection, item_ids: Sequence[UUID], as_of: datetime
                       ) -> list[ContextItem]:
    if not item_ids:
        return []
    rows = await conn.fetch(
        f"""select i.id, i.team_id, i.scope, i.sensitivity, i.owner_id, i.type, i.content
              from memory_items i where i.id = any($1::uuid[]) {_AS_OF.replace('$AS', '$2')}""",
        list(item_ids), as_of)
    ev_rows = await conn.fetch(
        "select item_id, field, message_id, quote from memory_evidence "
        "where item_id = any($1::uuid[]) and message_id is not null", list(item_ids))
    evid: dict[UUID, list[Evidence]] = {}
    for e in ev_rows:
        evid.setdefault(e["item_id"], []).append(
            Evidence(field=e["field"], message_id=e["message_id"], quote=e["quote"]))
    order = {iid: n for n, iid in enumerate(item_ids)}
    items = [
        ContextItem(item_id=r["id"], team_id=r["team_id"], scope=Scope(r["scope"]),
                    sensitivity=Sensitivity(r["sensitivity"]), owner_id=r["owner_id"],
                    type=MemoryType(r["type"]), text=item_text(r["content"], r["type"]),
                    citations=evid.get(r["id"], []), score=-order[r["id"]])
        for r in rows
    ]
    return sorted(items, key=lambda i: order[i.item_id])
