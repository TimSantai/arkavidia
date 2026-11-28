from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel, Field

from app.errors import BadRequest
from app.features.auth import CurrentUser
from app.features.auth.schemas import OAuthCallbackResponse, OAuthStartResponse, UserProfile
from app.features.auth.service import AuthService

router = APIRouter(prefix="/v1/auth", tags=["auth"])


class OAuthCallbackQuery(BaseModel):
    code: str | None = Field(default=None, min_length=1)
    state: str | None = None
    error: str | None = None


def _service(request: Request) -> AuthService:
    return AuthService(request.app.state.db, request.app.state.settings)


AuthServiceDep = Annotated[AuthService, Depends(_service)]


@router.get("/oauth/{provider}", response_model=OAuthStartResponse)
async def start_oauth(provider: str, service: AuthServiceDep) -> OAuthStartResponse:
    authorization_url, state = service.authorization_url(provider)
    return OAuthStartResponse(authorization_url=authorization_url, state=state)


@router.get("/callback", response_model=OAuthCallbackResponse)
async def oauth_callback(
    query: Annotated[OAuthCallbackQuery, Query()],
    service: AuthServiceDep,
) -> OAuthCallbackResponse:
    if query.error:
        raise BadRequest(f"OAuth ditolak provider: {query.error}")
    if query.code is None:
        raise BadRequest("Kode OAuth tidak ditemukan")
    return await service.exchange_code(query.code, query.state)


@router.get("/me", response_model=UserProfile)
async def auth_me(user: CurrentUser, service: AuthServiceDep) -> UserProfile:
    return await service.current_profile(user.user_id, user.claims)
