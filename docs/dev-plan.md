# Development Plan — Joe Street Cafe POS

## Overview
React + TypeScript + Vite PWA with Firebase (Firestore, Auth, Cloud Functions).
All screens designed in Pencil. Ready for implementation.

## Phase 1: Backend Foundation

### 1.1 Firebase Setup
- [ ] Create Firebase project (joe-street-pos)
- [ ] Enable Firestore (production mode)
- [ ] Enable Firebase Auth (Email/Password + Anonymous)
- [ ] Set up Cloud Functions project
- [ ] Configure `.env` with real Firebase credentials
- [ ] Set up Firestore security rules (role-based)

### 1.2 Data Models & Seeding
- [ ] Create Firestore collections schema:
  - `categories` — name, displayOrder, icon, isActive, defaultStation, description
  - `menuItems` — name, categoryId, basePrice, description, photo, variants[], isAvailable, station, prepInstructions
  - `addOnGroups` — name, applicableCategories[], items[] (name, price)
  - `orders` — orderNumber, type, items[], total, paymentMethod, status, prepStatus, kitchenStatus, createdAt
  - `promos` — name, type, conditions, isActive, categories[]
  - `users` — name, email, role, station, pin, isActive
  - `settings` — currentOrderNumber, cafeInfo, stationRouting
- [ ] Create seed script with full Joe Street menu data (all categories, items, prices from PDF)
- [ ] Upload menu item photos to Firebase Storage
- [ ] Create TypeScript types for all models (`src/types/`)

### 1.3 Cloud Functions
- [ ] `onOrderCreated` — auto-increment order number, auto-route items to prep/kitchen
- [ ] `onOrderItemCompleted` — check if all items done → mark order completed
- [ ] Order number auto-increment (atomic counter in settings doc)

### 1.4 Auth & Roles
- [ ] Super Admin account creation (email/password)
- [ ] PIN-based auth for Prep/Kitchen stations
- [ ] Route guards: `/pos/*` requires auth, `/kiosk/*` anonymous, `/prep/*` and `/kitchen/*` require PIN, `/admin/*` requires Super Admin role

## Phase 2: Shared Frontend Foundation

### 2.1 Project Structure
- [ ] Set up folder structure:
  ```
  src/
    components/     # Shared UI components
    hooks/          # Custom hooks (useOrders, useMenu, useAuth)
    pages/          # Route-based pages
      kiosk/
      pos/
      prep/
      kitchen/
      admin/
    services/       # Firebase service layer
    types/          # TypeScript interfaces
    utils/          # Helpers
    theme/          # Design tokens, colors, fonts
  ```
- [ ] Install dependencies: react-router-dom, firebase, react-hot-toast
- [ ] Set up React Router with all routes
- [ ] Create theme/design tokens (Inter font, warm color palette from Pencil designs)

