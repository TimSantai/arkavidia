"""Provider nyata (LiteLLM, opsional) dan embedder hashing deterministik.

LiteLLM dipakai sebagai pustaka, bukan proxy. Adapter ini belum diuji terhadap API
sungguhan di spike ini (tidak ada kunci API di lingkungan pengembangan); uji di H-7.
"""

from __future__ import annotations

import hashlib
import math
import re
from typing import Any

from app.gateway.base import ProviderError, ProviderResponse

_TOKEN = re.compile(r"\w+", re.UNICODE)


class LiteLLMProvider:
    def __init__(self, name: str, api_key: str | None = None, api_base: str | None = None) -> None:
        self.name = name
        self._api_key = api_key
        self._api_base = api_base

    async def complete(self, *, task: str, model: str, messages: list[dict[str, str]],
                       temperature: float, max_tokens: int, timeout: float,
                       payload: dict[str, Any]) -> ProviderResponse:
        try:
            import litellm
        except ImportError as exc:  # pragma: no cover
            raise ProviderError("litellm belum terpasang: uv pip install -e '.[llm]'") from exc
        try:
            resp = await litellm.acompletion(
                model=model, messages=messages, temperature=temperature, max_tokens=max_tokens,
                timeout=timeout, api_key=self._api_key, api_base=self._api_base,
                response_format={"type": "json_object"},
            )
        except Exception as exc:
            raise ProviderError(f"{type(exc).__name__}: {exc}") from exc
        usage = getattr(resp, "usage", None)
        text = resp.choices[0].message.content or ""
        return ProviderResponse(text, int(getattr(usage, "prompt_tokens", 0) or 0),
                                int(getattr(usage, "completion_tokens", 0) or 0))


class LiteLLMEmbedder:
    def __init__(self, model: str, dim: int, api_key: str | None = None) -> None:
        self.name, self.model, self.dim, self._api_key = "litellm", model, dim, api_key

    async def embed(self, texts: list[str]) -> list[list[float]]:
        try:
            import litellm
            resp = await litellm.aembedding(model=self.model, input=texts, api_key=self._api_key)
        except Exception as exc:
            raise ProviderError(f"{type(exc).__name__}: {exc}") from exc
        return [list(map(float, d["embedding"])) for d in resp.data]


class HashingEmbedder:
    """Embedding bag-of-words ber-hash (tes & demo offline). Bukan semantik sungguhan."""

    def __init__(self, dim: int = 768) -> None:
        self.name, self.model, self.dim = "hashing", f"hashing-{dim}", dim

    def _one(self, text: str) -> list[float]:
        vec = [0.0] * self.dim
        tokens = [t.casefold() for t in _TOKEN.findall(text)]
        for tok in tokens:
            h = int.from_bytes(hashlib.blake2b(tok.encode(), digest_size=8).digest(), "big")
            vec[h % self.dim] += 1.0 if (h >> 63) & 1 else -1.0
        norm = math.sqrt(sum(x * x for x in vec))
        if norm == 0:
            vec[0] = 1.0
            return vec
        return [x / norm for x in vec]

    async def embed(self, texts: list[str]) -> list[list[float]]:
        return [self._one(t) for t in texts]
