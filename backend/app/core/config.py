from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    # App
    APP_NAME: str = "UNA TANTUM VOCE"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/utv_db"

    # Security — MUST be overridden in production via environment variables
    # No hardcoded production secrets; auto-generate only for local dev if missing
    SECRET_KEY: str = secrets.token_hex(32)  # Auto-generated per-instance if not set
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Admin Setup — required header to call /api/auth/admin-setup
    ADMIN_SETUP_SECRET: Optional[str] = None

    # Admin credentials — MUST be set via environment variables in production
    # These defaults are for LOCAL DEVELOPMENT ONLY and will not work in production
    # because ADMIN_SETUP_SECRET must also be set
    ADMIN_EMAIL: Optional[str] = None  # Must be set via env var
    ADMIN_PASSWORD: Optional[str] = None  # Must be set via env var

    # AWS S3 / Cloudflare R2 (optional — falls back to local disk ONLY in dev)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = None
    S3_ENDPOINT_URL: Optional[str] = None
    S3_CUSTOM_DOMAIN: Optional[str] = None

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Email (Gmail SMTP — use App Password)
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: Optional[str] = None
    EMAIL_PASS: Optional[str] = None
    EMAIL_FROM: str = "UNA TANTUM VOCE <noreply@unatantumvoce.org>"
    EMAIL_ENABLED: bool = False

    # OpenAI (optional — AI assistant disabled if not set)
    OPENAI_API_KEY: Optional[str] = None

    # Frontend URL (used for CORS + redirect URLs)
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Production safety checks — fail fast if critical secrets are missing
if settings.APP_ENV == "production":
    if not settings.ADMIN_SETUP_SECRET:
        raise RuntimeError(
            "CRITICAL: ADMIN_SETUP_SECRET must be set in production. "
            "Generate one with: openssl rand -hex 32"
        )
    if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 32:
        raise RuntimeError(
            "CRITICAL: SECRET_KEY must be set to a strong random value in production. "
            "Generate one with: openssl rand -hex 32"
        )
    if settings.ADMIN_EMAIL == "admin@utv.com" or settings.ADMIN_PASSWORD == "utv2025":
        raise RuntimeError(
            "CRITICAL: Default admin credentials must not be used in production. "
            "Set ADMIN_EMAIL and ADMIN_PASSWORD to unique values via environment variables."
        )
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise RuntimeWarning(
            "WARNING: STRIPE_WEBHOOK_SECRET is not set. "
            "Stripe webhooks will be rejected in production."
        )
