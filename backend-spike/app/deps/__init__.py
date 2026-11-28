"""Dependency injection FastAPI untuk state aplikasi."""

from app.deps.providers import db, gateway, settings

__all__ = ["db", "gateway", "settings"]
