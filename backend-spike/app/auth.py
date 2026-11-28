"""Backward-compatible import surface for the migrated feature package."""

from app.features.auth import CurrentUser, Principal, TokenVerifier, current_principal

__all__ = ["CurrentUser", "Principal", "TokenVerifier", "current_principal"]
