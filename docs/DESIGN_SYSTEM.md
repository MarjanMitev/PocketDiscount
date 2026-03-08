# PocketDiscount – Design System

This document describes the UI design system used in the PocketDiscount app: tokens, components, and usage guidelines for a consistent, Material Design 3–inspired experience across iOS, Android, and web.

---

## 1. Design Goals

- **App-store quality:** Modern, clear hierarchy, and familiar patterns (bottom nav, cards, chips, primary actions).
- **Material Design 3 influence:** Semantic color roles, elevation, type scale, and rounded components without strictly implementing full MD3.
- **Accessibility:** Sufficient contrast (onSurface on surface, onPrimary on primary), touch targets ≥ 44pt, and support for light/dark themes.
- **Consistency:** Single source for colours, spacing, radius, and typography so all screens feel part of one product.

---

## 2. Tokens

Tokens live in `apps/frontend/constants/theme.ts` and `constants/retailers.ts`.

### 2.1 Colors

Two schemes: `light` and `dark`. Use `Colors[colorScheme]` (e.g. from `useColorScheme()`).

**Primary (brand and CTAs):**

- `primary` – main green; buttons, active tab, key highlights.  
- `onPrimary` – text/icons on primary (e.g. white).  
- `primaryContainer` – light green background for badges/chips.  
- `onPrimaryContainer` – text on primaryContainer.

**Surfaces:**

- `background` – screen background.  
- `surface` – cards, sheets, inputs.  
- `surfaceContainer` – slightly elevated (e.g. input fill).  
- `onSurface` – primary text.  
- `onSurfaceVariant` – secondary text, hints.  
- `outline` / `outlineVariant` – borders, dividers.

**Semantic:**

- `danger` / `dangerContainer` / `onDanger` – errors, destructive actions.  
- `warning` / `warningContainer` – warnings, “not found” states.  
- `savings` / `savingsMuted` – discount/savings (often same as primary in this app).

Legacy names (`tint`, `text`, `card`, etc.) are still available and map to the above for gradual migration.

### 2.2 Typography

`Typography` in `theme.ts` defines a type scale (e.g. `displayLarge`, `headlineSmall`, `titleLarge`, `bodyMedium`, `labelLarge`). Use these for consistent hierarchy:

- **Display/Headline:** Hero titles, screen titles.  
- **Title:** Card titles, section headers.  
- **Body:** Descriptions, list content.  
- **Label:** Buttons, chips, captions.

Prefer these keys over ad-hoc `fontSize`/`fontWeight` so the app scales and stays consistent.

### 2.3 Elevation and shadows

`Elevation` (level0–level5) and `Shadows` (sm, md, lg, tinted) provide shadow/elevation for cards and buttons. Surfaces use `Elevation.level1` or `level2`; modals/overlays can use higher levels.

### 2.4 Radius and spacing

- **Radius:** `Radius.xs` … `Radius.xxl`, `Radius.full` for pills (chips, buttons).  
- **Spacing:** `Spacing.xs` … `Spacing.xxxl`. Use for padding and gaps; avoid magic numbers.

### 2.5 Retailer branding

`constants/retailers.ts`:

- `RETAILER_COLORS` – hex colour per retailer (AH, Jumbo, Lidl, etc.).  
- `getRetailerLabel(retailer)` – short name (e.g. “AH” for “Albert Heijn”).  
- `getRetailerColor(retailer, fallback)` – safe colour for badges and tags.

Use these for deal cards, map pins, and basket store headers so retailer identity is consistent.

---

## 3. Components

Reusable UI components live under `apps/frontend/components/ui/`.

### 3.1 AppBar

- **Purpose:** Top app bar with title and optional subtitle.  
- **Usage:** First child of screen content; pass `title`, `subtitle?`, `backgroundColor` (e.g. `colors.primary`).  
- **Behaviour:** Uses safe area insets; no nav controls in current implementation.

### 3.2 Surface

- **Purpose:** Elevated container (card, panel) with optional border.  
- **Props:** `elevation`, `borderRadius`, `padding`, `backgroundColor`, `style`.  
- **Usage:** Wrap card content; use `elevation="level1"` or `"level2"`, `Radius.lg`/`xl` for cards.

### 3.3 Chip

- **Purpose:** Filter chip (e.g. retailer filter).  
- **Props:** `label`, `selected`, `onPress`, and theme colours (`selectedBackgroundColor`, `unselectedBackgroundColor`, `borderColor`, text colours).  
- **Usage:** Horizontal list of chips; selected state uses primary colour.

### 3.4 Button

- **Purpose:** Primary/secondary actions (filled, tonal, outlined, text).  
- **Props:** `title`, `onPress`, `variant`, `disabled`, `loading`, `leftIcon`, `fullWidth`.  
- **Usage:** CTAs use `variant="filled"` and primary colour; secondary actions can use `tonal` or `outlined`.

### 3.5 IconSymbol (existing)

- **Purpose:** Cross-platform icon (SF Symbols on iOS, Material Icons on Android/web).  
- **Usage:** Tab bar and inline icons; names mapped in `components/ui/icon-symbol.tsx`.

### 3.6 AnimatedPressable (existing)

- **Purpose:** Press feedback (scale + optional haptic).  
- **Usage:** Wrap buttons and tappable cards for consistent interaction.

### 3.7 SkeletonCard (existing)

- **Purpose:** Loading placeholder for cards.  
- **Usage:** Deals screen while promotions are loading.

---

## 4. Screen Patterns

- **App bar:** Every main screen uses `AppBar` with title and subtitle and `backgroundColor={colors.primary}`.  
- **Content area:** ScrollView or FlatList on `colors.background`; cards on `colors.surface` with Surface + elevation.  
- **Empty/error states:** Icon (e.g. MaterialIcons) + title + body text + primary button, using Typography and semantic colors.  
- **Lists:** Section headers use `Typography.labelMedium` or `titleSmall`; list items use `bodyMedium`/`bodySmall` and semantic colours.  
- **Bottom tab bar:** Themed with `colors.surface`, `colors.primary` for active, and clear labels.

---

## 5. Do’s and Don’ts

**Do:**

- Use theme tokens (`Colors`, `Typography`, `Radius`, `Spacing`, `Elevation`) for all UI.  
- Use shared components (AppBar, Surface, Chip, Button) for consistency.  
- Use retailer helpers (`getRetailerLabel`, `getRetailerColor`) for any retailer-specific UI.  
- Prefer Material Icons (or IconSymbol) over emoji for a more polished, app-store look.  
- Support both light and dark via `useColorScheme()` and `Colors[scheme]`.

**Don’t:**

- Hardcode hex colours or font sizes that duplicate the token set.  
- Use emoji in headers or primary UI when an icon is available.  
- Mix different card styles (e.g. random borders vs elevation) on the same screen.

---

## 6. File Reference

| Asset | Path |
|-------|------|
| Theme tokens | `apps/frontend/constants/theme.ts` |
| Retailer constants | `apps/frontend/constants/retailers.ts` |
| AppBar | `apps/frontend/components/ui/AppBar.tsx` |
| Surface | `apps/frontend/components/ui/Surface.tsx` |
| Chip | `apps/frontend/components/ui/Chip.tsx` |
| Button | `apps/frontend/components/ui/Button.tsx` |
| IconSymbol | `apps/frontend/components/ui/icon-symbol.tsx` |

For implementation details and usage examples, refer to the screen files in `app/(tabs)/`.
