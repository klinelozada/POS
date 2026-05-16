# System Spec — Joe Street Cafe POS

## Stations (5 types)

| Station | Count | Device | Location | Who | Purpose |
|---------|-------|--------|----------|-----|---------|
| Kiosk | 2 | Tablet | Entrance | Customers | Self-order: browse menu, dine-in/takeout, checkout |
| POS Cashier | 1 | Desktop/Tablet | Counter (faces cashier) | Cashier/Admin | Order dashboard, punch orders, process payments, menu mgmt |
| POS Customer Display | 1 | Tablet | Counter (faces customer) | Customer (view-only) | Display-only — live mirror of order being punched |
| Prep Counter | 1 | Tablet/Monitor | Prep area | Barista/Prep staff | Drinks & simple items — orders queue + product photo + prep instructions |
| Kitchen | 1 | Tablet/Monitor | Kitchen | Cook | Meals & cooked items — same layout as Prep |

## Routes
- `/kiosk/*` — Customer kiosk (no auth)
- `/pos/*` — POS cashier (auth required)
- `/pos/customer-display` — Customer-facing display (no auth, display-only)
- `/prep/*` — Prep counter (auth required)
- `/kitchen/*` — Kitchen counter (auth required)
- `/admin/*` — Super Admin portal (auth required, Super Admin role only)

## User Roles
- **Super Admin** — Everything. Only role for MVP.
- **Cashier** — POS order view, process payments (future).
- **Prep Staff** — Prep counter view only (future).
- **Kitchen Staff** — Kitchen view only (future).
- **Customer** — Kiosk ordering + POS customer display. No login.

## Order Flow
- Customer: Welcome → Dine-in/Takeout → Browse Menu → Item Detail → Cart → Checkout (Cash/Card) → Order # printed
- POS: Login → Dashboard (New/Preparing/Completed kanban) → Click order → Full detail view → Process
- Cash: Cashier sees amount to collect
- Card: Placeholder for now (PayMongo/Maya integration later)
- Order numbers: Simple auto-increment, never resets

## Order Routing & Completion

### Auto-routing by category (configurable per item in Super Admin)
- **Prep:** Coffee, Chocolates, Milk Teas, Street Fizz, Mango Cloud
- **Kitchen:** Pastas, Sandwiches, Noodles, Barkada Favorites, Street Bites

### Completion flow
1. Order placed → items auto-split to Prep + Kitchen
2. Prep marks each drink/item done independently
3. Kitchen marks each meal/item done independently
4. Order moves to "Completed" on POS only when BOTH stations finish all items

## Data Models

### categories
- name, displayOrder, isActive, defaultStation (prep/kitchen)

### menuItems
- name, categoryId, basePrice, description, photo, variants (sizes), isAvailable
- station (prep/kitchen) — auto-set by category, overridable
- prepInstructions (HTML rich text) — step-by-step prep/cooking instructions

### addOnGroups
- name, applicableCategories[], items[] (name, price)
- Flexible system — any category can have add-ons

### promos
- name, type (BOGO, discount, etc.), conditions, isActive

### orders
- orderNumber, type (dine-in/takeout), items[], total, paymentMethod
- status (new/preparing/completed), createdAt
- prepStatus (pending/in-progress/done) — tracks prep counter completion
- kitchenStatus (pending/in-progress/done) — tracks kitchen completion

### settings
- currentOrderNumber (auto-increment counter)

## Menu Categories (from PDF)

