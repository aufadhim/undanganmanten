# Deployment Guide (Quick) — Frontend (Vercel) + Backend (Render)

This file lists quick steps to deploy the project for free testing using Vercel (frontend) and Render (backend + Postgres). Adjust names/commands for other providers.

## Overview

- Frontend: Deploy `frontend` with Vercel (or Cloudflare Pages). Use Vite build output.
- Backend: Deploy `backend` as a web service on Render (or Railway/Neon/Supabase for DB).
- Database: Use Render Managed Postgres, Neon, or Supabase (free tiers available).

## Required environment variables

Backend (set in Render/host env):

- `DATABASE_URL` — Postgres connection URL
- `JWT_SECRET` — JWT signing secret
- `FRONTEND_URL` — URL of deployed frontend (e.g. https://your-app.vercel.app)
- `BACKEND_URL` — URL of backend service (e.g. https://your-backend.onrender.com)
- `RESEND_API_KEY` — (optional) for email
- Cloudflare R2 keys only if you plan to use R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

Frontend (set in Vercel/host env):

- `VITE_API_BASE_URL` — e.g. `https://your-backend.onrender.com/api`
- `VITE_BACKEND_URL` — e.g. `https://your-backend.onrender.com`
- `VITE_GOOGLE_CLIENT_ID` — optional for Google OAuth

Security note: rotate any credentials that were previously committed in `.env` files.

---

## Frontend — Vercel (quick)

1. Push your repo to GitHub.
2. Go to Vercel dashboard → New Project → Import Git Repository.
3. Select the `frontend` folder as the project root.
4. Build Command: `npm run build` (Vite). Output Directory: `dist`.
5. Add Environment Variables in Project Settings (use names above, `VITE_` prefix required).
6. Deploy — Vercel provides `your-frontned.vercel.app`.

Local build & test commands:

```bash
cd frontend
npm ci
npm run build
# Optional: run Playwright tests
npm run test:e2e
```

## Backend — Render (quick)

1. Create an account on Render and create a new Web Service.
2. Connect your GitHub repo and choose the `backend` folder as the root.
3. Build/Start Command: `npm install && npm start` (or rely on `npm start` if `package.json` provides it).
4. In Render Service Settings, add environment variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL`, etc.).
5. Create a Managed Postgres in Render or use an external DB (Neon, Supabase). Copy the provided `DATABASE_URL`.
6. Deploy. Render gives you `https://your-backend.onrender.com`.

Triggering Render deploy via API (if you want to use GitHub Actions):

```bash
curl -X POST "https://api.render.com/v1/services/<RENDER_SERVICE_ID>/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": true}'
```

## Optional: Vercel + Render via GitHub Actions

- A sample workflow has been added at `.github/workflows/deploy.yml` which builds frontend and backend and optionally triggers Render or Vercel deploys when you set repository secrets: `RENDER_API_KEY`, `RENDER_SERVICE_ID`, `VERCEL_TOKEN`.

## Post-deploy checklist

- Verify health endpoint: `https://your-backend.onrender.com/health` → should return `status: ok`.
- Verify ready endpoint: `https://your-backend.onrender.com/ready` → should return `status: ready` if DB connection is OK.
- Test creating an invitation, uploading media, and sending RSVP.

## If you want me to create the Render service for you

- I can prepare the `curl` or `render.yaml` manifest, but I cannot create services without your Render API key and the repo being connected. Provide `RENDER_API_KEY` (store securely) and I can show exact commands to run locally or in CI.

---

If you'd like, I can now run the frontend build locally and verify it completes (you selected that), and prepare the exact Render deploy curl snippet ready for you to execute.
