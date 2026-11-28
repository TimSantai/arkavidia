from __future__ import annotations

import time
from typing import Any
from urllib.parse import urlencode
from uuid import UUID

import httpx
import jwt

from app.config import Database, Settings
from app.errors import BadRequest, NotFound, Unauthorized
from app.features.auth.jwt import TokenVerifier
from app.features.auth.repository import AuthRepository
from app.features.auth.schemas import OAuthCallbackResponse, SupabaseTokenResponse, UserProfile


class AuthService:
    def __init__(
        self,
        database: Database,
        settings: Settings,
        repository: AuthRepository | None = None,
    ) -> None:
        self.database = database
        self.settings = settings
        self.repository = repository or AuthRepository()

    def authorization_url(self, provider: str) -> tuple[str, str]:
        if not self.settings.supabase_url or not self.settings.supabase_anon_key.get_secret_value():
            raise BadRequest("SUPABASE_URL dan SUPABASE_ANON_KEY wajib dikonfigurasi")
        provider = provider.strip().lower()
        if provider not in self.settings.supabase_oauth_providers_list:
            raise BadRequest("Provider OAuth tidak diizinkan")
        state_secret = self.settings.supabase_oauth_state_secret
        redirect_url = self.settings.supabase_oauth_redirect_url
        if state_secret is None or not redirect_url:
            raise BadRequest("OAuth belum dikonfigurasi")
        now = int(time.time())
        state = jwt.encode(
            {"provider": provider, "redirect_uri": redirect_url, "iat": now, "exp": now + 600},
            state_secret.get_secret_value(),
            algorithm="HS256",
        )
        query = urlencode({"provider": provider, "redirect_to": redirect_url, "state": state})
        return f"{self.settings.supabase_url.rstrip('/')}/auth/v1/authorize?{query}", state

    async def exchange_code(self, code: str, state: str | None) -> OAuthCallbackResponse:
        if not code.strip():
            raise BadRequest("Kode OAuth wajib diisi")
        self._verify_state(state)
        payload = await self._post_token(code)
        try:
            claims = TokenVerifier(self.settings).verify(payload.access_token)
            user_id = UUID(claims["sub"])
        except (Unauthorized, KeyError, ValueError) as exc:
            raise Unauthorized("Access token Supabase tidak valid") from exc
        if user_id != payload.user.id:
            raise Unauthorized("Identitas token OAuth tidak cocok")

        async with self.database.service_tx() as conn:
            profile = await self.repository.upsert_profile(
                conn,
                user_id=user_id,
                email=payload.user.email,
                metadata=payload.user.metadata,
            )
        return OAuthCallbackResponse(
            access_token=payload.access_token,
            refresh_token=payload.refresh_token,
            token_type=payload.token_type,
            expires_in=payload.expires_in,
            user=profile,
        )

    async def current_profile(self, user_id: UUID, claims: dict[str, Any]) -> UserProfile:
        async with self.database.user_tx(claims) as conn:
            profile = await self.repository.get_profile(conn, user_id)
        if profile is None:
            raise NotFound("Profil pengguna belum ada")
        if not profile.is_active:
            raise Unauthorized("Pengguna tidak aktif")
        return profile

    def _verify_state(self, state: str | None) -> None:
        secret = self.settings.supabase_oauth_state_secret
        if secret is None or not state:
            raise BadRequest("State OAuth wajib diisi")
        try:
            claims = jwt.decode(state, secret.get_secret_value(), algorithms=["HS256"])
        except jwt.PyJWTError as exc:
            raise BadRequest("State OAuth tidak valid atau kedaluwarsa") from exc
        if claims.get("redirect_uri") != self.settings.supabase_oauth_redirect_url:
            raise BadRequest("State OAuth tidak cocok")

    async def _post_token(self, code: str) -> SupabaseTokenResponse:
        url = f"{self.settings.supabase_url.rstrip('/')}/auth/v1/token"
        headers = {"apikey": self.settings.supabase_anon_key.get_secret_value()}
        try:
            async with httpx.AsyncClient(timeout=self.settings.supabase_auth_timeout_seconds) as client:
                response = await client.post(
                    url,
                    params={"grant_type": "authorization_code"},
                    json={"auth_code": code},
                    headers=headers,
                )
        except httpx.HTTPError as exc:
            raise Unauthorized("Layanan Supabase Auth tidak tersedia") from exc
        if response.is_error:
            raise Unauthorized("Kode OAuth tidak dapat ditukar")
        try:
            return SupabaseTokenResponse.model_validate(response.json())
        except (ValueError, TypeError) as exc:
            raise Unauthorized("Respons Supabase Auth tidak valid") from exc
