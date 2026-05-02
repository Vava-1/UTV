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
    SECRET_KEY: str = "your-super-secret-key-change-in-production-una-tantum-voce-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # AWS S3
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = None
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # Admin
    ADMIN_EMAIL: str = "admin@utv.com"
    ADMIN_PASSWORD: str = "admin123"  # Change in production
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