| Category | Items | Price Range | Station |
|----------|-------|-------------|---------|
| Coffee - Hot | Brewed Coffee, Americano, Cafe Latte, Salted Caramel | P59-P99 | Prep |
| Coffee - Iced | Iced Americano, Greek Frappe, Iced Latte, Dalgona, Caramel Macchiato | P89-P109 | Prep |
| Chocolates - Hot | Hot Chocolate, Hot Mocha | P65-P69 | Prep |
| Chocolates - Iced | Iced Choco, Iced Choco Latte, Iced Choco Oreo, Iced Choco Strawberry | P89-P115 | Prep |
| Milk Teas - Classics | Wintermelon, Okinawa, Soy, Cookies & Cream | P75-P99 | Prep |
| Milk Teas - Mango Series | Mango Milk Tea, Iced Choco Mango, Mango Coffee Shake, Iced Mango Latte | P95-P109 | Prep |
| Milk Teas - Matcha Series | Matcha Latte, Matcha Strawberry, Dirty Matcha, Matcha Mango | P99-P109 | Prep |
| Street Fizz | Sunset, Fresh & Light, Citrus Boost series | 12oz P69 / 16oz P79 | Prep |
| Mango Cloud Series | Classic, Berry Cloud, Citrus Cloud | Buy 1 Take 1 P69 | Prep |
| Pastas | Garlic Tuna Penne, Chicken Tomato Penne | P139-P149 | Kitchen |
| Sandwiches | Egg & Toast, Egg Sandwich, Ham & Egg Sandwich | P59-P89 | Kitchen |
| Noodle Corner | Jjajangmyeon, Kimchi Ramen, Buldak Cheese, Pancit Canton Combo | P99-P179 | Kitchen |
| Noodle Add-ons | Extra Egg, Cheese Slice, Fish Cake, Spam Slice, Fish Tofu, Siomai, Squid Balls | P15-P30 | Kitchen |
| Barkada Favorites | Pinoy Barkada Platter, K-Barkada Platter, Cooler Pitchers | P99-P429 | Kitchen |
| Street Bites | Spam Fries, French Fries, Street Bites | P35-P125 | Kitchen |

## Screens

### Customer Kiosk (7 screens)
0. Intro — Attract screen with menu slideshow, tap to start (auto-shows after 15s inactivity)
1. Welcome — Dine-in / Take-out selection
2. Menu Browse — category sidebar + item grid with original menu photos
3. Item Detail — sizes, add-ons, quantity, add to cart
4. Cart — review, edit, subtotal
5. Checkout — payment method selection (Cash/Card)
6. Order Confirmed — order #, payment info, done

### POS Cashier (6 screens)
1. Login
2. Mode Select — Solo / Dual / Full Team mode picker
3. Order Dashboard — 3-column kanban (New / Preparing / Completed)
4. Order Detail — full-width view replacing dashboard, items table, payment, actions
5. Solo Counter - Prep — left: orders split (ready for payment / needs prep), right: item photo + items checklist + prep instructions
6. Solo Counter - Payment — left: same orders split, right: order items table + payment summary + collect payment

### Station Modes
- **Solo Mode** (1 tablet): Kiosk ↔ Counter toggle. Cashier manually switches between customer ordering and prep/payment.
- **Dual Mode** (2 tablets): 1 dedicated Kiosk + 1 POS Counter (future design)
- **Full Team Mode** (5 stations): Kiosks, POS, Customer Display, Prep Counter, Kitchen (already designed)

### POS Customer Display (1 screen)
1. Live order display — items being added in real-time, quantities, prices, running total. Display-only, no interaction.

### Prep Counter (2 screens)
0. PIN Login — 4-digit PIN entry to access station
1. 3-column layout (20/30/50): Orders queue | Product photo + items list | Prep instructions + mark done

### Kitchen (2 screens)
0. PIN Login — 4-digit PIN entry to access station
1. Same layout as Prep Counter but filtered to kitchen items only

## Design Direction
- Font: **Inter** everywhere (headings + body)
- Colors: Warm tones (browns, golds, cream) matching Joe Street branding
- Kiosk: Photo-heavy, appetizing, original menu photos
- POS/Prep/Kitchen: Clean, functional, easy to scan quickly

## Notifications
- Bell sound + visual badge on POS when new order arrives

## Printing
- Thermal POS printer
- Receipt: Order #, date/time, dine-in/takeout, items with prices, total, payment method, cafe branding

## Super Admin Backend (7 screens — designed)
1. Dashboard — stats cards (today's orders, revenue, popular items, active promos) + recent orders table
2. Menu Management — 3-column: sidebar + item grid with category filter + detail panel (photo, price, variants, station)
3. Item Editor — full form: name, category, price, variants, description, photo upload, rich text prep instructions editor, station dropdown
4. Orders — filterable orders table with status badges, payment method, override capability
5. Users — users table with name, role, email, station, PIN, status; +New User button
6. Promos — filter pills (All/BOGO/Discount/Bundle) + promo cards grid with type badges, toggle switches, category/conditions metadata
7. Settings — General (cafe info), Order Settings (auto-increment), Station Routing Defaults (category→station mapping), Printer & Payment
