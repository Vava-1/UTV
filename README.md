# UNA TANTUM VOCE (UTV) Platform

## Overview
UNA TANTUM VOCE is an integrated classical music and educational platform bridging classical/gospel music with formative philosophical literature. Features include music streaming, digital library, e-commerce for books/scores, concert ticketing, YouTube channel integration, and an AI-powered assistant.

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS (UTV warm-dark design tokens)
- Framer Motion (animations)
- React-i18next (8 languages: EN, FR, ES, DE, IT, PT, RW, SW)
- Lucide React (icons)
- Axios (HTTP client)

### Backend
- Python 3.11 + FastAPI
- SQLAlchemy ORM 2.0 + PostgreSQL (SQLite for dev)
- Alembic (database migrations)
- PyPDF2 + ReportLab (PDF watermarking)
- OpenAI GPT-3.5 (AI Assistant — direct API, with keyword fallback)
- Stripe (payments + webhook handling) — optional, graceful degradation
- Boto3 (AWS S3 / Cloudflare R2) — optional, local disk fallback in dev
- YouTube Data API v3 (channel video sync) — optional, embeds work without

### Infrastructure
- Docker + Docker Compose
- Render.com (deployment blueprint)
- GitHub Actions CI (pytest + tsc + build)

## Quick Start (Local Development)

### Option 1: Docker Compose (recommended)
```bash
git clone <repo-url>
cd utv-platform

# Create .env with required secrets (no defaults for production safety)
cp backend/.env.example backend/.env
# Edit backend/.env — set SECRET_KEY, ADMIN_SETUP_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

docker-compose up --build
```

### Option 2: Manual (frontend + backend separately)

#### Backend
```bash
cd utv-platform/backend
cp .env.example .env  # Configure required vars
pip install -r requirements.txt

# Run migrations (creates SQLite DB for dev)
alembic upgrade head

# Or just start the server (dev mode auto-creates tables)
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd utv-platform/frontend
cp .env.example .env.local
npm install
npm run dev
```

#### Create Admin User
```bash
curl -X POST http://localhost:8000/api/auth/admin-setup \
  -H "x-setup-secret: <your-ADMIN_SETUP_SECRET>"
```

#### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
- Admin portal: http://localhost:5173/admin-secure-portal

## YouTube Integration

The platform integrates with your YouTube channel [@UNATANTUMVOCEOFFICIAL](https://www.youtube.com/@UNATANTUMVOCEOFFICIAL).

### Features
1. **Channel sync** — Admin can sync all videos from the channel into the platform
2. **Embed playback** — Videos play on-site via YouTube IFrame API (no bandwidth cost)
3. **URL paste** — Admin can add any YouTube/Vimeo/direct video URL
4. **Direct upload** — Admin can upload MP4/WebM files to S3/R2

### Setup
1. Get a YouTube Data API v3 key at [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
2. Add to `backend/.env`:
   ```
   YOUTUBE_API_KEY=your_key_here
   YOUTUBE_CHANNEL_ID=UC...  # Optional — auto-detected from handle if not set
   ```
3. Go to Admin → Videos tab → Click "Sync Now"

### Without API Key
YouTube embeds still work — users can watch any video added by URL. Only the "Sync channel" feature requires the API key.

## API Documentation
FastAPI auto-generates interactive docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create user account (rate limited) |
| POST | `/api/auth/login` | Public | Get JWT token (rate limited) |
| GET | `/api/contents` | Public | List content (filter by content_type) |
| POST | `/api/contents` | Admin | Create content (auto-extracts YouTube ID) |
| GET | `/api/youtube/status` | Admin | Check YouTube integration |
| POST | `/api/youtube/sync` | Admin | Sync videos from channel |
| POST | `/api/uploads/file` | Admin | Upload file to S3 |
| POST | `/api/orders/checkout` | JWT | Create Stripe checkout session |
| POST | `/api/webhooks/stripe` | Public | Stripe webhook (signature verified) |
| POST | `/api/newsletter/subscribe` | Public | Subscribe (double opt-in) |

## Core Features

### Music Streaming
- Global persistent audio player (now with real `<audio>` element)
- Queue management, volume control, seek

### Digital Library
- Books and scores with PDF watermarking
- Watermark includes licensee email + diagonal "UNA TANTUM VOCE" text
- Paywall enforced — purchase is the only gate for paid content

### E-Commerce
- Cart with Stripe Checkout
- Server-side PendingOrder (avoids Stripe metadata limits)
- Webhook idempotency (no duplicate orders on retries)
- Admin refunds via Stripe API

### Concert Ticketing
- Atomic inventory (no overselling via SELECT FOR UPDATE on PostgreSQL)
- QR code generation for each ticket
- Admin check-in verification

### YouTube Videos
- Channel sync via Data API v3
- YouTube IFrame embeds
- Direct video upload support
- External URL paste (YouTube/Vimeo/direct)

### AI Assistant
- Direct OpenAI GPT-3.5 integration
- Keyword-based fallback when OpenAI unavailable
- Embedded knowledge base (mission, services, music, books, concerts)

### Newsletter
- Double opt-in confirmation
- Rate-limited subscribe/unsubscribe
- Admin bulk send with branded HTML template

## Security Features
- No hardcoded secrets — production fails fast if defaults detected
- JWT auth with rate limiting (IP + email based)
- Stripe webhook signature verification (fail-closed)
- Webhook idempotency (ProcessedStripeEvent table)
- Ticket atomic inventory (SELECT FOR UPDATE)
- Object storage required in production
- Admin-only file uploads with type/size validation
- SSRF guard on PDF download
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS restricted to configured origins

## Deployment

### Render.com (recommended)
1. Push to GitHub
2. Render → New → Blueprint → connect repo
3. Configure secrets in Render dashboard (see `render.yaml`)
4. Run `alembic upgrade head` from Render shell
5. Create admin: `curl -X POST https://<backend>/api/auth/admin-setup -H "x-setup-secret: <secret>"`

### Production Checklist
- [ ] Set all secrets in Render dashboard (no defaults!)
- [ ] Configure S3/R2 for file storage
- [ ] Set STRIPE_WEBHOOK_SECRET + configure Stripe webhook endpoint
- [ ] Set ADMIN_EMAIL + strong ADMIN_PASSWORD
- [ ] Configure email (Gmail SMTP)
- [ ] Set YOUTUBE_API_KEY for video sync
- [ ] Set FRONTEND_URL to your domain
- [ ] Run `alembic upgrade head` after first deploy

## Testing
```bash
# Backend
cd utv-platform/backend
pytest tests/ -v

# Frontend
cd utv-platform/frontend
npx tsc --noEmit  # Type check
npm run build     # Build verification
```

## License
Proprietary — UNA TANTUM VOCE
