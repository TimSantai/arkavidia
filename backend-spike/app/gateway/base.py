"""Tipe dasar LLM gateway (blueprint 01 bagian 6)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol
from uuid import UUID


class ProviderError(Exception):
    """Kegagalan yang boleh di-fallback (timeout, 429, 5xx, koneksi)."""


@dataclass(frozen=True, slots=True)
class ProviderResponse:
    text: str
    tokens_in: int
    tokens_out: int


class ChatProvider(Protocol):
    name: str

    async def complete(
        self, *, task: str, model: str, messages: list[dict[str, str]], temperature: float,
        max_tokens: int, timeout: float, payload: dict[str, Any],
    ) -> ProviderResponse: ...


class EmbeddingProvider(Protocol):
    name: str
    model: str
    dim: int

    async def embed(self, texts: list[str]) -> list[list[float]]: ...


@dataclass(frozen=True, slots=True)
class Route:
    provider: ChatProvider
    model: str


@dataclass(frozen=True, slots=True)
class TeamContext:
    team_id: UUID | None
    tier: str = "free"
    user_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class DataLabels:
    has_private: bool = False
    has_pii: bool = False


@dataclass(slots=True)
class CallRecord:
    team_id: UUID | None
    task: str
    provider: str
    model: str
    prompt_version: str
    input_hash: str
    tokens_in: int = 0
    tokens_out: int = 0
    latency_ms: int = 0
    cost_idr: int = 0
    status: str = "ok"
    error: str | None = None
    response_text: str | None = None
    price_version_id: UUID | None = None
    extra: dict[str, Any] = field(default_factory=dict)


class Recorder(Protocol):
    async def record(self, rec: CallRecord) -> None: ...

    async def replay(self, task: str, input_hash: str) -> str | None: ...

    async def tokens_used_today(self, team_id: UUID) -> tuple[int, int]:
        """(token terpakai hari ini, kuota harian)."""
        ...


class Meter(Protocol):
    """Pre-authorization kredit untuk tier Pro."""

    async def before(self, team: TeamContext, provider: str, model: str, est_tokens_in: int,
                     max_tokens_out: int) -> Any: ...

    async def after(self, handle: Any, tokens_in: int, tokens_out: int) -> int: ...

    async def abort(self, handle: Any) -> None: ...


class NullRecorder:
    def __init__(self) -> None:
        self.records: list[CallRecord] = []

    async def record(self, rec: CallRecord) -> None:
        self.records.append(rec)

    async def replay(self, task: str, input_hash: str) -> str | None:
        for r in reversed(self.records):
            if r.task == task and r.input_hash == input_hash and r.status == "ok":
                return r.response_text
        return None

    async def tokens_used_today(self, team_id: UUID) -> tuple[int, int]:
        return 0, 10**12
