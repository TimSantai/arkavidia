"""Verifier grounding deterministik (blueprint 04 bagian 1).

Setiap field konten harus didukung kutipan verbatim (setelah normalisasi) dari pesan yang
ada di batch. Field tanpa bukti dibuang. Kandidat ditolak bila field wajib hilang.
"""

from __future__ import annotations

import re
import unicodedata
from collections.abc import Mapping
from uuid import UUID

from app.ai.schemas import Candidate, ChatMessage, Evidence, GroundedCandidate, MemoryType

_WS = re.compile(r"\s+")

REQUIRED_FIELDS: dict[MemoryType, tuple[str, ...]] = {
    MemoryType.DECISION: ("title", "chosen_option"),
    MemoryType.TASK: ("title",),
    MemoryType.RATIONALE: ("title",),
    MemoryType.NOTE: ("title",),
}

# Field yang tidak butuh bukti kutipan (metadata, bukan klaim faktual).
_EXEMPT_FIELDS = {"supersedes_candidate"}


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).casefold()
    text = text.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    return _WS.sub(" ", text).strip()


def quote_is_supported(ev: Evidence, messages: Mapping[UUID, ChatMessage]) -> bool:
    msg = messages.get(ev.message_id)
    if msg is None:
        return False
    q = normalize(ev.quote)
    return len(q) >= 3 and q in normalize(msg.body)


def _is_empty(value: object) -> bool:
    return value is None or value == "" or value == [] or value == {}


def verify_grounding(
    candidate: Candidate, messages: Mapping[UUID, ChatMessage]
) -> GroundedCandidate:
    supported: dict[str, list[Evidence]] = {}
    for ev in candidate.evidence:
        if quote_is_supported(ev, messages):
            supported.setdefault(ev.field, []).append(ev)

    content = dict(candidate.content)
    dropped: list[str] = []
    for field, value in list(content.items()):
        if field in _EXEMPT_FIELDS or _is_empty(value):
            continue
        if field not in supported:
            dropped.append(field)
            content.pop(field)

    kept_evidence = [ev for evs in supported.values() for ev in evs if ev.field in content]
    grounded = candidate.model_copy(update={"content": content, "evidence": kept_evidence})

    missing = [f for f in REQUIRED_FIELDS[candidate.type] if _is_empty(content.get(f))]
    if missing:
        return GroundedCandidate(
            candidate=grounded,
            dropped_fields=dropped,
            valid=False,
            reason=f"field wajib tanpa bukti: {', '.join(missing)}",
        )
    return GroundedCandidate(candidate=grounded, dropped_fields=dropped, valid=True)
