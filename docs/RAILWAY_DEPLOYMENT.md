# Railway Deployment Guide

## Why Railway?
Railway is the free alternative to Render — $5/month free credit included, no credit card required to start. Supports Node.js + PostgreSQL natively.

## Services Overview

| Service | Type | Cost |
|---------|------|------|
| `pocketdiscount-api` | Web Service (Node 20) | ~$0–5/mo on free credits |
| `pocketdiscount-web` | Static Site (Node + serve) | ~$0–2/mo on free credits |
| PostgreSQL | Database | Included free |

---

## Step 1 — Sign up & create project

1. Go to [railway.app](https://railway.app) → **Sign up with GitHub** (no credit card needed)
2. Click **New Project → Empty Project**
3. Name it `PocketDiscount`

---

## Step 2 — Add PostgreSQL

1. Inside the project → click **+ Add Service → Database → PostgreSQL**
2. Railway provisions it automatically
3. Click the Postgres service → **Variables** tab → copy `DATABASE_URL` (you'll need this in Step 4)

---

## Step 3 — Add the backend service

1. Click **+ Add Service → GitHub Repo**
2. Select `MarjanMitev/PocketDiscount`
3. When asked for **Root Directory** → set `apps/backend`
4. Railway detects `railway.toml` and uses it automatically
5. Rename the service to `pocketdiscount-api`

---

## Step 4 — Set backend environment variables

Go to `pocketdiscount-api` → **Variables** tab → add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | paste from Postgres service (Step 2) |
| `PUBLIC_URL` | `https://pocketdiscount-api.up.railway.app` *(set after first deploy)* |

Click **Deploy** to trigger first build.

---

## Step 5 — Add the frontend service

1. Click **+ Add Service → GitHub Repo**
2. Select `MarjanMitev/PocketDiscount` again
3. Set **Root Directory** → `apps/frontend`
4. Railway detects `apps/frontend/railway.toml` automatically
5. Rename to `pocketdiscount-web`

---

## Step 6 — Set frontend environment variable

Go to `pocketdiscount-web` → **Variables** tab → add:

| Variable | Value |
|----------|-------|
| `EXPO_PUBLIC_API_URL` | `https://pocketdiscount-api.up.railway.app/api` |

*(Use the actual URL from Step 4's backend service — click the backend service → Settings → copy the domain)*

Click **Deploy**.

---

## Step 7 — Add GitHub secrets for auto-deploy

This wires up GitHub Actions so every merge to `main` (after tests pass) auto-deploys to Railway.

### Get your Railway token

1. Go to [railway.app](https://railway.app) → click your avatar → **Account Settings → Tokens**
2. Click **Create Token** → name it `GitHub Actions` → copy it

### Get service IDs

1. Click `pocketdiscount-api` service → **Settings** → copy the **Service ID**
2. Repeat for `pocketdiscount-web`

### Add secrets to GitHub

```bash
gh secret set RAILWAY_TOKEN \
  --body 'your-railway-token-here'

gh secret set RAILWAY_SERVICE_ID_BACKEND \
  --body 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

gh secret set RAILWAY_SERVICE_ID_FRONTEND \
  --body 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
```

Verify:
```bash
gh secret list
# Should show:
# RAILWAY_TOKEN
# RAILWAY_SERVICE_ID_BACKEND
# RAILWAY_SERVICE_ID_FRONTEND
```

---

## Step 8 — Verify everything works

```bash
# Backend health check
curl https://pocketdiscount-api.up.railway.app/api

# Promotions endpoint
curl https://pocketdiscount-api.up.railway.app/api/scrapers/promotions | python3 -m json.tool | head -20

# Open frontend
open https://pocketdiscount-web.up.railway.app
```

---

## Your live URLs (fill in after deploy)

| What | URL |
|------|-----|
| **Frontend app** | `https://pocketdiscount-web.up.railway.app` |
| **Backend API** | `https://pocketdiscount-api.up.railway.app/api` |
| **Promotions** | `https://pocketdiscount-api.up.railway.app/api/scrapers/promotions` |
| **Refresh scrapers** | `https://pocketdiscount-api.up.railway.app/api/scrapers/refresh` |
| **Railway Dashboard** | `https://railway.app/dashboard` |
| **GitHub Actions** | `https://github.com/MarjanMitev/PocketDiscount/actions` |

---

## Full deploy flow (once set up)

```
Push branch → open PR
      ↓
GitHub Actions: pr-checks.yml
  ├── test-backend (lint + 64 tests + build)
  └── test-frontend (lint + 60 tests)
      ↓ both green
Merge PR to main
      ↓
GitHub Actions: deploy.yml
  ├── railway up --service pocketdiscount-api
  └── railway up --service pocketdiscount-web
      ↓
Live on Railway ✓
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend crashes: `DATABASE_URL not set` | Add `DATABASE_URL` in Railway service Variables tab |
| Frontend shows "Geen producten gevonden" | Check `EXPO_PUBLIC_API_URL` ends with `/api` (no trailing slash) |
| Images not loading | Set `PUBLIC_URL` on backend service to the actual Railway backend URL |
| Deploy skipped in CI | Check all 3 GitHub secrets are set (`gh secret list`) |
| `railway up` fails | Check `RAILWAY_TOKEN` hasn't expired; regenerate in Railway account settings |
