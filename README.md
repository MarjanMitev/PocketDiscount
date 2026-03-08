# PocketDiscount

A grocery savings app for the Dutch market. Compare prices and promotions across 9 supermarkets (Albert Heijn, Jumbo, Lidl, Aldi, Dirk, Plus, Vomar, Spar, Etos), optimise your shopping basket across stores, find nearby shops on a map, and scan receipts to track spending.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Backend](#backend)
  - [Install & Run (Development)](#install--run-development)
  - [Run in Production](#run-in-production)
  - [Run in Debug Mode](#run-in-debug-mode)
  - [Build](#build)
  - [Tests](#tests)
  - [Available Scripts](#available-scripts-backend)
  - [API Reference](#api-reference)
- [Frontend](#frontend)
  - [Install & Run](#install--run)
  - [Run on iOS Simulator](#run-on-ios-simulator)
  - [Run on Android Emulator](#run-on-android-emulator)
  - [Run on a Physical Device](#run-on-a-physical-device)
  - [Run in the Browser (Web)](#run-in-the-browser-web)
  - [Build for Production (EAS)](#build-for-production-eas)
  - [Lint](#lint)
  - [Available Scripts](#available-scripts-frontend)
- [App Screens](#app-screens)
- [Icon System](#icon-system)
- [Debugging](#debugging)
  - [Backend Debugging](#backend-debugging)
  - [Frontend / React Native Debugging](#frontend--react-native-debugging)
  - [Common Issues & Fixes](#common-issues--fixes)

---

## Project Structure

```
PocketDiscount/
├── apps/
│   ├── backend/                  # NestJS REST API
│   │   └── src/
│   │       ├── main.ts           # Bootstrap: CORS, prefix, validation
│   │       ├── app.module.ts     # Root module
│   │       ├── scrapers/         # Web scrapers per retailer + caching
│   │       │   ├── ah.scraper.ts
│   │       │   ├── jumbo.scraper.ts
│   │       │   ├── lidl.scraper.ts
│   │       │   ├── troli.scraper.ts
│   │       │   ├── scraper.interface.ts
│   │       │   ├── scrapers.service.ts
│   │       │   └── scrapers.controller.ts
│   │       ├── stores/           # Store locations & geolocation
│   │       │   ├── stores.service.ts
│   │       │   └── stores.controller.ts
│   │       └── basket/           # Basket optimiser
│   │           ├── basket.service.ts
│   │           └── basket.controller.ts
│   └── frontend/                 # Expo (React Native) app
│       ├── app/
│       │   └── (tabs)/
│       │       ├── index.tsx     # Deals / Aanbiedingen screen
│       │       ├── basket.tsx    # Basket Optimiser screen
│       │       ├── map.tsx       # Stores Map screen
│       │       ├── scanner.tsx   # Receipt Scanner screen
│       │       └── _layout.tsx   # Tab bar configuration
│       ├── services/
│       │   ├── api.ts            # Typed API client
│       │   └── types.ts          # Shared TypeScript interfaces
│       ├── constants/
│       │   ├── theme.ts          # Design tokens (colors, typography, elevation, spacing)
│       │   └── retailers.ts      # Retailer colours and labels
│       ├── components/
│       │   ├── ui/               # Design system components
│       │   │   ├── icon-symbol.tsx
│       │   │   ├── AppBar.tsx
│       │   │   ├── Surface.tsx
│       │   │   ├── Chip.tsx
│       │   │   └── Button.tsx
│       └── app.json              # Expo config (permissions, bundle IDs)
├── docs/
│   ├── ARCHITECTURE.md   # System architecture and data flow
│   └── DESIGN_SYSTEM.md  # UI tokens and components
├── business_plan.md
├── implementation_plan.md
└── personas.md
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 24.x |
| Backend framework | NestJS | 11.x |
| Backend language | TypeScript | 5.7 |
| Web scraping | Puppeteer | 24.x |
| Scheduled tasks | @nestjs/schedule | 6.x |
| Validation | class-validator / class-transformer | 0.14 / 0.5 |
| Frontend framework | Expo | 54.x |
| UI library | React Native | 0.81 |
| Navigation | expo-router (file-based) | 6.x |
| Maps | react-native-maps | 1.20 |
| Camera | expo-camera | 17.x |
| Location | expo-location | 19.x |
| Icons (iOS) | expo-symbols (SF Symbols) | 1.x |
| Icons (Android/Web) | @expo/vector-icons MaterialIcons | 15.x |

The frontend uses a **Material Design 3–inspired design system** (tokens, typography, elevation, and shared components) for consistent, app-store quality UI. See [Design System](docs/DESIGN_SYSTEM.md).

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | High-level architecture, backend/frontend structure, data flow, and future directions. |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Design tokens (colors, typography, spacing, elevation), UI components, and usage guidelines. |
| [business_plan.md](business_plan.md) | Product vision, competitors, revenue model. |
| [implementation_plan.md](implementation_plan.md) | Phases, tech choices, and verification plan. |
| [personas.md](personas.md) | User personas (Efficient Planner, Deals Hunter, Inflation Watcher). |

---

## Prerequisites

Make sure the following are installed before starting:

- **Node.js** ≥ 18 (v24 recommended) — [nodejs.org](https://nodejs.org)
- **npm** ≥ 10
- **Expo CLI** — installed automatically via `npx`, no global install needed
- **Xcode** ≥ 15 (macOS only) — required for iOS simulator
- **Android Studio** with an AVD configured — required for Android emulator
- **Expo Go app** — optional, for running on a physical device without building

Check your versions:

```bash
node --version   # should print v18+ or v24+
npm --version    # should print 10+
```

---

## Environment Setup

The frontend reads a single environment variable to locate the backend API.

```bash
cd apps/frontend
cp .env.example .env
```

Edit `apps/frontend/.env`:

```env
# Local development (default)
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Physical device on the same Wi-Fi — replace with your machine's LAN IP
# EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api

# Deployed backend
# EXPO_PUBLIC_API_URL=https://api.pocketdiscount.nl/api
```

> **Important for physical devices:** `localhost` on your phone points to the phone itself, not your Mac. Use your machine's LAN IP address (find it with `ipconfig getifaddr en0` on macOS).

---

## Backend

### Install & Run (Development)

```bash
cd apps/backend
npm install
npm run start:dev
```

- Starts NestJS with **watch mode** — the server restarts automatically on every file change.
- API is available at `http://localhost:3000/api`.
- Swagger/OpenAPI is not configured by default; use the [API Reference](#api-reference) section below or a tool like Insomnia/Postman.

### Run in Production

```bash
cd apps/backend
npm run build          # compiles TypeScript → dist/
npm run start:prod     # runs node dist/main
```

### Run in Debug Mode

```bash
cd apps/backend
npm run start:debug
```

This starts NestJS with `--inspect` on the default Node.js debugger port **9229**. You can then:

- Open **Chrome DevTools** → `chrome://inspect` → click "Open dedicated DevTools for Node"
- Or attach **VS Code** using the launch config below (add to `.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to NestJS",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/apps/backend/dist/**/*.js"]
    }
  ]
}
```

### Build

```bash
cd apps/backend
npm run build
```

Compiles TypeScript to `apps/backend/dist/`. The output is a plain Node.js application — no additional runtime tools required.

**PostgreSQL (stores)**  
The backend uses **PostgreSQL** for store locations. You must have Postgres running and set `DATABASE_URL` in `apps/backend/.env`.

1. **Start PostgreSQL** (if not already running).  
   macOS (Homebrew): `brew services start postgresql@14`.  
   Linux: `sudo systemctl start postgresql`.
2. Create the database: `createdb pocketdiscount`.
3. Set `DATABASE_URL` in `apps/backend/.env`, e.g.:
   ```env
   DATABASE_URL=postgresql://YOUR_USER@localhost:5432/pocketdiscount
   ```
   On macOS with Homebrew Postgres, the default superuser is your Mac user (no password): `postgresql://mmitev@localhost:5432/pocketdiscount`.
4. Seed the stores table (once): `cd apps/backend && npm run seed`.

Without a valid `DATABASE_URL`, the backend will fail to start. The `Store` entity and TypeORM are in `src/stores/store.entity.ts` and `stores.service.ts`.

### Tests

```bash
cd apps/backend

# Run all unit tests
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# Coverage report (outputs to apps/backend/coverage/)
npm run test:cov

# End-to-end tests
npm run test:e2e

# Debug tests (attach a debugger to port 9229)
npm run test:debug
```

### Available Scripts (Backend)

| Script | Description |
|---|---|
| `npm run start` | Start compiled app (requires build first) |
| `npm run start:dev` | Start with file watcher (development) |
| `npm run start:debug` | Start with Node.js debugger on port 9229 |
| `npm run start:prod` | Start `dist/main` directly (production) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run format` | Run Prettier on `src/` and `test/` |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:cov` | Jest with coverage report |
| `npm run test:e2e` | Jest end-to-end tests |

### API Reference

All routes are prefixed with `/api`. CORS is open (`*`) in development.

#### Scrapers / Promotions

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/scrapers/promotions` | Returns cached promotions from all retailers (product images are downloaded, optimized, and served from this API) |
| `GET` | `/api/scrapers/search?q=melk` | Search products across all retailers |
| `GET` | `/api/scrapers/refresh` | Force a cache refresh (triggers all scrapers and re-downloads missing images) |
| `GET` | `/api/assets/product-images/:retailer/:filename` | Serves optimized product images (WebP, max 400px) stored under `apps/backend/data/product-images/` |

**Example — get promotions:**
```bash
curl http://localhost:3000/api/scrapers/promotions
```

**Example — search:**
```bash
curl "http://localhost:3000/api/scrapers/search?q=cola"
```

#### Stores

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stores` | All store locations (50+ entries) |
| `GET` | `/api/stores?city=Amsterdam` | Filter stores by city |
| `GET` | `/api/stores/nearest?lat=52.37&lng=4.90&limit=10` | Nearest stores by GPS coordinate |

**Example — nearest stores:**
```bash
curl "http://localhost:3000/api/stores/nearest?lat=52.3676&lng=4.9041&limit=5"
```

#### Receipts (OCR)

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/receipts/ocr` | `{ "imageBase64": "<base64>" }` | Extract text from receipt image (Dutch + English). Used by the Scanner tab. |

#### Basket Optimiser

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/basket/optimize` | `{ "items": ["melk", "brood", "cola"] }` | Find cheapest store combination |

**Example:**
```bash
curl -X POST http://localhost:3000/api/basket/optimize \
  -H "Content-Type: application/json" \
  -d '{"items": ["melk", "brood", "appels"]}'
```

**Response shape:**
```json
{
  "plan": [
    {
      "retailer": "Albert Heijn",
      "items": [
        { "query": "melk", "product": { "name": "Halfvol melk 1L", "price": 1.09 } }
      ],
      "subtotal": 1.09
    }
  ],
  "itemsNotFound": [],
  "totalCost": 1.09,
  "totalSavings": 0.40
}
```

---

## Frontend

### Install & Run

```bash
cd apps/frontend
npm install
npx expo start
```

This opens the **Expo Dev Tools** in your terminal. From there, press the key for your target:

| Key | Target |
|---|---|
| `i` | iOS Simulator (macOS + Xcode required) |
| `a` | Android Emulator (Android Studio + AVD required) |
| `w` | Web browser |

### Run on iOS Simulator

Requires **macOS** with **Xcode** installed and at least one simulator downloaded.

```bash
cd apps/frontend
npm run ios
# or
npx expo start --ios
```

If you have multiple simulators, Expo will prompt you to choose one. To open a specific device:

```bash
npx expo start --ios --device "iPhone 16 Pro"
```

> **react-native-maps** renders a native `MapView` on iOS. The Simulator must have Location Services enabled: Simulator → Features → Location → Custom Location.

### Run on Android Emulator

Requires **Android Studio** with an **AVD** (Android Virtual Device) running.

```bash
cd apps/frontend
npm run android
# or
npx expo start --android
```

Ensure `ANDROID_HOME` is set and `adb devices` shows your emulator before running.

```bash
# Check emulator is visible to adb
adb devices
```

### Run on a Physical Device

1. Install **Expo Go** from the App Store (iOS) or Google Play (Android).
2. Update `apps/frontend/.env` to use your machine's LAN IP instead of `localhost`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api
   ```
3. Start the backend so it listens on all interfaces — it does by default with NestJS.
4. Run `npx expo start` and scan the QR code shown in the terminal with:
   - **iOS**: the built-in Camera app
   - **Android**: the Expo Go app

> The phone and your Mac must be on the same Wi-Fi network.

### Run in the Browser (Web)

```bash
cd apps/frontend
npm run web
# or
npx expo start --web
```

Opens at `http://localhost:8081`.

**Web-specific behaviour:**
- The **Stores** screen renders a scrollable store list instead of the interactive map (`react-native-maps` is native only).
- The **Scanner** screen shows a feature overview instead of the camera view (`expo-camera` is native only). On device, the app sends the captured photo to `/api/receipts/ocr` for text extraction.
- The **Deals** and **Basket** screens work fully in the browser.

### Build for Production (EAS)

Production builds use **Expo Application Services (EAS)**. You need an Expo account.

```bash
npm install -g eas-cli
eas login

cd apps/frontend

# iOS .ipa (requires Apple Developer account)
eas build --platform ios

# Android .apk / .aab
eas build --platform android

# Both platforms
eas build --platform all
```

For a local build without EAS cloud (requires Xcode / Android SDK locally):

```bash
# iOS
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

### Lint

```bash
cd apps/frontend
npm run lint
# or
npx expo lint
```

Uses `eslint-config-expo` with the TypeScript plugin. The project currently passes with **0 errors and 0 warnings**.

### Available Scripts (Frontend)

| Script | Description |
|---|---|
| `npm start` | Start Expo dev server (interactive menu) |
| `npm run ios` | Start and open iOS Simulator |
| `npm run android` | Start and open Android Emulator |
| `npm run web` | Start web dev server at port 8081 |
| `npm run lint` | Run ESLint via `expo lint` |

---

## App Screens

| Tab | File | Description |
|---|---|---|
| Aanbiedingen | `app/(tabs)/index.tsx` | Browse promotions from all 9 retailers. Search bar, retailer filter chips, 2-column product grid with discount badges. Pull-to-refresh. |
| Mandje | `app/(tabs)/basket.tsx` | Paste a shopping list (one item per line). Calls `/api/basket/optimize` and shows the cheapest store breakdown with total savings. |
| Winkels | `app/(tabs)/map.tsx` | Interactive map on iOS/Android (react-native-maps). List view on web. Requests location permission and shows nearest stores with distance, opening hours, and a one-tap navigate button. |
| Scanner | `app/(tabs)/scanner.tsx` | Receipt scanner using expo-camera. Captured photo is sent to backend OCR (`/api/receipts/ocr`); item names and prices are parsed from the returned text. Web shows a feature description. |

---

## Icon System

Icons use **SF Symbols** on iOS (via `expo-symbols`) and fall back to **Material Icons** on Android and web (via `@expo/vector-icons/MaterialIcons`). The mapping lives in `components/ui/icon-symbol.tsx`:

```
SF Symbol name          Material Icon name
─────────────────────   ──────────────────
house.fill           →  home
paperplane.fill      →  send
chevron.right        →  chevron-right
tag.fill             →  local-offer        (Aanbiedingen tab)
cart.fill            →  shopping-cart      (Mandje tab)
map.fill             →  map                (Winkels tab)
camera.fill          →  camera-alt         (Scanner tab)
```

To add a new icon, add one entry to the `MAPPING` object in `icon-symbol.tsx` — the SF Symbol name as the key and the Material Icon name as the value.

---

## Debugging

### Backend Debugging

**View live logs:**

```bash
cd apps/backend
npm run start:dev
```

NestJS prints bootstrap logs, route registration, and any runtime errors to stdout. The scraper module also logs cache hits/misses and scrape errors.

**Attach VS Code debugger:**

1. Run `npm run start:debug` in the backend directory.
2. Add this config to `.vscode/launch.json` at the project root:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach NestJS",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/apps/backend/dist/**/*.js"]
    }
  ]
}
```

3. Press `F5` in VS Code — breakpoints in `.ts` source files will be hit.

**Test endpoints manually:**

```bash
# Verify the server is up
curl http://localhost:3000/api/scrapers/promotions | head -c 500

# Force a fresh scrape
curl http://localhost:3000/api/scrapers/refresh

# Test basket optimiser
curl -X POST http://localhost:3000/api/basket/optimize \
  -H "Content-Type: application/json" \
  -d '{"items":["melk","brood"]}'
```

**Check scraper cache:**

The scrapers cache results for 30 minutes. Cached data is stored in memory (resets on server restart). To force a re-scrape without restarting:

```bash
curl http://localhost:3000/api/scrapers/refresh
```

---

### Frontend / React Native Debugging

**Expo Dev Tools (in-terminal):**

When `npx expo start` is running, the terminal menu gives you:
- `r` — reload the app
- `m` — toggle the in-app dev menu
- `j` — open the JS debugger (Hermes)
- `o` — open in the browser

**React Native Debugger (recommended):**

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger).
2. Start it before running `expo start`.
3. In the app, shake the device (or press `Cmd+D` in simulator) → "Open Debugger".

**Expo DevTools in the browser:**

```bash
npx expo start --dev-client
```

Then visit `http://localhost:8081` — the browser console shows React Native logs.

**Debugging with VS Code (Hermes engine):**

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Expo (Hermes)",
      "type": "reactnativedirect",
      "request": "launch",
      "platform": "ios"
    }
  ]
}
```

Requires the [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native) VS Code extension.

**Logging:**

Use `console.log` freely during development — output appears in the Expo terminal and in the browser console when running on web. For structured logging you can also use `console.warn` and `console.error` which surface as yellow/red banners in the app.

**Network requests:**

To inspect API calls made by the app, use the **Network** tab in React Native Debugger or install [Reactotron](https://github.com/infinitered/reactotron):

```bash
npm install --save-dev reactotron-react-native
```

---

### Common Issues & Fixes

**`Network request failed` on physical device**

The app cannot reach `localhost` from a physical phone. Update `.env`:
```env
EXPO_PUBLIC_API_URL=http://<your-mac-lan-ip>:3000/api
```
Find your LAN IP:
```bash
ipconfig getifaddr en0
```

---

**`Unable to resolve module react-native-maps`**

Run the install again and clear the Metro cache:
```bash
cd apps/frontend
npm install
npx expo start --clear
```

---

**iOS Simulator shows a blank map**

1. Check that `react-native-maps` is linked. With Expo SDK 54 it is auto-linked — no manual step needed.
2. In the Simulator, enable a location: **Simulator → Features → Location → Custom Location** (e.g. 52.3676, 4.9041 for Amsterdam).
3. The map will be blank if the backend is unreachable and the stores list is empty. Confirm the backend is running first.

---

**Camera permission denied**

On iOS Simulator, permissions are granted automatically. On a real device, go to **Settings → PocketDiscount → Camera** and enable access. The app shows a permission request screen with an "Allow" button before opening the camera.

---

**Backend exits with `Error: Cannot find module '@nestjs/config'`**

Dependencies are missing. Run:
```bash
cd apps/backend
npm install
```

---

**Port 3000 already in use**

```bash
# Find the process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```
Or change the port in `apps/backend/src/main.ts`:
```ts
await app.listen(process.env.PORT ?? 3001);
```

---

**Metro bundler cache issues (frontend)**

```bash
cd apps/frontend
npx expo start --clear
```

---

**TypeScript errors after pulling changes**

```bash
cd apps/backend && npm install
cd ../frontend && npm install
```

---

**Expo SDK version mismatch warning**

If you see warnings about mismatched package versions, run:
```bash
cd apps/frontend
npx expo install --check
```

This will list any packages that need to be updated to match the installed Expo SDK version.
