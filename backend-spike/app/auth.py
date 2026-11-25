"""Verifikasi JWT Supabase dan dependency `Principal`."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated, Any
from uuid import UUID

import jwt
from fastapi import Depends, Header, Request

from app.config import Settings, get_settings
from app.errors import Unauthorized


@dataclass(frozen=True, slots=True)
class Principal:
    user_id: UUID
    claims: dict[str, Any]


class TokenVerifier:
    def __init__(self, settings: Settings) -> None:
        self._s = settings
        self._jwks = jwt.PyJWKClient(settings.supabase_jwks_url) if settings.supabase_jwks_url else None
        if self._jwks is None and settings.supabase_jwt_secret is None:
            raise RuntimeError("Set SUPABASE_JWKS_URL atau SUPABASE_JWT_SECRET")

    def verify(self, token: str) -> dict[str, Any]:
        opts: dict[str, Any] = {"require": ["sub", "exp"]}
        try:
            if self._jwks is not None:
                key = self._jwks.get_signing_key_from_jwt(token).key
                algs = ["RS256", "ES256", "EdDSA"]
            else:
                key = self._s.supabase_jwt_secret.get_secret_value()  # type: ignore[union-attr]
                algs = ["HS256"]
            claims = jwt.decode(token, key, algorithms=algs, audience=self._s.supabase_jwt_audience,
                                issuer=self._s.supabase_jwt_issuer, options=opts)
        except jwt.PyJWTError as exc:
            raise Unauthorized(f"Token tidak valid: {exc}") from exc
        if claims.get("role") not in (None, "authenticated"):
            raise Unauthorized("Hanya token pengguna terautentikasi yang diterima")
        return claims


async def current_principal(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),  # noqa: B008
) -> Principal:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise Unauthorized("Header Authorization: Bearer <token> wajib")
    verifier: TokenVerifier = request.app.state.verifier
    claims = verifier.verify(authorization.split(" ", 1)[1].strip())
    try:
        uid = UUID(claims["sub"])
    except ValueError as exc:
        raise Unauthorized("sub bukan UUID") from exc
    return Principal(uid, claims)


CurrentUser = Annotated[Principal, Depends(current_principal)]
