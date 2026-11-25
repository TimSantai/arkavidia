"""Deteksi PII deterministik untuk Context Passport (blueprint 04 bagian 7).

Regex menangkap pola terstruktur (telepon Indonesia, email, 16 digit NIK). Nama orang dan
alamat TIDAK tertangkap andal oleh regex; daftar nama opsional bisa diberikan pemanggil.
"""

from __future__ import annotations

import re
from collections.abc import Iterable
from dataclasses import dataclass

_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("email", re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")),
    ("nik", re.compile(r"(?<!\d)\d{16}(?!\d)")),
    ("phone", re.compile(r"(?<![\d+])(?:\+62|62|0)[\s-]?8(?:[\s-]?\d){7,11}(?!\d)")),
]

_LABEL = {"email": "[EMAIL]", "nik": "[NIK]", "phone": "[TELEPON]", "name": "[NAMA]"}


@dataclass(frozen=True, slots=True)
class Span:
    start: int
    end: int
    kind: str


def scan(text: str, names: Iterable[str] = ()) -> list[Span]:
    found: list[Span] = []
    for kind, pattern in _PATTERNS:
        found.extend(Span(m.start(), m.end(), kind) for m in pattern.finditer(text))
    for name in names:
        name = name.strip()
        if len(name) < 3:
            continue
        pat = re.compile(rf"(?<!\w){re.escape(name)}(?!\w)", re.IGNORECASE)
        found.extend(Span(m.start(), m.end(), "name") for m in pat.finditer(text))
    # Rentang tumpang tindih: utamakan yang mulai lebih awal, lalu yang lebih panjang.
    found.sort(key=lambda s: (s.start, -(s.end - s.start)))
    merged: list[Span] = []
    for span in found:
        if merged and span.start < merged[-1].end:
            continue
        merged.append(span)
    return merged


def mask(text: str, spans: Iterable[Span]) -> str:
    out: list[str] = []
    cursor = 0
    for span in sorted(spans, key=lambda s: s.start):
        out.append(text[cursor : span.start])
        out.append(_LABEL.get(span.kind, "[PII]"))
        cursor = span.end
    out.append(text[cursor:])
    return "".join(out)
