"""IFC lapis 2: otorisasi deterministik sebelum konteks masuk ke LLM (blueprint 01 bagian 3).

RLS Postgres adalah lapis 1. Modul ini menolak item yang tidak boleh dilihat oleh agent
tertentu, menegakkan aturan data tier Free, dan menghitung label taint dari isi bundle
(bukan dari pengakuan LLM).
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from enum import StrEnum
from uuid import UUID

from app.ai.schemas import ContextItem, Scope, Sensitivity


class AgentKind(StrEnum):
    PERSONAL = "personal"
    TEAM = "team"


class Taint(StrEnum):
    NONE = "none"
    PRIVATE = "private"


@dataclass(frozen=True, slots=True)
class Decision:
    allowed: bool
    reason: str


ALLOW = Decision(True, "ok")


def authorize_context_item(*, user_id: UUID, team_id: UUID, member_team_ids: Iterable[UUID],
                           agent: AgentKind, item: ContextItem) -> Decision:
    if item.team_id != team_id:
        return Decision(False, "item dari tim lain")
    if team_id not in set(member_team_ids):
        return Decision(False, "bukan anggota tim")
    if item.scope == Scope.PRIVATE:
        if agent != AgentKind.PERSONAL:
            return Decision(False, "Team Agent tidak boleh membaca M1")
        if item.owner_id != user_id:
            return Decision(False, "M1 milik anggota lain")
    return ALLOW


def authorize_provider(tier: str, bundle: Sequence[ContextItem]) -> Decision:
    if tier == "free":
        if any(i.scope == Scope.PRIVATE for i in bundle):
            return Decision(False, "tier Free: M1 tidak boleh dikirim ke kuota gratis provider")
        if any(i.sensitivity == Sensitivity.PII for i in bundle):
            return Decision(False, "tier Free: item PII tidak boleh dikirim")
    return ALLOW


def filter_bundle(*, user_id: UUID, team_id: UUID, member_team_ids: Iterable[UUID],
                  agent: AgentKind, tier: str, items: Sequence[ContextItem]
                  ) -> tuple[list[ContextItem], list[tuple[ContextItem, Decision]]]:
    member_team_ids = set(member_team_ids)
    kept: list[ContextItem] = []
    denied: list[tuple[ContextItem, Decision]] = []
    for item in items:
        d = authorize_context_item(user_id=user_id, team_id=team_id,
                                   member_team_ids=member_team_ids, agent=agent, item=item)
        if d.allowed and tier == "free":
            d = authorize_provider(tier, [item])
        (kept.append(item) if d.allowed else denied.append((item, d)))
    return kept, denied


def compute_taint(bundle: Sequence[ContextItem]) -> Taint:
    """Konservatif: satu saja item M1 di bundle membuat jawaban tainted."""
    return Taint.PRIVATE if any(i.scope == Scope.PRIVATE for i in bundle) else Taint.NONE


def authorize_post_to_team(taint: Taint) -> Decision:
    if taint == Taint.PRIVATE:
        return Decision(False, "jawaban memakai memori pribadi; bagikan lewat Context Passport")
    return ALLOW
