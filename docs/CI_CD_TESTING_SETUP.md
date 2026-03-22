# CI/CD & Testing Setup

## Overview

PocketDiscount uses **GitHub Actions** for CI/CD with two workflows:

1. **PR Checks** — runs automatically on every pull request targeting `main`
2. **Deploy** — runs automatically on every merge to `main`

Deployment target is **Railway** (NestJS Web Service + Expo Static Site + Postgres). See `docs/RAILWAY_DEPLOYMENT.md` for full setup.

---

## Architecture

```
Developer → branch → PR → GitHub Actions (test-backend + test-frontend)
                                    ↓ (both green)
                              Merge to main
                                    ↓
                         GitHub Actions (deploy.yml)
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
          Railway: pocketdiscount-api     Railway: pocketdiscount-web
          (NestJS Web Service)            (Expo Static Site)
                    ↓
          Railway: PostgreSQL
```

---

## Workflow Files

### `.github/workflows/pr-checks.yml`

**Triggers:** `pull_request` → `main`

Two parallel jobs — **both must pass** before the PR can be merged:

| Job | Steps |
|-----|-------|
| `test-backend` | checkout → Node 20 → `npm ci` → lint → **jest (64 tests)** → build |
| `test-frontend` | checkout → Node 20 → `npm ci --legacy-peer-deps` → lint → **jest (60 tests)** |

### `.github/workflows/deploy.yml`

**Triggers:** `push` → `main`

Sends a `POST` request to each Render deploy hook URL (stored as GitHub secrets):

| Secret Name | What it deploys |
|-------------|----------------|
| `RAILWAY_TOKEN` | Railway account auth token |
| `RAILWAY_SERVICE_ID_BACKEND` | `pocketdiscount-api` (NestJS) |
| `RAILWAY_SERVICE_ID_FRONTEND` | `pocketdiscount-web` (Expo static) |

---

## Branch Protection (main)

Configured via GitHub API. Rules on `main`:

- ✅ **Required status checks:** `test-backend`, `test-frontend`
- ✅ **Strict** — branch must be up to date with `main` before merging
- ✅ **Dismiss stale reviews** when new commits are pushed
- ❌ Force pushes blocked
- ❌ Branch deletion blocked

---

## Unit Tests

### Backend — 64 tests across 7 suites

Location: `apps/backend/src/**/*.spec.ts`

Run locally:
```bash
cd apps/backend
npm test               # run once
npm run test:watch     # watch mode
npm run test:cov       # with coverage report
```

| File | What it tests |
|------|--------------|
| `app.controller.spec.ts` | Health check endpoint |
| `scrapers/scrapers.service.spec.ts` | Cache logic, TTL, refreshAll, searchProducts |
| `scrapers/scrapers.controller.spec.ts` | Endpoint delegation, empty query guard |
| `scrapers/ah.scraper.spec.ts` | AH API failure fallback, mapProduct() field mapping |
| `basket/basket.service.spec.ts` | Cheapest product selection, savings calc, case-insensitive matching |
| `stores/stores.service.spec.ts` | City filter, nearest-by-distance sorting |
| `product-images/product-images.service.spec.ts` | URL normalization, failed download handling, local URL replacement |

**Jest config** is in `apps/backend/package.json` (inline):
```json
{
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "testEnvironment": "node"
}
```

### Frontend — 60 tests across 4 suites

Location: `apps/frontend/**/__tests__/*.spec.ts`

Run locally:
```bash
cd apps/frontend
npm test               # run once
npm test -- --watch    # watch mode
```

| File | What it tests |
|------|--------------|
| `services/__tests__/api.spec.ts` | `cache: no-store` header, Dutch error messages, URL encoding, POST body |
| `constants/__tests__/retailers.spec.ts` | Label/color lookups, fallback for unknown retailers |
| `constants/__tests__/theme.spec.ts` | Color roles, typography scale, spacing order, elevation levels |
| `app/(tabs)/__tests__/compare.spec.ts` | `normalizeName()` logic, `buildGroups()` cheapest/sorting/dedup |

**Jest config** is in `apps/frontend/package.json`:
```json
{
  "preset": "jest-expo",
  "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
  "transformIgnorePatterns": ["node_modules/(?!((jest-)?react-native|...)"]
}
```

---

## Making a Pull Request (workflow demo)

```bash
# 1. Create a feature branch
git checkout -b feature/my-change

# 2. Make changes, commit
git add .
git commit -m "feat: my change"

# 3. Push and open PR
git push -u origin feature/my-change
gh pr create --title "feat: my change" --body "Description here"
# → GitHub Actions starts automatically
# → Both test-backend and test-frontend must be green
# → Then you can merge
```

---

## Adding GitHub Secrets (for deploy workflow)

After Railway services are created (see `docs/RAILWAY_DEPLOYMENT.md`):

```bash
# RAILWAY_TOKEN: Railway dashboard → Account Settings → Tokens
gh secret set RAILWAY_TOKEN --body 'your-railway-token'

# Service IDs: Railway dashboard → service → Settings → Service ID
gh secret set RAILWAY_SERVICE_ID_BACKEND --body 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
gh secret set RAILWAY_SERVICE_ID_FRONTEND --body 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
```

Verify secrets are set:
```bash
gh secret list
```

---

## Local Development

### Backend
```bash
# Start Postgres first
brew services start postgresql@14

# Start backend in watch mode
cd apps/backend
npm run start:dev
# → http://localhost:3000/api
```

### Frontend
```bash
cd apps/frontend
npm start
# → Expo dev server, open in browser at http://localhost:8081
```

### Restart backend (kill stuck port)
```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null
pkill -f "nest start" 2>/dev/null
cd apps/backend && npm run start:dev
```
