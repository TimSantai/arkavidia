"""Aplikasi FastAPI BERSAMA (SPIKE pra-Hacking Day). Jalankan: `uvicorn app.main:app`."""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import Database, Settings, get_settings
from app.errors import AppError, problem
from app.features import agents, auth, brain, checks, credits, health, messages, passport, teams
from app.features.auth import TokenVerifier
from app.gateway.base import ChatProvider
from app.gateway.factory import build_gateway
from app.log import configure_logging

log = structlog.get_logger(__name__)
PROBLEM = "application/problem+json"


def create_app(settings: Settings | None = None,
               provider_override: ChatProvider | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_format)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        database = Database(settings.database_url, min_size=settings.db_pool_min,
                            max_size=settings.db_pool_max,
                            statement_cache_size=settings.db_statement_cache_size)
        await database.connect()
        assert database.pool is not None
        app.state.db = database
        app.state.gateway = build_gateway(settings, database.pool, provider_override)
        try:
            yield
        finally:
            await database.close()

    app = FastAPI(title="BERSAMA API (spike)", version="0.1.0", lifespan=lifespan)
    app.state.settings = settings
    app.state.verifier = TokenVerifier(settings)
    app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list, allow_credentials=True,
                       allow_methods=["*"], allow_headers=["*"])

    @app.middleware("http")
    async def request_id(request: Request, call_next):
        rid = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = rid
        structlog.contextvars.bind_contextvars(request_id=rid, path=request.url.path)
        try:
            response = await call_next(request)
        finally:
            structlog.contextvars.clear_contextvars()
        response.headers["x-request-id"] = rid
        return response

    @app.exception_handler(AppError)
    async def app_error(request: Request, exc: AppError) -> JSONResponse:
        rid = getattr(request.state, "request_id", None)
        if exc.status >= 500:
            log.error("app.error", status=exc.status, detail=exc.detail)
        return JSONResponse(problem(exc.status, exc.title, exc.detail, exc.type_, rid, **exc.extra),
                            status_code=exc.status, media_type=PROBLEM)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        rid = getattr(request.state, "request_id", None)
        errors = [{"loc": list(e["loc"]), "msg": e["msg"]} for e in exc.errors()]
        return JSONResponse(problem(400, "Permintaan tidak valid", "Validasi gagal",
                                    "/problems/bad-request", rid, errors=errors),
                            status_code=400, media_type=PROBLEM)

    @app.exception_handler(Exception)
    async def unhandled(request: Request, exc: Exception) -> JSONResponse:
        rid = getattr(request.state, "request_id", None)
        log.exception("unhandled", error=str(exc))
        return JSONResponse(problem(500, "Kesalahan internal", "Terjadi kesalahan tak terduga",
                                    "about:blank", rid), status_code=500, media_type=PROBLEM)

    for r in (health, auth, teams, messages, brain, passport, agents, checks, credits):
        app.include_router(r.router)
    return app


def _default_app() -> FastAPI:
    return create_app()


app = None  # dibuat lazily oleh uvicorn --factory: `uvicorn app.main:_default_app --factory`
