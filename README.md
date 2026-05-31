# Una Tantum Voce (UTV) Platform

**One Voice, One Time** - A digital platform for classical and gospel music, philosophical literature, and cultural events.

## Overview
UTV Platform is a unified application combining a comprehensive frontend built with React, TypeScript, and Vite, and a robust backend built with FastAPI, SQLAlchemy (async), and PostgreSQL. It features music streaming, digital book purchases (with PDF watermarking), ticket purchases, AI chat, an admin dashboard, and an 8-language i18n system.

## Quick Start
```bash
cd utv-unified
docker compose up --build -d
```
This starts all 5 services:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Env Vars
Please copy `.env.example` to `.env` in both the `backend/` and `frontend/` directories.
Important variables include `DATABASE_URL` (using asyncpg), `REDIS_URL`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, and `JWT_SECRET`.

## Dev
- **Frontend**: Run `npm install` and `npm run dev` in the `frontend` directory.
- **Backend**: Run `uvicorn app.main:app --reload` inside the `backend` directory.

## Deploy
Deployment configurations are included for Railway (`railway.json`), Render (`render.yaml`), and Vercel (`vercel.json`). CI/CD workflows are available in `.github/workflows/`.

## Admin
The system includes an Admin Portal accessible via the frontend or via the standalone `admin.html`. 
Default credentials:
- **Email**: admin@utv.com
- **Password**: Admin@123456

## API Docs
All endpoints are prefixed with `/api/v1`. Visit `http://localhost:8000/docs` for the interactive Swagger UI.

- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /music/` - List music tracks
- `GET /books/` - List books
- `GET /events/` - List events
- `POST /ai/chat` - AI chat assistant
