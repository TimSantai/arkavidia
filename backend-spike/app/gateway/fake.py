"""Provider palsu deterministik untuk tes dan demo offline.

Membaca `payload` terstruktur dari RenderedPrompt (bukan teks prompt), lalu menerapkan
heuristik sederhana per tugas. Tes bisa mengganti handler per tugas.
"""

from __future__ import annotations

import json
import re
from collections.abc import Callable
from typing import Any

from app.gateway.base import ProviderError, ProviderResponse

Handler = Callable[[dict[str, Any], float, int], dict[str, Any]]

_DECISION_CUE = re.compile(
    r"\b(kita (pakai|pilih|gunakan)|sepakat|diputuskan|fix(nya)?|deal)\b", re.IGNORECASE
)
_WORD = re.compile(r"\w+", re.UNICODE)


def _sentence_with_cue(body: str) -> str | None:
    for sent in re.split(r"(?<=[.!?])\s+", body):
        if _DECISION_CUE.search(sent):
            return sent.strip()
    return None


def heuristic_extract(payload: dict[str, Any], temperature: float, idx: int) -> dict[str, Any]:
    candidates = []
    for m in payload.get("messages", []):
        sent = _sentence_with_cue(m["body"])
        if not sent:
            continue
        ev = [{"field": "title", "message_id": str(m["id"]), "quote": sent},
              {"field": "chosen_option", "message_id": str(m["id"]), "quote": sent}]
        content: dict[str, Any] = {"title": sent[:120], "chosen_option": sent}
        why = re.search(r"\b(karena|soalnya|alasannya)\b(.+)", m["body"], re.IGNORECASE)
        if why:
            reason = (why.group(1) + why.group(2)).strip()
            content["rationale"] = reason
            ev.append({"field": "rationale", "message_id": str(m["id"]), "quote": reason})
        candidates.append({"type": "decision", "content": content, "evidence": ev,
                           "kc_names": []})
    return {"candidates": candidates}


def heuristic_tag_kc(payload: dict[str, Any], temperature: float, idx: int) -> dict[str, Any]:
    text = payload["item_text"].casefold()
    for kc in payload.get("existing_kcs", []):
        if any(w in text for w in _WORD.findall(kc.casefold()) if len(w) > 3):
            return {"kcs": [{"kc_name": kc, "is_new": False}]}
    words = [w for w in _WORD.findall(payload["item_text"]) if len(w) > 3][:3]
    return {"kcs": [{"kc_name": " ".join(words) or "Umum", "is_new": True}]}


def heuristic_qgen(payload: dict[str, Any], temperature: float, idx: int) -> dict[str, Any]:
    item = payload["item"]
    ref = item.get("chosen_option") or item.get("title", "")
    if item.get("rationale"):
        ref = f"{ref}. {item['rationale']}"
    out = []
    for level in payload["bloom_levels"]:
        stem = {1: f"Apa yang diputuskan tim tentang '{item.get('title')}', dan mengapa?",
                2: f"Apa konsekuensinya bila tim tidak memilih opsi pada '{item.get('title')}'?",
                3: f"Bagaimana keputusan '{item.get('title')}' berdampak ke bagian lain?"}[level]
        out.append({"stem": stem, "bloom_level": level, "reference_answer": ref,
                    "rubric": [{"id": "pilihan", "description": "Menyebut opsi yang dipilih"},
                               {"id": "alasan", "description": "Menyebut alasan"}]})
    return {"questions": out}


def _overlap(a: str, b: str) -> float:
    wa = {w.casefold() for w in _WORD.findall(a) if len(w) > 2}
    wb = {w.casefold() for w in _WORD.findall(b) if len(w) > 2}
    return len(wa & wb) / max(len(wb), 1)


def heuristic_grade(payload: dict[str, Any], temperature: float, idx: int) -> dict[str, Any]:
    ov = _overlap(payload["answer"], payload["reference_answer"])
    grade = 2 if ov >= 0.5 else 1 if ov >= 0.2 else 0
    return {"criteria": {}, "grade": grade,
            "feedback": "Jawabanmu sudah merujuk keputusan tim." if grade == 2
            else "Coba sebutkan opsi yang dipilih tim beserta alasannya."}


def heuristic_agent(payload: dict[str, Any], temperature: float, idx: int) -> dict[str, Any]:
    q = payload["question"]
    ranked = sorted(payload.get("context", []), key=lambda r: -_overlap(r["text"], q))
    hits = [r for r in ranked if _overlap(r["text"], q) > 0][:2]
    if not hits:
        return {"answer": "Tidak ada di memori tim.", "cited_item_ids": [], "abstained": True}
    return {"answer": " ".join(r["text"] for r in hits),
            "cited_item_ids": [str(r["item_id"]) for r in hits], "abstained": False}


def heuristic_briefing(payload: dict[str, Any], temperature: float, idx: int) -> dict[str, Any]:
    ctx = payload.get("context", [])
    if not ctx:
        return {"reply": "Belum ada keputusan tim yang tercatat.", "cited_item_ids": []}
    first = ctx[0]
    return {"reply": f"Menurutmu, kenapa tim memilih: {first['text'][:120]}?",
            "cited_item_ids": [str(first["item_id"])]}


DEFAULT_HANDLERS: dict[str, Handler] = {
    "extract": heuristic_extract,
    "tag_kc": heuristic_tag_kc,
    "qgen": heuristic_qgen,
    "answerable": lambda p, t, i: {"answerable": True, "reason": "heuristik"},
    "grade": heuristic_grade,
    "agent": heuristic_agent,
    "briefing": heuristic_briefing,
}


class FakeProvider:
    def __init__(self, name: str = "fake", handlers: dict[str, Handler] | None = None,
                 fail_tasks: set[str] | None = None) -> None:
        self.name = name
        self.handlers = {**DEFAULT_HANDLERS, **(handlers or {})}
        self.fail_tasks = fail_tasks or set()
        self.calls: list[tuple[str, dict[str, Any]]] = []
        self._counter = 0

    async def complete(self, *, task: str, model: str, messages: list[dict[str, str]],
                       temperature: float, max_tokens: int, timeout: float,
                       payload: dict[str, Any]) -> ProviderResponse:
        self.calls.append((task, payload))
        if task in self.fail_tasks or "*" in self.fail_tasks:
            raise ProviderError(f"{self.name}: simulasi gagal untuk {task}")
        handler = self.handlers.get(task)
        if handler is None:
            raise ProviderError(f"{self.name}: tidak ada handler untuk {task}")
        self._counter += 1
        result = handler(payload, temperature, self._counter)
        text = result if isinstance(result, str) else json.dumps(result, ensure_ascii=False)
        tokens_in = sum(len(m["content"]) for m in messages) // 4
        return ProviderResponse(text, tokens_in, len(text) // 4)