### 2.2 Shared Components
- [ ] Button (Primary, Secondary, Outline variants)
- [ ] MenuCard (photo, name, price, category badge)
- [ ] CartItem (photo, name, qty, price, remove)
- [ ] OrderCard (order #, status badge, items count, total, time)
- [ ] StatusBadge (New, Preparing, Completed, color-coded)
- [ ] Modal / Overlay
- [ ] Loading spinner
- [ ] Top bar / Navigation

### 2.3 Firebase Service Layer
- [ ] `menuService` — getCategories, getMenuItems, getAddOnGroups
- [ ] `orderService` — createOrder, updateOrder, subscribeToOrders (real-time)
- [ ] `authService` — login, logout, getCurrentUser, verifyPin
- [ ] `adminService` — CRUD for menu items, categories, users, promos, settings

## Phase 3A: Customer Kiosk (Agent B)

### 3A.1 Kiosk Screens
- [ ] Intro/Attract screen — menu slideshow, tap to start, 15s inactivity auto-show
- [ ] Welcome — Dine-in / Take-out selection
- [ ] Menu Browse — category sidebar + item grid with photos
- [ ] Item Detail — size variants, add-ons, quantity, add to cart
- [ ] Cart — review items, edit qty, remove, subtotal
- [ ] Checkout — Cash / Card selection
- [ ] Order Confirmed — order number display, done

### 3A.2 Kiosk Logic
- [ ] Cart state management (React context or zustand)
- [ ] Order submission to Firestore
- [ ] Auto-reset after order confirmation (back to intro after 10s)
- [ ] Inactivity timer (15s → show intro screen)

## Phase 3B: Super Admin Portal (Agent A)

### 3B.1 Admin Screens
- [ ] Dashboard — stats cards (today's orders, revenue, popular items), recent orders table
- [ ] Menu Management — 3-column layout: category sidebar + item grid + detail panel
- [ ] Item Editor — full form with photo upload, variants, prep instructions (rich text), station
- [ ] Categories — table with icon, name, items count, station, status, actions
- [ ] Category Editor — edit form + items list within category
- [ ] Orders — filterable table with status badges, payment info, override actions
- [ ] Users — user table with role, station, PIN, status; add/edit user
- [ ] Promos — filter pills + promo cards grid with toggle switches
- [ ] Settings — cafe info, order settings, station routing defaults, printer/payment config

### 3B.2 Admin Logic
- [ ] Full CRUD for menu items, categories, add-on groups
- [ ] Rich text editor for prep instructions (TipTap or similar)
- [ ] Photo upload to Firebase Storage
- [ ] Order status override capability
- [ ] User management with role assignment
- [ ] Promo CRUD with type-specific condition forms
- [ ] Settings persistence

## Phase 4: POS Station

### 4.1 POS Core
- [ ] Mode Select — Solo / Dual / Full Team picker (persists to localStorage)
- [ ] Station Select — tablet role picker for Dual/Full Team (Kiosk, POS Cashier, Customer Display, Prep, Kitchen)
- [ ] Login screen (email/password) — after mode+station selection
- [ ] PIN Login — for Prep/Kitchen stations selected via Station Select

### 4.2 Full Team Mode
- [ ] Dashboard — 3-column kanban (New / Preparing / Completed)
- [ ] Order Detail — full-width view replacing dashboard, items table, payment actions
- [ ] Real-time order subscription (Firestore onSnapshot)
- [ ] Bell sound + visual badge on new order

### 4.3 Solo Mode
- [ ] Solo Dashboard — menu slideshow idle screen, "No Active Orders" state
- [ ] Kiosk ↔ Counter toggle (MANUAL switch button, available on all counter screens)
- [ ] Solo Counter — SINGLE screen with dynamic right panel:
  - Left column (20%): Pay section (top) / Prep section (bottom) / Done accordion
  - Tap order in "Prep" → right panel shows: product photo + items checklist + prep instructions + "Mark Item Done"
  - Tap order in "Pay" → right panel shows: order items table + payment summary + "Complete"
- [ ] Conditional landing: pending orders → Counter, no orders → Dashboard
- [ ] Kiosk mode: runs full kiosk flow (Welcome → Menu → Item → Cart → Checkout → Confirmed) on same tablet

### 4.4 POS Customer Display
- [ ] Display-only live order mirror at `/pos/customer-display`
- [ ] Real-time sync with current order being punched
- [ ] Items, quantities, prices, running total

## Phase 5: Prep & Kitchen Stations

### 5.1 Shared Station Layout
- [ ] PIN Login screen (4-digit entry)
- [ ] 3-column layout: 20% orders queue / 30% product photo + items / 50% prep instructions
- [ ] Real-time order subscription filtered by station
- [ ] Mark item done → updates order item status
- [ ] Auto-check if all station items complete → update prepStatus/kitchenStatus

### 5.2 Prep Counter
- [ ] Filter: drinks & simple items (Coffee, Chocolates, Milk Teas, Street Fizz, Mango Cloud)
- [ ] Show product photo + prep instructions for selected item

### 5.3 Kitchen
- [ ] Filter: meals & cooked items (Pastas, Sandwiches, Noodles, Barkada Favorites, Street Bites)
- [ ] Same layout as Prep, different item filter

## Phase 6: Polish & Integration

### 6.1 Printing
- [ ] Thermal receipt printing via browser Print API
- [ ] Receipt template: order #, date/time, dine-in/takeout, items, total, payment, branding

### 6.2 Notifications
- [ ] Bell sound on new order (POS)
- [ ] Visual badge counter for new orders

### 6.3 PWA Setup
- [ ] Service worker registration
- [ ] Web app manifest (icons, theme color, display: standalone)
- [ ] Offline fallback page
- [ ] Install prompt handling

### 6.4 Testing & Deployment
- [ ] Test all flows end-to-end on tablet
- [ ] Firebase Hosting deployment
- [ ] Custom domain setup (if applicable)
- [ ] Final data seeding with production menu

## Parallel Development Strategy

| Agent | Scope | Phases |
|-------|-------|--------|
| Agent A | Super Admin Portal | 3B → 6 |
| Agent B | Kiosk + POS + Stations | 3A → 4 → 5 → 6 |

Both agents share Phase 1 (backend) and Phase 2 (shared foundation).
Phase 1 and 2 are done sequentially first, then Agents A and B work in parallel.

## Mode Flows (Finalized)

### Solo Mode
```
Mode Select → [Solo] → Login (email/password)
  → IF pending orders → Solo Counter (dynamic panel)
  → IF no orders → Solo Dashboard (idle slideshow)
  → "Switch to Kiosk" (manual toggle, available on ALL counter screens)
  → Kiosk: Welcome → Menu → Item → Cart → Checkout → Confirmed
  → "Switch to Counter" (manual toggle back)
  → Solo Counter:
    - Tap "Prep" order → right panel: photo + prep instructions + Mark Done
    - Tap "Pay" order → right panel: items table + payment + Complete
  → All orders done → Solo Dashboard
```

### Dual Mode
```
Mode Select → [Dual] → Station Select (Kiosk or POS Counter)
  → IF Kiosk → no auth → Kiosk flow
  → IF POS Counter → Login → POS Dashboard
```

### Full Team Mode
```
Mode Select → [Full Team] → Station Select (Kiosk / POS Cashier / Customer Display / Prep / Kitchen)
  → IF Kiosk → no auth → Kiosk flow
  → IF POS Cashier → Login → POS Dashboard
  → IF Customer Display → no auth → Customer Display screen
  → IF Prep Counter → PIN Login → Prep Counter
  → IF Kitchen → PIN Login → Kitchen Counter
```

## Pencil Screen Reference (30 screens + 5 components)

### Kiosk — Portrait (7 screens — 768x1024)
| Screen | Pencil ID | Route |
|--------|-----------|-------|
| Kiosk/0-Intro | uVffc | `/kiosk` |
| Kiosk/1-Welcome | fsMDk | `/kiosk/welcome` |
| Kiosk/2-MenuBrowse | yDrS6 | `/kiosk/menu` |
| Kiosk/3-ItemDetail | z1Tfy | `/kiosk/menu/:id` |
| Kiosk/4-Cart | X1u8G | `/kiosk/cart` |
| Kiosk/5-Checkout | T4j9i | `/kiosk/checkout` |
| Kiosk/6-OrderConfirmed | hF7UT | `/kiosk/confirmed` |

### POS (9 screens)
| Screen | Pencil ID | Route | Mode |
|--------|-----------|-------|------|
| POS/1-Login | pwqw9 | `/pos/login` | All |
| POS/2-ModeSelect | Z4dW0i | `/pos/mode` | All |
| POS/StationSelect | MA6Vo | `/pos/station` | Dual/Full Team |
| POS/2-Dashboard | TiOMM | `/pos/dashboard` | Full Team/Dual |
| POS/3-OrderDetail-v2 | gZz28 | `/pos/order/:id` | Full Team/Dual |
| POS/3-SoloDashboard | DVt6J | `/pos/solo` | Solo |
| POS/4-SoloCounter | vDvln, BZdg2 | `/pos/solo/counter` | Solo |
| POS/CustomerDisplay | V6D7FE | `/pos/customer-display` | All |

### Landscape Versions (12 screens — 1024x768)
| Screen | Pencil ID |
|--------|-----------|
| Landscape/POS-ModeSelect | wiv9y |
| Landscape/POS-StationSelect | MA6Vo |
| Landscape/POS-SoloDashboard | usAU6 |
| Landscape/POS-SoloPrep | PLBrP |
| Landscape/POS-SoloPayment | UqWvW |
| Landscape/Kiosk-Intro | sayre |
| Landscape/Kiosk-Welcome | FsGIg |
| Landscape/Kiosk-MenuBrowse | A4wkr5 |
| Landscape/Kiosk-ItemDetail | ZTj5a |
| Landscape/Kiosk-Cart | tr41Z |
| Landscape/Kiosk-Checkout | OsB3r |
| Landscape/Kiosk-OrderConfirmed | vK27u |

### Prep Counter (2 screens — 1280x800)
| Screen | Pencil ID | Route |
|--------|-----------|-------|
| Prep/0-Login | PwVZd | `/prep/login` |
| Prep/1-PrepCounter | gH1Yu | `/prep` |

### Kitchen (2 screens — 1280x800)
| Screen | Pencil ID | Route |
|--------|-----------|-------|
| Kitchen/0-Login | tDTXQ | `/kitchen/login` |
| Kitchen/1-KitchenCounter | AmPZl | `/kitchen` |

### Super Admin (9 screens — 1440x900 desktop)
| Screen | Pencil ID | Route |
|--------|-----------|-------|
| Admin/1-Dashboard | v8QuT | `/admin` |
| Admin/2-MenuManagement | YLgz5 | `/admin/menu` |
| Admin/3-ItemEditor | Knt5k | `/admin/menu/:id` |
| Admin/4-Orders | owswA | `/admin/orders` |
| Admin/5-Users | GPncM | `/admin/users` |
| Admin/6-Promos | wOeF8 | `/admin/promos` |
| Admin/7-Settings | i9ZRB1 | `/admin/settings` |
| Admin/8-Categories | z5wkB | `/admin/categories` |
| Admin/9-CategoryEditor | tzi4N | `/admin/categories/:id` |

### Reusable Components (5)
| Component | Pencil ID |
|-----------|-----------|
| Button/Primary | CTSCP |
| Button/Secondary | hkYFB |
| MenuCard | bcF4Q |
| CartItem | CbYTo |
| OrderCard | ORiZL |
