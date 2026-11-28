"""Error domain + respons RFC 9457 (application/problem+json)."""

from app.errors.exceptions import (
    AIUnavailable,
    AppError,
    BadRequest,
    Conflict,
    InsufficientCredit,
    InvalidAIOutput,
    NotFound,
    PolicyDenied,
    QuotaExceeded,
    Unauthorized,
    problem,
)

__all__ = [
    "AIUnavailable",
    "AppError",
    "BadRequest",
    "Conflict",
    "InsufficientCredit",
    "InvalidAIOutput",
    "NotFound",
    "PolicyDenied",
    "QuotaExceeded",
    "Unauthorized",
    "problem",
]
