from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.database import init_db
from app.api import auth, contents, orders, tickets, chat, admin, webhooks, uploads


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    print(f"Starting {settings.APP_NAME}...")
    init_db()
    print("Database initialized.")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="UNA TANTUM VOCE - Integrated Artistic and Educational Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://unatantumvoce.vercel.app",
        settings.FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(contents.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "operational",
        "modules": [
            "music_streaming",
            "digital_library",
            "e_commerce",
            "concert_ticketing",
            "ai_assistant",
            "admin_dashboard"
        ]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
