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
    │   │   └── services/ Stripe, S3/local storage, email, AI, PDF
    │   ├── .env          Local environment variables (never commit)
    │   └── requirements.txt
    └── frontend/         React 18 + Vite + TypeScript + TailwindCSS
        ├── src/
        │   ├── components/  Reusable UI (Sidebar, HeroSection, AudioPlayer, ...)
        │   ├── contexts/    AuthContext, AudioPlayerContext
        │   ├── pages/       One file per route
        │   ├── types/       TypeScript interfaces
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
cp .env .env.local   # already exists with defaults
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Create the admin account (one-time)
```bash
curl -X POST http://localhost:8000/api/auth/admin-setup \
  -H "x-setup-secret: change-me-to-something-secret-2024"
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
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | JWT signing key (generate with `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | ✅ | Admin login email |
| `ADMIN_PASSWORD` | ✅ | Admin login password |
| `ADMIN_SETUP_SECRET` | ✅ | Header required to call `/api/auth/admin-setup` |
| `FRONTEND_URL` | ✅ | Used for CORS + email redirect links |
| `STRIPE_SECRET_KEY` | ⚠️ | Required for payments |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | Required for Stripe webhooks |
| `EMAIL_USER` | ⚠️ | Gmail address for sending emails |
| `EMAIL_PASS` | ⚠️ | Gmail App Password |
| `EMAIL_ENABLED` | ⚠️ | Set `True` after email is configured |
| `AWS_ACCESS_KEY_ID` | 🔵 | Optional — local disk used if not set |
| `AWS_SECRET_ACCESS_KEY` | 🔵 | Optional |
| `S3_BUCKET_NAME` | 🔵 | Optional |
| `OPENAI_API_KEY` | 🔵 | Optional — AI assistant disabled if not set |

✅ Required · ⚠️ Required for that feature · 🔵 Optional

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
| POST | `/api/auth/register` | Public | Create user account |
| POST | `/api/auth/login` | Public | Get JWT token |
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
| POST | `/api/orders/cart` | JWT | Add to cart |
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
| POST | `/api/admin/orders/{id}/refund` | Admin | Mark as refunded |
| GET | `/api/admin/tickets` | Admin | List all tickets |

---

## Deployment Guide (Render.com)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: complete UTV platform"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) → New → Blueprint
2. Connect your GitHub repo (`Vava-1/UTV`)
3. Render will detect `render.yaml` and create all services automatically
4. Wait for build to complete (~5 min)

### Step 3: Configure secrets (Render dashboard)
Go to each service → Environment → Add these manually:
- `STRIPE_SECRET_KEY` — from Stripe dashboard
- `STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` — from Stripe webhooks config
- `EMAIL_USER` — your Gmail address
- `EMAIL_PASS` — your Gmail App Password
- `EMAIL_ENABLED` — set to `True`
- `OPENAI_API_KEY` — from OpenAI (optional)

### Step 4: Create admin account
```bash
# Get ADMIN_SETUP_SECRET from Render env vars
curl -X POST https://utv-backend.onrender.com/api/auth/admin-setup \
  -H "x-setup-secret: <your-ADMIN_SETUP_SECRET>"
```

### Step 5: Verify
- Frontend: https://utv-frontend.onrender.com
- Backend docs: https://utv-backend.onrender.com/docs
- Health: https://utv-backend.onrender.com/health

### Step 6: Configure Stripe Webhook
1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://utv-backend.onrender.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook signing secret → add as `STRIPE_WEBHOOK_SECRET` on Render

---

## Adding Content (After Deployment)

Use the Swagger UI at `/docs` (logged in as admin):

```bash
# 1. Login
POST /api/auth/login  {"email": "admin@utv.com", "password": "utv2025"}

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
| Styling | TailwindCSS + Framer Motion |
| i18n | i18next (8 languages) |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL + SQLAlchemy 2.0 |
| Auth | JWT (python-jose + passlib bcrypt) |
| Payments | Stripe Checkout + Webhooks |
| File Storage | AWS S3 (local disk fallback) |
| Email | Gmail SMTP (smtplib) |
| PDF | ReportLab + PyPDF2 (watermarking) |
| AI Chat | LangChain + OpenAI (optional) |
| Deployment | Render.com (Blueprint) |

---

## Security Notes

- JWT tokens expire in 7 days
- Admin routes all require `get_current_admin` dependency
- `admin-setup` endpoint requires `ADMIN_SETUP_SECRET` header
- Rate limiting is handled by Render's infrastructure
- `.env` is in `.gitignore` and never committed
- S3 files are private by default; signed URLs generated for downloads
- PDF watermarking stamps buyer's email on every download
