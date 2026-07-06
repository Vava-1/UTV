"""
Application configuration for UNA TANTUM VOCE.

All secrets are env-only. Production fails fast if defaults are detected.
Optional services (Stripe, OpenAI, S3, YouTube, Email) degrade gracefully
when their keys are missing — features are disabled, not crashed.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    # ─── App ────────────────────────────────────────────────────────────────
    APP_NAME: str = "UNA TANTUM VOCE"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ─── Database ───────────────────────────────────────────────────────────
    # SQLite for dev (file-based), PostgreSQL for production
    DATABASE_URL: str = "sqlite:///./utv.db"

    # ─── Security ───────────────────────────────────────────────────────────
    # Auto-generated per-instance if not set (dev only). MUST be set in prod.
    SECRET_KEY: str = secrets.token_hex(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # ─── Admin Setup ────────────────────────────────────────────────────────
    # Header required to call /api/auth/admin-setup (one-time admin bootstrap)
    ADMIN_SETUP_SECRET: Optional[str] = None

    # Admin credentials — MUST be set via env vars in production
    ADMIN_EMAIL: Optional[str] = None
    ADMIN_PASSWORD: Optional[str] = None

    # ─── AWS S3 / Cloudflare R2 (optional — local disk fallback in dev) ────
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = None
    S3_ENDPOINT_URL: Optional[str] = None
    S3_CUSTOM_DOMAIN: Optional[str] = None

    # ─── Stripe (optional — payments disabled if not set) ──────────────────
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # ─── Email (optional — silently skipped if not configured) ─────────────
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: Optional[str] = None
    EMAIL_PASS: Optional[str] = None
    EMAIL_FROM: str = "UNA TANTUM VOCE <noreply@unatantumvoce.org>"
    EMAIL_ENABLED: bool = False

    # ─── OpenAI (optional — AI assistant uses keyword fallback) ────────────
    OPENAI_API_KEY: Optional[str] = None

    # ─── YouTube Data API v3 (optional — video sync disabled without) ─────
    YOUTUBE_API_KEY: Optional[str] = None
    # Channel ID for @UNATANTUMVOCEOFFICIAL — leave empty to auto-detect via handle
    YOUTUBE_CHANNEL_ID: Optional[str] = None

    # ─── Frontend URL (CORS + email links) ─────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()


# ─── Production Safety Checks ────────────────────────────────────────────────
# Fail fast if critical secrets are missing or weak defaults are detected.
if settings.APP_ENV == "production":
    weak_admin_combos = {
        ("admin@utv.com", "utv2025"),
        ("admin@utv.com", "admin123"),
        ("admin@unatantumvoce.org", "utv2025"),
        ("admin@unatantumvoce.org", "admin123"),
    }

    if not settings.ADMIN_SETUP_SECRET:
        raise RuntimeError(
            "CRITICAL: ADMIN_SETUP_SECRET must be set in production. "
            "Generate with: openssl rand -hex 32"
        )

    if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 32:
        raise RuntimeError(
            "CRITICAL: SECRET_KEY must be a strong random value (>=32 chars) in production. "
            "Generate with: openssl rand -hex 32"
        )

    if (settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD) in weak_admin_combos:
        raise RuntimeError(
            "CRITICAL: Default admin credentials detected. "
            "Set ADMIN_EMAIL and ADMIN_PASSWORD to unique values via environment variables."
        )

    if not settings.STRIPE_WEBHOOK_SECRET and settings.STRIPE_SECRET_KEY:
        # Warning, not error — Stripe payments work but webhooks will be rejected
        import warnings
        warnings.warn(
            "STRIPE_WEBHOOK_SECRET not set — Stripe webhooks will be rejected in production.",
            RuntimeWarning,
        )
