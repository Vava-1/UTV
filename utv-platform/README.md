# UNA TANTUM VOCE (UTV) Platform

## Overview
UNA TANTUM VOCE is an integrated artistic and educational platform bridging classical/gospel music with formative philosophical literature. Features include music streaming, digital library, e-commerce for books/scores, concert ticketing, and an AI-powered assistant.

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS 3.4
- Framer Motion (animations)
- React-i18next (8 languages: EN, FR, ES, DE, IT, PT, RW, SW)
- Lucide React (icons)
- Axios (HTTP client)

### Backend
- Python 3.11 + FastAPI
- SQLAlchemy ORM + PostgreSQL
- PyPDF2 + ReportLab (PDF watermarking)
- LangChain + OpenAI (RAG AI Assistant)
- Stripe (payments)
- Boto3 (AWS S3)

### Infrastructure
- Docker + Docker Compose
- Railway (backend deployment)
- Vercel (frontend deployment)

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
│   │   ├── i18n.ts        # Internationalization setup
│   │   ├── App.tsx        # Root component with routing
│   │   └── main.tsx       # Application entry point
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── backend/                # Python FastAPI
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── contents.py    # Content CRUD
│   │   │   ├── orders.py      # Orders & cart
│   │   │   ├── tickets.py     # Concert tickets
│   │   │   ├── chat.py        # AI chatbot
│   │   │   ├── admin.py       # Admin dashboard
│   │   │   ├── webhooks.py    # Stripe webhooks
│   │   │   └── uploads.py     # File uploads/downloads
│   │   ├── core/          # Core configuration
│   │   │   ├── config.py      # App settings
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
│   │   │   ├── ai_service.py    # LangChain RAG
│   │   │   ├── stripe_service.py # Stripe integration
│   │   │   └── s3_service.py    # AWS S3 uploads
│   │   └── main.py        # FastAPI app factory
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py             # Uvicorn entry point
│
├── docker-compose.yml      # Local development stack
└── README.md
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
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key
- `OPENAI_API_KEY` - For AI assistant
- `STRIPE_SECRET_KEY` - For payments
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - For S3 uploads

### 3. Start with Docker Compose
```bash
docker-compose up --build
```
This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432

### 4. Setup Admin User
```bash
curl -X POST http://localhost:8000/api/auth/admin-setup
```
Default admin: `admin@utv.com` / `admin123`

### 5. Access the App
- Public site: http://localhost:5173
- Admin portal: http://localhost:5173/admin-secure-portal

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
- User management

### Module C: Dynamic PDF Watermarking
- When users purchase/download PDFs, the backend:
  1. Fetches original PDF from S3
  2. Adds diagonal "UNA TANTUM VOCE" watermark
  3. Stamps user's email in footer
  4. Streams watermarked PDF to user

### Module D: UTV AI Assistant
- Floating chat widget (bottom-right)
- LangChain RAG pipeline with FAISS vector store
- Knowledge base includes UTV mission, values, services
- 24/7 availability for customer support

## Deployment

### Railway (Backend)
1. Push backend code to GitHub
2. Create new Railway project
3. Add PostgreSQL plugin
4. Set environment variables in Railway dashboard
5. Deploy

### Vercel (Frontend)
1. Push frontend code to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

## Payment Flow (Stripe)
1. User adds items to cart
2. Frontend calls `/api/orders/checkout`
3. Backend creates Stripe Checkout Session
4. User redirected to Stripe payment page
5. Stripe webhook confirms payment
6. Backend creates order/tickets, sends watermarked PDFs

## AI Assistant Flow
1. User sends message via chat widget
2. Frontend POSTs to `/api/chat/ask`
3. Backend queries FAISS vector store for relevant context
4. LangChain constructs prompt with context + history
5. OpenAI GPT-4 generates response
6. Response saved to chat history, returned to user

## License
Proprietary - UNA TANTUM VOCE
