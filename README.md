# UNA TANTUM VOCE (UTV) Platform

## Overview
UNA TANTUM VOCE is an integrated artistic and educational platform bridging classical/gospel music with formative philosophical literature. Features include music streaming, digital library, e-commerce for books/scores, concert ticketing, and an AI-powered assistant.

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS 3.4 (with custom UTV design tokens)
- Framer Motion (animations)
- React-i18next (8 languages: EN, FR, ES, DE, IT, PT, RW, SW)
- Lucide React (icons)
- Axios (HTTP client)

### Backend
- Python 3.11 + FastAPI
- SQLAlchemy ORM 2.0 + PostgreSQL (SQLite for dev)
- Alembic (database migrations)
- PyPDF2 + ReportLab (PDF watermarking)
- OpenAI GPT-3.5 (AI Assistant — direct API, no LangChain/FAISS)
- Stripe (payments + webhook handling)
- Boto3 (AWS S3 / Cloudflare R2)

### Infrastructure
- Docker + Docker Compose
- Render.com (deployment blueprint)

## Project Structure

```
utv-platform/
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── contexts/      # React contexts (Auth, AudioPlayer)
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions (API client)
│   │   ├── i18n/          # Internationalization (8 locales)
│   │   ├── App.tsx        # Root component with routing
│   │   └── main.tsx       # Application entry point
│   ├── Dockerfile
│   └── package.json
│
├── backend/                # Python FastAPI
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   │   ├── auth.py        # Authentication + rate limiting
│   │   │   ├── contents.py    # Content CRUD
│   │   │   ├── orders.py      # Orders & cart + PendingOrder
│   │   │   ├── tickets.py     # Concert tickets + atomic inventory
│   │   │   ├── chat.py        # AI chatbot
│   │   │   ├── admin.py       # Admin dashboard + Stripe refunds
│   │   │   ├── webhooks.py    # Stripe webhooks + idempotency
│   │   │   ├── uploads.py     # File uploads/downloads (admin only)
│   │   │   └── newsletter.py  # Newsletter management
│   │   ├── core/          # Core configuration
│   │   │   ├── config.py      # App settings (no hardcoded secrets)
│   │   │   ├── security.py    # JWT & password hashing
│   │   │   └── deps.py        # FastAPI dependencies
│   │   ├── db/            # Database
│   │   │   └── database.py    # SQLAlchemy setup
│   │   ├── models/        # SQLAlchemy models
│   │   │   └── models.py      # All database models
│   │   ├── schemas/       # Pydantic schemas
│   │   │   └── schemas.py     # Request/response DTOs
│   │   ├── services/      # Business logic
│   │   │   ├── pdf_service.py   # PDF watermarking
│   │   │   ├── ai_service.py    # OpenAI Chat Completions
│   │   │   ├── stripe_service.py # Stripe integration
│   │   │   ├── s3_service.py    # AWS S3 / R2 uploads
│   │   │   ├── email_service.py # Gmail SMTP emails
│   │   │   └── qr_service.py    # QR code generation
│   │   └── main.py        # FastAPI app factory
│   ├── alembic/           # Database migrations
│   ├── tests/             # pytest test suite
│   ├── requirements.txt
│   └── run.py
│
├── docker-compose.yml      # Local development stack
└── render.yaml             # Render.com deployment blueprint
```

## Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### 1. Clone & Setup
```bash
git clone <repo-url>
cd utv-platform
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (or SQLite for dev)
- `SECRET_KEY` - JWT signing key (generate with `openssl rand -hex 32`)
- `ADMIN_SETUP_SECRET` - Secret for admin creation endpoint
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin login password (strong, unique)
- `STRIPE_SECRET_KEY` - For payments
- `STRIPE_WEBHOOK_SECRET` - For webhook verification (required in production)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `S3_BUCKET_NAME` - For file storage
- `OPENAI_API_KEY` - For AI assistant (optional)

### 3. Start with Docker Compose
```bash
docker-compose up --build
```
This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432

### 4. Run Migrations
```bash
cd utv-platform/backend
alembic upgrade head
```

### 5. Setup Admin User
```bash
curl -X POST http://localhost:8000/api/auth/admin-setup \
  -H "x-setup-secret: <your-ADMIN_SETUP_SECRET>"
```

### 6. Access the App
- Public site: http://localhost:5173
- Admin portal: http://localhost:5173/admin-secure-portal

### 7. Run Tests
```bash
cd utv-platform/backend
pytest tests/ -v
```

## API Documentation
FastAPI auto-generates interactive docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Core Features

### Module A: Public Dashboard
- Fixed sidebar navigation with icon menu
- 8-language internationalization engine
- Global persistent audio player
- Responsive mobile design

### Module B: Admin Dashboard (`/admin-secure-portal`)
- JWT-protected admin-only access
- Analytics: users, orders, revenue, tickets
- Content CRUD for music, books, videos, scores, concerts
- User management (activate/deactivate)
- Order management with real Stripe refunds
- Newsletter subscriber management

### Module C: Dynamic PDF Watermarking
- When users purchase/download PDFs, the backend:
  1. Fetches original PDF from S3
  2. Adds diagonal "UNA TANTUM VOCE" watermark
  3. Stamps user's email in footer
  4. Streams watermarked PDF to user

### Module D: UTV AI Assistant
- Floating chat widget (bottom-right)
- Direct OpenAI GPT-3.5 API with embedded knowledge base
- Keyword-based fallback when OpenAI is unavailable
- Knowledge base covers: mission, services, music, books, concerts, languages, support

## Payment Flow (Stripe)
1. User adds items to cart
2. Frontend calls `/api/orders/checkout`
3. Backend creates PendingOrder (server-side cart storage) + Stripe Checkout Session
4. User redirected to Stripe payment page
5. Stripe webhook confirms payment (with signature verification + idempotency)
6. Backend creates order/tickets, sends watermarked PDFs

## Security Hardening Summary

| Feature | Status |
|---------|--------|
| No hardcoded secrets | ✅ |
| Paywall bypass fixed | ✅ |
| Webhook signature verification (fail-closed) | ✅ |
| Webhook idempotency (duplicate prevention) | ✅ |
| Ticket atomic inventory (overselling prevention) | ✅ |
| Object storage required in production | ✅ |
| Admin-only file uploads | ✅ |
| File type/size validation on upload | ✅ |
| Rate limiting on auth endpoints | ✅ |
| Security headers (CSP, HSTS, etc.) | ✅ |
| Quantity validation (gt=0) | ✅ |
| CORS null origin removed | ✅ |
| Stripe refund via API | ✅ |
| Production safety checks on startup | ✅ |
| Alembic database migrations | ✅ |
| pytest regression tests | ✅ |

## Deployment

### Render.com (Recommended)
1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create services
5. **Configure secrets in Render dashboard** (see `.env.example`)
6. Run migrations: `alembic upgrade head`
7. Create admin via `/api/auth/admin-setup`

### Important: Production Checklist
- [ ] Set all secrets in Render dashboard (no defaults!)
- [ ] Configure S3/R2 for file storage (local disk is ephemeral)
- [ ] Set `STRIPE_WEBHOOK_SECRET` and configure Stripe webhook endpoint
- [ ] Set `ADMIN_EMAIL` and strong `ADMIN_PASSWORD`
- [ ] Configure email (Gmail SMTP or transactional provider)
- [ ] Set custom domain and update `FRONTEND_URL`
- [ ] Run `alembic upgrade head` after first deploy

## License
Proprietary - UNA TANTUM VOCE
