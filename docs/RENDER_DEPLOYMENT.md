# Render Deployment Guide

## Services Overview

| Service | Type | Plan | URL (after deploy) |
|---------|------|------|--------------------|
| `pocketdiscount-api` | Web Service (Node 20) | Starter (~$7/mo) | `https://pocketdiscount-api.onrender.com` |
| `pocketdiscount-web` | Static Site | Free | `https://pocketdiscount-web.onrender.com` |
| `pocketdiscount-db` | PostgreSQL | Free (90-day expiry) | internal connection string |

> **Note:** Render removed the free tier for Web Services (Node.js servers). The Starter plan at ~$7/mo is the minimum for the backend. Static Sites and PostgreSQL still have free tiers.

---

## Step 1 — Connect repo to Render via Blueprint

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New → Blueprint**
3. Connect your GitHub account if not already connected
4. Search for and select: `MarjanMitev/PocketDiscount`
5. Render reads `render.yaml` from the repo root automatically
6. Review the services shown:
   - `pocketdiscount-db` → PostgreSQL, free
   - `pocketdiscount-api` → Web Service, select **Starter**
   - `pocketdiscount-web` → Static Site, free
7. Click **Apply** / **Create Resources**

---

## Step 2 — Wait for initial deploy

Both services will build for the first time. This takes ~5–10 minutes.

- Track progress: Render Dashboard → each service → **Logs** tab
- Backend healthy when logs show: `Nest application successfully started`
- Frontend healthy when logs show: `Build successful`

---

## Step 3 — Fix the API URL for the frontend

Render Blueprints can't concatenate strings in env vars, so `EXPO_PUBLIC_API_URL` needs to be set manually.

1. Go to Render Dashboard → **pocketdiscount-api** → **Settings**
2. Copy the service URL (e.g. `https://pocketdiscount-api.onrender.com`)
3. Go to **pocketdiscount-web** → **Environment** tab
4. Find `EXPO_PUBLIC_API_URL` → edit its value to:
   ```
   https://pocketdiscount-api.onrender.com/api
   ```
   (append `/api` to the backend URL)
5. Click **Save Changes** → Render will trigger a new frontend deploy automatically

---

## Step 4 — Add deploy hook secrets to GitHub

This enables automatic deploys every time you merge a PR to `main`.

1. Go to Render Dashboard → **pocketdiscount-api** → **Settings** → scroll to **Deploy Hook**
2. Copy the hook URL (looks like `https://api.render.com/deploy/srv-xxx?key=yyy`)
3. Repeat for **pocketdiscount-web**
4. Add both as GitHub secrets (run in terminal):

```bash
gh secret set RENDER_DEPLOY_HOOK_BACKEND \
  --body 'https://api.render.com/deploy/srv-BACKEND_ID?key=BACKEND_KEY'

gh secret set RENDER_DEPLOY_HOOK_FRONTEND \
  --body 'https://api.render.com/deploy/srv-FRONTEND_ID?key=FRONTEND_KEY'
```

Verify they're set:
```bash
gh secret list
# Should show:
# RENDER_DEPLOY_HOOK_BACKEND
# RENDER_DEPLOY_HOOK_FRONTEND
```

---

## Step 5 — Seed the database (optional)

The backend creates the `stores` table automatically via TypeORM (`synchronize: true` in dev, schema is auto-applied on first boot in production too since TypeORM `synchronize` only runs in non-production). To populate with store data:

```bash
# Connect to the Render Postgres via psql (get connection string from dashboard)
# Dashboard → pocketdiscount-db → Info → External Connection String

# OR run the seed script locally pointing at the Render DB:
DATABASE_URL="postgres://user:pass@host/pocketdiscount" npm run seed
```

---

## Step 6 — Verify everything works

```bash
# 1. Check backend health
curl https://pocketdiscount-api.onrender.com/api
# → { "message": "Hello World!" }

# 2. Check promotions load
curl https://pocketdiscount-api.onrender.com/api/scrapers/promotions | python3 -m json.tool | head -20

# 3. Open the frontend
open https://pocketdiscount-web.onrender.com
```

---

## Deployed URLs (fill in after deploy)

| What | URL |
|------|-----|
| **Frontend app** | `https://pocketdiscount-web.onrender.com` |
| **Backend API root** | `https://pocketdiscount-api.onrender.com/api` |
| **Promotions endpoint** | `https://pocketdiscount-api.onrender.com/api/scrapers/promotions` |
| **Refresh scrapers** | `https://pocketdiscount-api.onrender.com/api/scrapers/refresh` |
| **Stores endpoint** | `https://pocketdiscount-api.onrender.com/api/stores` |
| **Render Dashboard** | `https://dashboard.render.com` |
| **GitHub Repo** | `https://github.com/MarjanMitev/PocketDiscount` |
| **GitHub Actions** | `https://github.com/MarjanMitev/PocketDiscount/actions` |

---

## Re-deploying manually

If auto-deploy via GitHub Actions isn't set up yet (secrets not added), trigger a deploy manually:

```bash
# Redeploy backend
curl -X POST 'https://api.render.com/deploy/srv-BACKEND_ID?key=BACKEND_KEY'

# Redeploy frontend
curl -X POST 'https://api.render.com/deploy/srv-FRONTEND_ID?key=FRONTEND_KEY'
```

Or just click **Manual Deploy → Deploy latest commit** in the Render dashboard.

---

## Environment Variables Reference

### pocketdiscount-api (Backend)

| Variable | Value | Source |
|----------|-------|--------|
| `NODE_ENV` | `production` | hardcoded in render.yaml |
| `DATABASE_URL` | Postgres connection string | auto-linked from pocketdiscount-db |
| `PUBLIC_URL` | `https://pocketdiscount-api.onrender.com` | auto-set from service host |
| `PORT` | `10000` | Render default for web services |

### pocketdiscount-web (Frontend)

| Variable | Value | Source |
|----------|-------|--------|
| `EXPO_PUBLIC_API_URL` | `https://pocketdiscount-api.onrender.com/api` | **set manually** (Step 3) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend crashes on start | Check `DATABASE_URL` is set correctly in Render env vars |
| Frontend shows "Geen producten gevonden" | Check `EXPO_PUBLIC_API_URL` ends with `/api` (no trailing slash) |
| Images not loading | Check `PUBLIC_URL` on backend matches the actual Render service URL |
| Free Postgres expired | Upgrade to paid plan or create a new free instance |
| Deploy hook returns 400 | Regenerate the deploy hook in Render dashboard → update GitHub secret |
