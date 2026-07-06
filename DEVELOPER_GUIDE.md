# UNA TANTUM VOCE — Developer Guide

## Architecture Overview

```
UTV/
└── utv-platform/
    ├── backend/          FastAPI + PostgreSQL (Python 3.11)
    │   ├── app/
    │   │   ├── api/      Route handlers (auth, contents, orders, newsletter, ...)
    │   │   ├── core/     Config, security, JWT deps
    │   │   ├── db/       SQLAlchemy engine + session
    │   │   ├── models/   SQLAlchemy ORM models
    │   │   ├── schemas/  Pydantic request/response schemas
    │   │   └── services/ Stripe, S3/R2, email, AI, PDF
    │   ├── alembic/      Database migrations
    │   ├── tests/        pytest regression tests
    │   ├── .env          Local environment variables (never commit)
    │   └── requirements.txt
    └── frontend/         React 18 + Vite + TypeScript + TailwindCSS
        ├── src/
        │   ├── components/  Reusable UI (Sidebar, HeroSection, AudioPlayer, ...)
        │   ├── contexts/    AuthContext, AudioPlayerContext
        │   ├── pages/       One file per route
        │   ├── types/       TypeScript interfaces
        │   ├── i18n/        8-locale translation files
        │   └── utils/api.ts Axios instance with JWT interceptor
        └── public/          manifest.json, robots.txt, sitemap.xml
```

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop (for PostgreSQL)

### 1. Start the database
```bash
cd utv-platform
docker-compose up db -d
```

### 2. Start the backend
```bash
cd utv-platform/backend
cp .env.example .env   # configure your variables
pip install -r requirements.txt
alembic upgrade head    # run migrations
uvicorn app.main:app --reload --port 8000
```

### 3. Create the admin account (one-time)
```bash
curl -X POST http://localhost:8000/api/auth/admin-setup \
  -H "x-setup-secret: <your-ADMIN_SETUP_SECRET>"
```

### 4. Start the frontend
```bash
cd utv-platform/frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:5173 · API docs at http://localhost:8000/docs

---

## Environment Variables Reference

### Backend (`utv-platform/backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (or SQLite for dev) |
| `SECRET_KEY` | ✅ | JWT signing key (generate with `openssl rand -hex 32`) |
| `ADMIN_SETUP_SECRET` | ✅ | Header required to call `/api/auth/admin-setup` |
| `ADMIN_EMAIL` | ✅ | Admin login email (set to unique value) |
| `ADMIN_PASSWORD` | ✅ | Admin login password (strong, unique) |
| `FRONTEND_URL` | ✅ | Used for CORS + email redirect links |
| `STRIPE_SECRET_KEY` | ⚠️ | Required for payments |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | Required for Stripe webhooks in production |
| `EMAIL_USER` | ⚠️ | Gmail address for sending emails |
| `EMAIL_PASS` | ⚠️ | Gmail App Password |
| `EMAIL_ENABLED` | ⚠️ | Set `True` after email is configured |
| `AWS_ACCESS_KEY_ID` | 🔵 | **Required in production** — S3/R2 credentials |
| `AWS_SECRET_ACCESS_KEY` | 🔵 | **Required in production** |
| `S3_BUCKET_NAME` | 🔵 | **Required in production** |
| `S3_ENDPOINT_URL` | 🔵 | For Cloudflare R2 custom endpoint |
| `S3_CUSTOM_DOMAIN` | 🔵 | Public CDN domain for file serving |
| `OPENAI_API_KEY` | 🔵 | Optional — enables AI assistant |

✅ Required · ⚠️ Required for that feature · 🔵 Optional (but see notes)

### Frontend (`utv-platform/frontend/.env.local`)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `http://localhost:8000/api` (local) or your Render URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_...) |

---

## API Reference Summary

All endpoints are documented at `/docs` (Swagger UI) and `/redoc`.

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create user account (rate limited: 3/hr) |
| POST | `/api/auth/login` | Public | Get JWT token (rate limited: 5/15min) |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/me` | JWT | Update profile / password |
| POST | `/api/auth/admin-setup` | `x-setup-secret` header | Create admin (run once) |

### Content
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/contents` | Public | List with filters: `content_type`, `search`, `is_featured` |
| GET | `/api/contents/{id}` | Public | Get single item |
| POST | `/api/contents` | Admin | Create content |
| PUT | `/api/contents/{id}` | Admin | Update content |
| DELETE | `/api/contents/{id}` | Admin | Delete content |

**Content Types:** `music`, `book`, `score`, `video`, `concert`, `gallery`, `library`

### Orders & Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders/cart` | JWT | Get cart |
| POST | `/api/orders/cart` | JWT | Add to cart (quantity > 0 required) |
| DELETE | `/api/orders/cart/{id}` | JWT | Remove from cart |
| POST | `/api/orders/checkout` | JWT | Create Stripe checkout session |
| GET | `/api/orders` | JWT | List user's orders |

### Newsletter
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/newsletter/subscribe` | Public | Subscribe |
| POST | `/api/newsletter/unsubscribe` | Public | Unsubscribe |
| GET | `/api/newsletter/subscribers` | Admin | List all subscribers |
| DELETE | `/api/newsletter/subscribers/{id}` | Admin | Remove subscriber |
| POST | `/api/newsletter/send` | Admin | Send newsletter to all |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/analytics` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | List all users |
| GET | `/api/admin/orders` | Admin | List all orders |
| POST | `/api/admin/orders/{id}/refund` | Admin | **Refund via Stripe API** |
| GET | `/api/admin/tickets` | Admin | List all tickets |

