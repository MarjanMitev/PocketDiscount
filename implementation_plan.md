# Implementation Plan - PocketDiscount Super App

# Goal Description

Build a comprehensive iOS "Super App" for grocery savings in the Netherlands, covering 9 major retailers.

## User Review Required
>
> [!IMPORTANT]
> **Scraping Scale:** Scraping 9 different retailers requires significant maintenance. We will separate scrapers into individual micro-modules to prevent one site change from breaking the whole system.
> **Stock Accuracy:** Most retailers do NOT share exact inventory counts (e.g., "3 left"). We will scrape "Availability Status" (Available/Low/Out) and display that. If a retailer provides numbers, we will show them.
> **OCR Tech:** For receipt scanning, we will initially use on-device iOS Vision framework (free, privacy-friendly) rather than a paid API.

## Proposed Changes / Architecture

### 1. High-Level Architecture

* **Frontend:** React Native (Expo).
  * **Maps:** `react-native-maps` (Google Maps).
    * *Feature:* Custom Markers to render Product Images (e.g., Cola Bottle) directly on the map canvas.
    * *Navigation:* Deep-linking to Google Maps/Apple Maps Scheme for turn-by-turn directions.
  * **Vision:** `react-native-vision-camera` + Text Recognition.
* **Backend:** Node.js (NestJS).
  * **Queue:** BullMQ (Redis).
  * **DB:** PostgreSQL (PostGIS) for location data.

### 2. The Scraper Engine (Crucial)

We need 9 distinct adapters. Prioritized ordered list:

1. `AHScraper` (Complex, JSON API reverse engineering)
2. `JumboScraper` (Complex, JSON API)
3. `LidlScraper` (HTML parsing)
4. `AldiScraper` (HTML parsing)
5. `PlusScraper` (Flyer/PDF parsing often needed)
6. `DirkScraper`
7. `VomarScraper`
8. `SparScraper`
9. `EtosScraper`

### 3. Feature Implementation Phases

#### Phase 1: Foundation & Data (Weeks 1-2)

* [x] Setup NestJS Backend (in-memory; Postgres optional later).
* [x] Implement Scrapers for Top 3 + Troli (AH, Jumbo, Lidl, Troli aggregated). Plus, Dirk, Plus, Vomar, Spar, Etos in store list.
* [ ] **Stock Logic:** Add `stock_status` enum (AVAILABLE, LOW, OOS) to Product Schema when retailers expose it.

#### Phase 2: App & Map (Weeks 3-4)

* [x] iOS/Android/Web App Skeleton (Expo).
* [x] Map View: User location and store pins; list fallback on web.
* [x] **Smart Navigation:** "Navigeer" opens Apple/Google Maps with store destination.

#### Phase 3: "Super App" Logic (Weeks 5-6)

* [x] **Basket Optimizer:** Algorithm and API; list → store groups with subtotals and savings.
* [x] **Receipt Scanner:** Camera integration; real OCR via backend Tesseract.js (`POST /api/receipts/ocr`); frontend sends base64 photo and parses returned text.

#### Scrapers (9 retailers)

* [x] Stubs for Plus, Dirk, Vomar, Spar, Etos (return empty list until site-specific logic is added).
* [x] AH, Troli, Jumbo, Lidl implemented or mock.

#### Optional Postgres (stores)

* [x] `Store` entity and `STORE_LOCATIONS` export for seeding.
* [x] Seed script: `scripts/seed-stores.ts` (run with `DATABASE_URL` set). App continues to use in-memory stores until `StoresService` is switched to TypeORM repository.

#### Design & documentation (done)

* [x] Material Design 3–inspired design system (tokens, typography, elevation, shared components).
* [x] App bar, Surface cards, Chips, consistent retailer colours and labels.
* [x] ARCHITECTURE.md and DESIGN_SYSTEM.md; README updated with doc links.

## Verification Plan

* **Scraper Validation:** Daily cron reports showing % of successful scrapes per retailer.
* **Accuracy Check:** Manually verify 5 random products from each of the 9 stores against their real websites.
* **Route Test:** Simulate a location (e.g., Amsterdam Central) and verify the app suggests the physically closest cheapest store.
