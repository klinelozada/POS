# POS Project Memory

## User Profile
- **Kline** - Project Lead. Makes all UX/architecture/priority decisions.
- Prefers concise communication, no fluff.
- Tests on device, reports bugs/features in batches.

## Workflow
- Follow `claude-code-workflow.md` in project root.
- Tickets before code. Design before code (for UI). Discuss before building.
- Design tool priority: Pencil (primary) > Claude design (supplementary).
- GitHub Issues = single source of truth.

## Project Overview
- **App:** Joe Street Cafe & Study Lounge — Restaurant POS System
- **Location:** Sitio Malinong East, Brgy. Layog, Maasin, Iloilo 5030
- **Tech stack:** React + TypeScript + Vite (PWA) + Firebase (Firestore, Auth)
- **Platforms:** Web, Tablet, Mobile (Android + iOS via PWA)
- **Repo:** https://github.com/klinelozada/POS
- **Branches:** `master` (production), `dev` (development)
- **Dev server:** `npm run dev` → localhost:5173 (hot reload)
- **Firebase config:** env-based, see `.env.example`
- **Font:** Inter (everywhere, headings + body)
- **Design direction:** Warm tones (browns, golds, cream), Joe Street branding

## Architecture
- Single React PWA, route-based:
  - `/kiosk/*` — Customer (no auth)
  - `/pos/*` — Cashier/Admin (auth)
  - `/pos/customer-display` — Customer-facing (display-only)
  - `/prep/*` — Prep counter (auth)
  - `/kitchen/*` — Kitchen counter (auth)
- Firebase Firestore for real-time order sync
- Firebase Auth for POS/Prep/Kitchen login (no auth for kiosk)
- Thermal printer via browser print API
- See [system-spec.md](./system-spec.md) for full details

## Stations
- **Kiosk** (x2) — Customer self-order at entrance
- **POS Cashier** (x1) — Order dashboard, payments, menu mgmt
- **POS Customer Display** (x1) — Display-only order verification
- **Prep Counter** (x1) — Drinks/simple items, 20/30/50 layout
- **Kitchen** (x1) — Meals/cooked items, same layout as Prep

## Current Status
- Phase: All screens designed. Development plan created. Awaiting approval to begin coding.
- All screens done: Kiosk (7), POS (6), Prep (2), Kitchen (2), Customer Display (1), Admin (9)
- 2 presentation boards: POS Solo Flow, Kiosk Flow
- Dev plan: [dev-plan.md](./dev-plan.md) — 6 phases, parallel agents (A: Admin, B: Kiosk+POS+Stations)
- See [work-log.md](./work-log.md) for session progress

## Key Files
- `claude-code-workflow.md` - Team workflow document
- `Joe Street Cafe Menu.pdf` - Source menu (image-based, 9 pages)
- `menu_page_*.png` - Extracted menu page images
- `menu_items/*.png` - Cropped individual item photos
- `src/firebase.ts` - Firebase config
- Pencil design file: `pencil-new.pen` (in VS Code extension data)
