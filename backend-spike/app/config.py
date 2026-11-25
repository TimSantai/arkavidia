"""Konfigurasi dari variabel lingkungan (lihat .env.example). Tidak ada rahasia di kode."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    log_format: str = "json"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    database_url: str = "postgresql://postgres:postgres@localhost:54322/postgres"
    db_pool_min: int = 1
    db_pool_max: int = 10
    # 0 bila lewat pgbouncer/Supavisor mode transaksi (prepared statement tidak aman).
    db_statement_cache_size: int = 100

    # Verifikasi JWT Supabase: pakai JWKS (kunci asimetris) bila diisi, selain itu HS256.
    supabase_jwks_url: str | None = None
    supabase_jwt_secret: SecretStr | None = None
    supabase_jwt_audience: str = "authenticated"
    supabase_jwt_issuer: str | None = None

    # LLM: "fake" untuk demo/tes offline, "litellm" untuk provider nyata.
    llm_backend: str = "fake"
    # Nama model format LiteLLM ("<provider>/<model>"). Sengaja kosong: pilih lewat protokol
    # pemilihan model (docs/blueprint/05 bagian 3) dan isi di .env.
    llm_free_primary_model: str = ""
    llm_free_fallback_model: str | None = None
    llm_pro_primary_model: str = ""
    llm_pro_fallback_model: str | None = None
    llm_free_tier_api_key: SecretStr | None = None
    llm_pro_api_key: SecretStr | None = None
    llm_fallback_api_key: SecretStr | None = None
    llm_timeout_seconds: float = 20.0
    embedding_backend: str = "hashing"
    embedding_model: str = "hashing-768"
    embedding_dim: int = 768  # harus sama dengan vector(768) di migrasi
    demo_replay: bool = False

    # Explain-back & metrik
    grader_k_free: int = 3
    grader_k_pro: int = 5
    conformal_alpha: float = 0.1
    conformal_min_n: int = 100
    mastery_tau: float = 0.7
    checks_per_week: int = 5
    context_token_budget: int = 3000

    # Ekstraksi per batch
    extract_batch_size: int = 20
    extract_idle_seconds: int = 60

    worker_poll_seconds: float = 1.0
    worker_id: str = Field(default="worker-1")

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
