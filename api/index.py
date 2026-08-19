"""
Vercel Serverless Function entry point.

Vercel auto-detects the `api/` folder and deploys each .py file as a
serverless function. This file wraps the FastAPI app with `mangum` so
Vercel's ASGI runtime can serve it.

The function is exposed at: https://<your-vercel-domain>/api/index
With rewrites in vercel.json, all /api/* routes hit this function.

Important: Serverless functions have a 10-second timeout on the free tier.
Endpoints that exceed this will fail. Slow operations (PDF watermarking,
SMTP email sends) are fire-and-forget or reworked.
"""

import os
import sys
from pathlib import Path

# Add the backend/ directory to Python path so we can import the FastAPI app
# Vercel deploys api/ at the root, backend/ is a sibling directory
BACKEND_DIR = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

# Set default env vars for serverless context if not set
os.environ.setdefault("APP_ENV", "production")
os.environ.setdefault("DATABASE_URL", os.environ.get("POSTGRES_URL", ""))

# Import the FastAPI app
try:
    from app.main import app
    # Wrap with mangum for Vercel ASGI compatibility
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")  # lifespan off — no startup/shutdown hooks in serverless
except ImportError as e:
    # If imports fail (cold start race condition), provide a graceful fallback
    import json
    def handler(event, context):
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": "Server initialization failed",
                "detail": str(e),
                "hint": "Check that all dependencies are in api/requirements.txt"
            }),
            "headers": {"Content-Type": "application/json"},
        }
