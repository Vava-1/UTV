from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from app.core.config import settings
from app.db.database import init_db
from app.api import auth, contents, orders, tickets, chat, admin, webhooks, uploads, newsletter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    print(f"Starting {settings.APP_NAME}...")
    init_db()
    print("Database initialized.")

    # Ensure local upload directory exists (fallback when S3 not configured)
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "https://utv-frontend.onrender.com",
        "https://unatantumvoce.vercel.app",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static Files (local uploads fallback) ───────────────────────────────────
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
app.include_router(newsletter.router, prefix="/api")  # NEW


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
