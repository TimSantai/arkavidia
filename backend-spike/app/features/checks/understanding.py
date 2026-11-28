"""Metrik pemahaman tim dari tabel mastery (dihitung dengan service_role, hanya agregat yang
keluar: P(L) individu anggota lain tidak pernah dikembalikan)."""

from __future__ import annotations

from typing import Any
from uuid import UUID

import asyncpg

from app.ai import metrics


async def team_understanding(conn: asyncpg.Connection, team_id: UUID, tau: float) -> dict[str, Any]:
    members = await conn.fetch(
        """select u.id, u.display_name from memberships m join users u on u.id = m.user_id
           where m.team_id = $1 order by u.display_name""", team_id)
    kcs = await conn.fetch(
        """select id, name, criticality from knowledge_components
           where team_id = $1 and merged_into is null order by name""", team_id)
    rows = await conn.fetch(
        """select m.user_id, m.kc_id, m.p_mastery from mastery m
           join knowledge_components k on k.id = m.kc_id where k.team_id = $1""", team_id)
    names = {str(r["id"]): r["display_name"] for r in members}
    uids = list(names)
    kc_ids = [str(k["id"]) for k in kcs]
    matrix: dict[str, dict[str, float]] = {u: {} for u in uids}
    for r in rows:
        if str(r["user_id"]) in matrix:
            matrix[str(r["user_id"])][str(r["kc_id"])] = float(r["p_mastery"])
    crit = {str(k["id"]): float(k["criticality"]) for k in kcs}
    cov = metrics.coverage(matrix, uids, kc_ids, tau)
    critical = [k for k in kc_ids if crit[k] >= 2]
    pairs = metrics.suggest_pairs(matrix, uids, kc_ids, crit, tau)
    kc_name = {str(k["id"]): k["name"] for k in kcs}
    return {
        "tau": tau,
        "coverage": [
            {"kc_id": k, "name": kc_name[k], "criticality": int(crit[k]), "n_covered": cov[k],
             "explainers": [names[u] for u in metrics.covered_by(matrix, uids, k, tau)]}
            for k in kc_ids],
        "bus_factor": metrics.bus_factor(matrix, uids, critical, tau),
        "n_critical_kcs": len(critical),
        "gini_by_kc": {k: round(metrics.gini([matrix[u].get(k, 0.0) for u in uids]), 4)
                       for k in kc_ids},
        "pairing": [{"explainer": names[p.explainer], "explainer_id": p.explainer,
                     "learner": names[p.learner], "learner_id": p.learner,
                     "kc_id": p.kc, "kc_name": kc_name[p.kc], "gain": p.gain} for p in pairs],
    }
