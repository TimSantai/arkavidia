"""LLM gateway: routing per tier/tugas, fallback, validasi skema, aturan data Free,
kuota harian, metering, dan mode replay demo."""

from __future__ import annotations

import asyncio
import hashlib
import json
import re
import time
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any, TypeVar

import structlog
from pydantic import BaseModel, ValidationError

from app.ai.prompts import RenderedPrompt
from app.errors import AIUnavailable, InvalidAIOutput, PolicyDenied, QuotaExceeded
from app.gateway.base import (
    CallRecord,
    DataLabels,
    EmbeddingProvider,
    Meter,
    ProviderError,
    ProviderResponse,
    Recorder,
    Route,
    TeamContext,
)

log = structlog.get_logger(__name__)
T = TypeVar("T", bound=BaseModel)

NO_LABELS = DataLabels()
_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def input_hash(task: str, model_hint: str, messages: Sequence[Mapping[str, str]],
               temperature: float, sample_index: int) -> str:
    raw = json.dumps([task, model_hint, list(messages), round(temperature, 3), sample_index],
                     ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()


def parse_json_object(text: str) -> Any:
    cleaned = _FENCE.sub("", text.strip())
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start == -1 or end <= start:
            raise
        return json.loads(cleaned[start : end + 1])


@dataclass(frozen=True, slots=True)
class StructuredResult[T]:
    value: T
    provider: str
    model: str
    prompt_version: str


class Gateway:
    def __init__(
        self,
        routes: Mapping[str, Mapping[str, Sequence[Route]]],
        embedder: EmbeddingProvider,
        recorder: Recorder,
        meter: Meter | None = None,
        *,
        replay: bool = False,
        default_timeout: float = 20.0,
    ) -> None:
        self._routes = routes  # tier -> task -> [Route, ...] (urutan = prioritas fallback)
        self.embedder = embedder
        self._recorder = recorder
        self._meter = meter
        self._replay = replay
        self._timeout = default_timeout

    # ───────── aturan data ─────────
    @staticmethod
    def check_data_rule(team: TeamContext, labels: DataLabels) -> None:
        """Tier Free memakai kuota gratis provider (Unpaid Services): M1 dan PII dilarang."""
        if team.tier == "free" and (labels.has_private or labels.has_pii):
            raise PolicyDenied("Tier Free tidak boleh mengirim memori pribadi atau PII ke provider")

    async def _check_quota(self, team: TeamContext) -> None:
        if team.team_id is None:
            return
        used, quota = await self._recorder.tokens_used_today(team.team_id)
        if used >= quota:
            raise QuotaExceeded(f"Kuota token harian tim habis ({used}/{quota})")

    def _routes_for(self, team: TeamContext, task: str) -> Sequence[Route]:
        tier_routes = self._routes.get(team.tier) or self._routes.get("free") or {}
        routes = tier_routes.get(task) or tier_routes.get("default") or ()
        if not routes:
            raise AIUnavailable(f"Tidak ada rute model untuk tugas '{task}'")
        return routes

    # ───────── panggilan ─────────
    async def _call_once(self, team: TeamContext, task: str, route: Route,
                         prompt: RenderedPrompt, messages: list[dict[str, str]],
                         temperature: float, max_tokens: int, timeout: float,
                         ihash: str) -> ProviderResponse:
        handle = None
        if self._meter is not None and team.tier == "pro":
            est_in = sum(len(m["content"]) for m in messages) // 3 + 16
            handle = await self._meter.before(team, route.provider.name, route.model, est_in,
                                              max_tokens)
        start = time.perf_counter()
        rec = CallRecord(team.team_id, task, route.provider.name, route.model, prompt.prompt_id,
                         ihash)
        try:
            resp = await asyncio.wait_for(
                route.provider.complete(task=task, model=route.model, messages=messages,
                                        temperature=temperature, max_tokens=max_tokens,
                                        timeout=timeout, payload=prompt.payload),
                timeout=timeout,
            )
        except (ProviderError, TimeoutError) as exc:
            rec.status, rec.error = "error", f"{type(exc).__name__}: {exc}"[:500]
            rec.latency_ms = int((time.perf_counter() - start) * 1000)
            if handle is not None:
                await self._meter.abort(handle)  # type: ignore[union-attr]
            await self._recorder.record(rec)
            raise ProviderError(rec.error) from exc
        rec.latency_ms = int((time.perf_counter() - start) * 1000)
        rec.tokens_in, rec.tokens_out, rec.response_text = resp.tokens_in, resp.tokens_out, resp.text
        if handle is not None:
            rec.cost_idr = await self._meter.after(handle, resp.tokens_in, resp.tokens_out)  # type: ignore[union-attr]
        await self._recorder.record(rec)
        return resp

    async def structured(
        self,
        task: str,
        prompt: RenderedPrompt,
        out: type[T],
        *,
        team: TeamContext,
        labels: DataLabels = NO_LABELS,
        temperature: float = 0.0,
        max_tokens: int = 1500,
        timeout: float | None = None,
        sample_index: int = 0,
    ) -> StructuredResult[T]:
        self.check_data_rule(team, labels)
        await self._check_quota(team)
        timeout = timeout or self._timeout
        routes = self._routes_for(team, task)
        ihash = input_hash(task, team.tier, prompt.messages, temperature, sample_index)

        if self._replay:
            cached = await self._recorder.replay(task, ihash)
            if cached is not None:
                return StructuredResult(out.model_validate(parse_json_object(cached)),
                                        "replay", "replay", prompt.prompt_id)

        last_error: str | None = None
        for route in routes:
            messages = list(prompt.messages)
            for attempt in range(2):  # 1 kali coba ulang bila output tidak valid
                try:
                    resp = await self._call_once(team, task, route, prompt, messages,
                                                 temperature, max_tokens, timeout, ihash)
                except ProviderError as exc:
                    last_error = str(exc)
                    log.warning("llm.fallback", task=task, provider=route.provider.name,
                                error=last_error)
                    break  # pindah ke provider berikutnya
                try:
                    value = out.model_validate(parse_json_object(resp.text))
                    return StructuredResult(value, route.provider.name, route.model,
                                            prompt.prompt_id)
                except (json.JSONDecodeError, ValidationError) as exc:
                    last_error = f"output tidak valid: {exc}"[:800]
                    if attempt == 0:
                        messages = [*messages, {"role": "assistant", "content": resp.text},
                                    {"role": "user", "content":
                                     "Output tidak sesuai skema. Galat: " + last_error +
                                     "\nKembalikan ulang HANYA JSON yang valid."}]
                        continue
                    raise InvalidAIOutput(last_error) from exc
        raise AIUnavailable(f"Semua provider gagal untuk '{task}': {last_error}")

    async def samples(self, task: str, prompt: RenderedPrompt, out: type[T], k: int, *,
                      team: TeamContext, labels: DataLabels = NO_LABELS,
                      temperature: float = 0.7) -> list[StructuredResult[T]]:
        """k sampel independen (self-consistency), paralel."""
        return list(await asyncio.gather(*[
            self.structured(task, prompt, out, team=team, labels=labels,
                            temperature=temperature, sample_index=i) for i in range(k)
        ]))

    async def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            vectors = await self.embedder.embed(texts)
        except ProviderError as exc:
            raise AIUnavailable(f"Embedding gagal: {exc}") from exc
        for v in vectors:
            if len(v) != self.embedder.dim:
                raise InvalidAIOutput(f"Dimensi embedding {len(v)} != {self.embedder.dim}")
        return vectors
