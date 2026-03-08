# PocketDiscount - The Ultimate Grocery Super App

## 1. Executive Summary

**PocketDiscount** acts as the single point of truth for Dutch grocery shopping. It combines the best features of existing competitors (list optimization, receipt scanning, budgeting) with a unique **Geo-Spatial Route Optimizer** and **Predictive "Future" Bonuses**.

**Supported Retailers (9):**

1. Albert Heijn
2. Jumbo
3. Plus
4. Lidl
5. Aldi
6. Dirk
7. Vomar
8. Spar
9. Etos (Drugstore/Personal Care)

## 2. Competitive Landscape & Gap Analysis

| Competitor | Key Strength | Critical Missing Feature |
| :--- | :--- | :--- |
| **Troli** | "Smart Assistant" & Budgeting. Good voice input and categorization. | Lacks multi-store route splitting. Does not focus on map-based discovery. |
| **Lijssie** | "Basket Optimization". Splits list across stores for cheapest *total*. | No receipt scanning. Limited product discovery interface. |
| **Checkjebon** | "Receipt Scanning". fast post-purchase comparison. | Reactive tool (after purchase), not proactive (planning). Lacks route optimization. |
| **Supermarket Apps** | Loyalty integration (Bonuskaart). | Single-vendor lock-in. Cannot compare prices. |

## 3. The "Super App" Solution

**PocketDiscount** will implement **ALL** the above missing features in one unified Material Design interface:

### Core Feature Set (MVP & Beyond)

1. **Smart Basket Optimizer (like Lijssie):**
    * Input: "Milk, Bread, Cola".
    * Output: "Buy Milk & Bread at **Lidl** (Save €1.50). Buy Cola at **Jumbo** (Promo 2+1)."
2. **Receipt Scanner (like Checkjebon):**
    * Scan past receipts to train the algorithm on your buying habits and track actual inflation.
3. **Smart Assistant (like Troli):**
    * Voice input, category sorting, and monthly budgeting alerts.
4. **UNIQUE: "Product on Map" & Navigation:**
    * **Visual Map:** Instead of just red generic pins, show the *product icon* (e.g., a tiny Coca-Cola bottle) on the map location where it is cheapest.
    * **In-App Navigation:** "Take me there" button that opens Google/Apple Maps with the optimized multi-stop route pre-loaded.
5. **UNIQUE: "Future" Bonuses:**
    * Predictive analytics to show *next week's* probable deals.

## 4. Technical Feasibility & Risks

* **Exact Stock Quantity ("How many pieces left?"):**
  * *Constraint:* Most supermarkets (AH, Jumbo) only output "In Stock" (Available) or "Out of Stock" via their public-facing data. They rarely expose "5 items left" for privacy/competitive reasons.
  * *Solution:* We will display **"Available" / "Low Stock" / "Out of Stock"** indicators based on the scraped data. *Exact* counts will be shown only if the specific retailer exposes that API field.

## 5. Revenue Model

* **Premium Subscription (€3.99/mo):**
  * Unlimited Receipt Scans.
  * Advanced Route Optimization (Gas cost calculator).
  * "Future" Bonus Preview.
* **Data Monetization (B2B):**
  * Sell aggregated formatting/pricing data to market researchers (anonymized).

## 6. Implementation Stages

* **Phase 1 (The Aggregator):** Scrapers for all 9 stores. Database population.
* **Phase 2 (The Map):** iOS App with Map View and basic "Search" comparison.
* **Phase 3 (The Optimizer):** Basket splitting logic and Receipt Scanning (OCR).
