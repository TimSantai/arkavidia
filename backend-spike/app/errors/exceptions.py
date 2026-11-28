"""Error domain + respons RFC 9457 (application/problem+json)."""

from __future__ import annotations

from typing import Any


class AppError(Exception):
    status: int = 500
    title: str = "Kesalahan internal"
    type_: str = "about:blank"

    def __init__(self, detail: str | None = None, **extra: Any) -> None:
        super().__init__(detail or self.title)
        self.detail = detail or self.title
        self.extra = extra


class BadRequest(AppError):
    status, title, type_ = 400, "Permintaan tidak valid", "/problems/bad-request"


class Unauthorized(AppError):
    status, title, type_ = 401, "Tidak terautentikasi", "/problems/unauthorized"


class InsufficientCredit(AppError):
    status, title, type_ = 402, "Saldo kredit tidak cukup", "/problems/insufficient-credit"


class PolicyDenied(AppError):
    status, title, type_ = 403, "Ditolak policy", "/problems/policy-denied"


class NotFound(AppError):
    status, title, type_ = 404, "Tidak ditemukan", "/problems/not-found"


class Conflict(AppError):
    status, title, type_ = 409, "Konflik state", "/problems/conflict"


class InvalidAIOutput(AppError):
    status, title, type_ = 422, "Output AI tidak valid", "/problems/invalid-ai-output"


class QuotaExceeded(AppError):
    status, title, type_ = 429, "Kuota tim habis", "/problems/quota-exceeded"


class AIUnavailable(AppError):
    status, title, type_ = 503, "Layanan AI tidak tersedia", "/problems/ai-unavailable"


def problem(status: int, title: str, detail: str, type_: str, request_id: str | None,
            **extra: Any) -> dict[str, Any]:
    body: dict[str, Any] = {"type": type_, "title": title, "status": status, "detail": detail}
    if request_id:
        body["request_id"] = request_id
    body.update(extra)
    return body
