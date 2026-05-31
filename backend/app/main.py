"""UTV Platform main application entry point."""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.config import settings
from app.database import engine, Base
from app.middleware.logging import LoggingMiddleware
from app.routers import (
    auth, users, music, books, scores, videos,
    events, orders, checkout, ai_chat, search, admin, analytics,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("utv")


app = FastAPI(
    title="Una Tantum Voce API",
    description="One Voice, One Time - Classical & Gospel Music Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# Fix 4: CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Request-ID"],
)

# Request logging middleware
app.add_middleware(LoggingMiddleware)


# Fix 3: Health check as FIRST route
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for Docker and load balancers."""
    return {
        "status": "healthy",
        "service": "utv-backend",
        "version": "2.0.0",
    }


@app.get("/")
async def root():
    """Redirect root to API documentation."""
    return RedirectResponse(url="/docs")


# Include all routers with /api/v1 prefix
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(music.router, prefix="/api/v1")
app.include_router(books.router, prefix="/api/v1")
app.include_router(scores.router, prefix="/api/v1")
app.include_router(videos.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(checkout.router, prefix="/api/v1")
app.include_router(tickets.router, prefix="/api/v1")
app.include_router(ai_chat.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")


# Fix 5: Startup event to create tables and run migrations
@app.on_event("startup")
async def on_startup():
    """Initialize database tables on startup."""
    try:
        logger.info("Creating database tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ready")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unhandled exceptions gracefully."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# --- Added from GitHub ---
try:
    from app.routers import webhooks, uploads, newsletter
    app.include_router(webhooks.router, prefix='/api/v1')
    app.include_router(uploads.router, prefix='/api/v1')
    app.include_router(newsletter.router, prefix='/api/v1')
except ImportError:
    pass