---

## Database Migrations (Alembic)

### Create a new migration
```bash
cd utv-platform/backend
alembic revision --autogenerate -m "description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback one migration
```bash
alembic downgrade -1
```

### View current revision
```bash
alembic current
```

---

## Running Tests

```bash
cd utv-platform/backend
pytest tests/ -v
```

To run a specific test file:
```bash
pytest tests/test_security.py -v
```

To run with coverage:
```bash
pytest tests/ --cov=app --cov-report=term-missing
```

---

## Deployment Guide (Render.com)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: production-hardened UTV platform"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) → New → Blueprint
2. Connect your GitHub repo (`Vava-1/UTV`)
3. Render will detect `render.yaml` and create all services automatically
4. Wait for build to complete (~5 min)

### Step 3: Configure secrets (Render dashboard)
**CRITICAL:** All secrets marked `sync: false` in `render.yaml` MUST be set manually:

- `SECRET_KEY` — `openssl rand -hex 32`
- `ADMIN_SETUP_SECRET` — `openssl rand -hex 32`
- `ADMIN_EMAIL` — your admin email
- `ADMIN_PASSWORD` — strong unique password
- `STRIPE_SECRET_KEY` — from Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` — from Stripe webhooks config
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `S3_BUCKET_NAME` — object storage
- `EMAIL_USER` / `EMAIL_PASS` — Gmail with App Password
- `OPENAI_API_KEY` — from OpenAI (optional)

### Step 4: Run migrations
```bash
# From Render shell
alembic upgrade head
```

### Step 5: Create admin account
```bash
curl -X POST https://<your-backend>.onrender.com/api/auth/admin-setup \
  -H "x-setup-secret: <your-ADMIN_SETUP_SECRET>"
```

### Step 6: Verify
- Frontend: https://utv-frontend.onrender.com
- Backend docs: https://utv-backend.onrender.com/docs
- Health: https://utv-backend.onrender.com/health

### Step 7: Configure Stripe Webhook
1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://<your-backend>.onrender.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook signing secret → add as `STRIPE_WEBHOOK_SECRET` on Render

---

## Adding Content (After Deployment)

Use the Swagger UI at `/docs` (logged in as admin):

```bash
# 1. Login
POST /api/auth/login  {"email": "<ADMIN_EMAIL>", "password": "<ADMIN_PASSWORD>"}

# 2. Add music track
POST /api/contents
{
  "title": "Ave Maria",
  "slug": "ave-maria",
  "content_type": "music",
  "is_published": true,
  "is_featured": true,
  "music_fields": {
    "artist": "UNA TANTUM VOCE",
    "audio_url": "https://your-audio-url.mp3",
    "duration": 245
  }
}

# 3. Add a book
POST /api/contents
{
  "title": "Introduction to Choral Music",
  "slug": "intro-choral-music",
  "content_type": "book",
  "book_fields": {
    "author": "UTV Author",
    "price": "12.99",
    "pdf_url": "https://your-pdf-url.pdf",
    "is_downloadable": true
  }
}
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS + custom UTV design tokens |
| i18n | i18next (8 languages) |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL + SQLAlchemy 2.0 + Alembic |
| Auth | JWT (python-jose + passlib bcrypt) |
| Payments | Stripe Checkout + Webhooks (signed + idempotent) |
| File Storage | AWS S3 / Cloudflare R2 (local disk fallback for dev only) |
| Email | Gmail SMTP (smtplib) |
| PDF | ReportLab + PyPDF2 (watermarking) |
| AI Chat | OpenAI GPT-3.5 direct API (keyword fallback if unavailable) |
| Deployment | Render.com (Blueprint) |

---

## Security Architecture

### What was fixed in production hardening:

1. **Hardcoded secrets removed** — `SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` are env-only. Production startup fails if defaults detected.
2. **Paywall bypass fixed** — `is_downloadable` no longer allows free downloads of paid content. Purchase is the only gate.
3. **Webhook verification** — Signature verification is mandatory in production. No `json.loads()` fallback.
4. **Webhook idempotency** — `ProcessedStripeEvent` table with unique constraint prevents duplicate order/ticket creation on retries.
5. **Ticket race condition** — `SELECT ... FOR UPDATE` locks the row during availability check, preventing overselling.
6. **Object storage enforced** — Local disk storage is blocked in production. S3/R2 credentials are required.
7. **Admin-only uploads** — `/api/uploads/file` requires `get_current_admin`. File type and size validation enforced.
8. **Rate limiting** — Auth endpoints have per-email rate limits (login: 5/15min, register: 3/hr).
9. **Security headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy on all responses.
10. **Schema validation** — All quantity fields require `> 0`.
11. **CORS** — `null` origin removed. Only configured frontend URLs allowed.
12. **Stripe refunds** — Admin refund calls `stripe.Refund.create()` against the original `payment_intent`.

---

## AI Assistant Architecture

The AI Assistant uses **direct OpenAI Chat Completions** (not LangChain/FAISS).

**Why:** The knowledge base is ~10 short paragraphs. LangChain + FAISS caused out-of-memory crashes on deployment and added unnecessary complexity for a small, static knowledge base.

**How it works:**
1. The entire knowledge base is embedded in the system prompt
2. Each chat request sends: system prompt + recent history (last 6 messages) + user question
3. If OpenAI API key is not set or the call fails, a keyword-based fallback provides responses
4. The fallback covers: music, books, concerts, scores, purchasing, languages, support, academy

**To customize responses:** Edit `UTV_KNOWLEDGE_BASE` in `app/services/ai_service.py`
