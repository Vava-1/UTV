from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "UNA TANTUM VOCE"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/utv_db"

    # Security
    SECRET_KEY: str = "una-tantum-voce-dev-secret-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Admin Setup — required header to call /api/auth/admin-setup
    ADMIN_SETUP_SECRET: Optional[str] = None

    # Admin credentials (used by admin-setup endpoint)
    ADMIN_EMAIL: str = "admin@utv.com"
    ADMIN_PASSWORD: str = "utv2025"  # Change in production

    # AWS S3 / Cloudflare R2 (optional — falls back to local disk if not set)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = None
    S3_ENDPOINT_URL: Optional[str] = None  # Add custom endpoint (e.g. for Cloudflare R2)
    S3_CUSTOM_DOMAIN: Optional[str] = None  # Public URL domain to serve files (e.g. R2 public bucket URL)

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Email (Gmail SMTP — use App Password)
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: Optional[str] = None
    EMAIL_PASS: Optional[str] = None
    EMAIL_FROM: str = "UNA TANTUM VOCE <noreply@utv.com>"
    EMAIL_ENABLED: bool = False  # Set to True when EMAIL_USER + EMAIL_PASS are set

    # OpenAI (optional — AI assistant disabled if not set)
    OPENAI_API_KEY: Optional[str] = None

    # Frontend URL (used for CORS + redirect URLs)
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
