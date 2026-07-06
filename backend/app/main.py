from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from app.core.config import settings
from app.db.database import init_db
from app.api import auth, contents, orders, tickets, chat, admin, webhooks, uploads, newsletter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    print(f"Starting {settings.APP_NAME}...")
    init_db()
    print("Database initialized.")

    # Ensure local upload directory exists (development only)
    if settings.APP_ENV != "production":
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        print(f"Upload directory ready: {upload_dir.absolute()}")

    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="UNA TANTUM VOCE — Integrated Artistic and Educational Platform | Music Development for All",
    version="1.0.0",
    lifespan=lifespan
)

# ─── CORS ────────────────────────────────────────────────────────────────────
# Build allowed origins dynamically
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
]

# Add configured frontend URL
if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL)

# In production, only allow the configured frontend URL
if settings.APP_ENV == "production":
    allowed_origins = [settings.FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# ─── Security Headers ────────────────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request, call_next):
    """Add security headers to every response."""
    response = await call_next(request)
    
    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # XSS protection (legacy but still useful)
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Referrer policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Permissions policy
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    
    if settings.APP_ENV == "production":
        # HSTS — only in production with HTTPS
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://js.stripe.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' https://api.stripe.com; "
            "frame-src https://js.stripe.com https://hooks.stripe.com; "
            "media-src 'self' https: blob:;"
        )
        response.headers["Content-Security-Policy"] = csp
    
    return response

# ─── Static Files (local uploads fallback — development only) ────────────────
if settings.APP_ENV != "production":
    upload_path = Path("uploads")
    upload_path.mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── API Routers ─────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(contents.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")


# ─── Health & Root ───────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "tagline": "Music Development for All",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "modules": [
            "music_streaming",
            "digital_library",
            "e_commerce",
            "concert_ticketing",
            "newsletter",
            "ai_assistant",
            "admin_dashboard"
        ]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
