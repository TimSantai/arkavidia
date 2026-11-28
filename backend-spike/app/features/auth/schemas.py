from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class OAuthStartResponse(BaseModel):
    authorization_url: str
    state: str


class OAuthCallbackResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int | None = None
    user: UserProfile


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    display_name: str = Field(max_length=120)
    is_active: bool
    consent_explainback: bool
    consent_voice: bool
    consent_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class SupabaseOAuthUser(BaseModel):
    id: UUID
    email: str | None = None
    user_metadata: dict[str, Any] = Field(default_factory=dict)
    raw_user_meta_data: dict[str, Any] = Field(default_factory=dict)

    @property
    def metadata(self) -> dict[str, Any]:
        return self.user_metadata or self.raw_user_meta_data


class SupabaseTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int | None = None
    user: SupabaseOAuthUser
