# PocketDiscount – Architecture

This document describes the high-level architecture, data flow, and key technical decisions for the PocketDiscount super app.

---

## 1. System Overview

PocketDiscount is a **monorepo** containing:

- **Backend** (`apps/backend`): NestJS REST API that aggregates grocery data from multiple retailers, serves store locations, and runs the basket optimisation algorithm.
- **Frontend** (`apps/frontend`): Expo (React Native) app for iOS, Android, and web with four main flows: Deals, Basket Optimiser, Store Map, and Receipt Scanner.

```
┌─────────────────────────────────────────────────────────────────┐
│                     PocketDiscount Frontend                        │
│  (Expo / React Native – iOS, Android, Web)                        │
│  • Deals (promotions grid)  • Basket optimiser                    │
│  • Store map & navigation   • Receipt scanner (camera + OCR)       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP/REST (EXPO_PUBLIC_API_URL)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PocketDiscount Backend                        │
│  (NestJS – Node.js)                                              │
│  • /api/scrapers/*  – promotions, search, refresh                 │
│  • /api/stores/*    – locations, nearest-by-GPS                   │
│  • /api/basket/optimize – basket split by store                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   Scraper cache           In-memory store         (Future: Postgres
   (30 min TTL)             locations               + BullMQ jobs)
```

---

## 2. Backend Architecture

### 2.1 Stack

- **Runtime:** Node.js 24.x  
- **Framework:** NestJS 11.x (modular structure, dependency injection)  
- **Scraping:** Puppeteer for JS-rendered pages; direct HTTP for JSON APIs  
- **Scheduling:** `@nestjs/schedule` for cron (e.g. hourly scrape refresh)  
- **Validation:** `class-validator` + `class-transformer` on DTOs  
- **Persistence:** Currently in-memory (scraper cache + hardcoded store list). Implementation plan foresees PostgreSQL + PostGIS for stores and product data.

### 2.2 Modules

| Module      | Responsibility |
|------------|----------------|
| `AppModule` | Root module; wires Config, Schedule, Scrapers, Stores, Basket. |
| `ScrapersModule` | Registers retailer-specific scrapers (AH, Jumbo, Lidl, Troli, etc.), cache TTL, and exposes `/promotions`, `/search`, `/refresh`. |
| `StoresModule` | Store locations and geo: `/stores`, `/stores?city=`, `/stores/nearest?lat=&lng=&limit=`. |
| `BasketModule` | Calls scrapers for full product set, runs basket optimisation, returns plan + totals. |

### 2.3 Scraper Design

- **Interface:** Each scraper implements a common interface (e.g. `scrapePromotions(): Promise<Product[]>`).
- **Isolation:** One adapter per retailer so a single site change does not break others.
- **Caching:** `ScrapersService` holds a single cache (per retailer key) with configurable TTL (e.g. 30 minutes). Cron triggers refresh; manual refresh via `/api/scrapers/refresh`.
- **Resilience:** `Promise.allSettled` so one failing scraper does not fail the whole aggregation; partial results are returned.

### 2.4 Basket Optimisation

- **Input:** List of product queries (e.g. `["melk", "brood", "cola"]`).
- **Logic:** For each query, find all matching products across retailers (name/category), pick cheapest, compute savings vs original price, then group by retailer and sort (e.g. by item count).
- **Output:** `BasketResult`: `plan` (store groups with items and subtotals), `itemsNotFound`, `totalCost`, `totalSavings`.

Stores and product data are currently in-memory; moving to a DB would allow persistence, history, and faster lookups without re-scraping on every request.

---

## 3. Frontend Architecture

### 3.1 Stack

- **Framework:** Expo SDK 54, React 19, React Native 0.81  
- **Routing:** File-based routing with `expo-router`; tabs for the four main screens.  
- **Maps:** `react-native-maps` (native map on iOS/Android; list fallback on web).  
- **Camera:** `expo-camera` for receipt scanning (native only; web shows feature placeholder).  
- **Location:** `expo-location` for “nearest stores”.  
- **UI:** Custom design system (Material Design 3–inspired tokens); see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

### 3.2 App Structure

```
app/
  _layout.tsx          # Root Stack + theme
  (tabs)/
    _layout.tsx       # Tab bar config (icons, labels, theme)
    index.tsx         # Deals (Aanbiedingen)
    basket.tsx        # Basket optimiser
    map.tsx           # Stores map + list
    scanner.tsx       # Receipt scanner
  modal.tsx           # Optional modal
```

- **State:** Local component state and `useCallback`/`useMemo` where useful (e.g. product list, filters). No global state library in MVP.
- **API:** Single `api` object in `services/api.ts` with typed methods; central base URL from `EXPO_PUBLIC_API_URL`; user-friendly error messages for HTTP/network.

### 3.3 Data Flow (Typical)

1. **Deals:** Mount → `api.getPromotions()` → set state → render grid; pull-to-refresh calls same endpoint. Filter/search in memory.
2. **Basket:** User enters list → `api.optimizeBasket(items)` → display plan and “not found” list.
3. **Map:** Request location (if allowed) → `api.getNearestStores(lat, lng)` or `api.getStores()` → render map + list; filter by retailer in memory.
4. **Scanner:** Camera capture → (currently mock) OCR parsing → local state for items/total; no backend call in current MVP.

---

## 4. Security and Operations

- **CORS:** Backend allows `*` in development; should be restricted to frontend origins in production.
- **Secrets:** No secrets in repo; backend uses `process.env` (e.g. `PORT`); frontend uses `EXPO_PUBLIC_*` for build-time config.
- **Scraping:** Respects retailer sites’ structure and load; cache reduces request rate. No authentication to retailer sites in current design.

---

## 5. Future Considerations (from implementation plan)

- **PostgreSQL + PostGIS:** Store locations and product data; run scrapers as background jobs (e.g. BullMQ + Redis).
- **OCR:** Replace mock receipt parsing with on-device Vision or a dedicated OCR service and persist receipt history.
- **Auth:** Optional user accounts for saved lists, receipt history, and premium features (e.g. “Future” bonuses, advanced route options).

---

## 6. Document References

- [Business Plan](../business_plan.md) – Vision, competitors, revenue.  
- [Implementation Plan](../implementation_plan.md) – Phases, tech choices, verification.  
- [Personas](../personas.md) – User types and use cases.  
- [Design System](./DESIGN_SYSTEM.md) – Tokens, components, and UI guidelines.
