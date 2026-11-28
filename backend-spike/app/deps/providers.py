from __future__ import annotations

from fastapi import Request

from app.config import Database, Settings
from app.gateway.router import Gateway


def db(request: Request) -> Database:
    return request.app.state.db


def gateway(request: Request) -> Gateway:
    return request.app.state.gateway


def settings(request: Request) -> Settings:
    return request.app.state.settings
