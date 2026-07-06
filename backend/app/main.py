"""
FastAPI application factory.

Production safety:
- init_db() (Base.metadata.create_all) runs only in dev — production relies
  on Alembic migrations (`alembic upgrade head`)
- Local upload dir created only in dev
- Security headers + CORS configured per environment
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from app.core.config import settings
from app.db.database import init_db
from app.api import (
    auth, contents, orders, tickets, chat, admin, webhooks,
    uploads, newsletter, youtube,
)
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown."""
    logger.info(f"Starting {settings.APP_NAME} (env={settings.APP_ENV})...")

    # In dev, auto-create tables. In production, rely on Alembic migrations.
    if settings.APP_ENV != "production":
        init_db()
        logger.info("Database tables ensured (dev mode).")
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        logger.info(f"Upload directory ready: {upload_dir.absolute()}")
    else:
        logger.info("Production mode — skipping auto-create. Run `alembic upgrade head`.")

    yield
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "UNA TANTUM VOCE — Integrated Artistic and Educational Platform | "
        "Music Development for All"
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
]

if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL)

# In production, only allow the configured frontend URL
if settings.APP_ENV == "production":
    allowed_origins = [settings.FRONTEND_URL] if settings.FRONTEND_URL else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)


# ─── Security Headers ────────────────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request, call_next):
    """Add security headers to every response."""
    response = await call_next(request)

    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    if settings.APP_ENV == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.youtube.com https://s.ytimg.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' https://api.stripe.com https://www.googleapis.com; "
            "frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://youtube.com; "
            "media-src 'self' https: blob:;"
        )
        response.headers["Content-Security-Policy"] = csp

    return response


# ─── Static Files (dev only) ────────────────────────────────────────────────
if settings.APP_ENV != "production":
    upload_path = Path("uploads")
    upload_path.mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── API Routers ────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(contents.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")
app.include_router(youtube.router, prefix="/api")


# ─── Health & Root ──────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "tagline": "Music Development for All",
        "version": "2.0.0",
        "status": "operational",
        "docs": "/docs",
        "modules": [
            "music_streaming",
            "digital_library",
            "e_commerce",
            "concert_ticketing",
            "newsletter",
            "ai_assistant",
            "youtube_sync",
            "admin_dashboard",
        ],
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME, "env": settings.APP_ENV}
