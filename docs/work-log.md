# Work Log

## Session 4 - 2026-06-14

Migrated the project to a new (Mac) machine and worked on the `workspace` branch.

### Infrastructure / fixes
- Cloned repo, verified build, wired personal git + `gh` account (klinelozada).
- Diagnosed "menus disappeared" = Firestore `permission-denied` on the **named
  database `joes-pos`** (test-mode rules expired). `menuService.getMenuItems`
  swallows the error → empty UI. Fixed by `firestore.rules` (public read for
  menu/categories/promos/settings) wired into `firebase.json` targeting
  `joes-pos`, then deployed.
- Installed Firebase CLI on this machine and deployed hosting
  (`firebase deploy --only hosting`). Live: https://brandserps-demo.web.app.

### Features
- **Visual build diagrams** for Prep / Kitchen / Solo stations + admin editor +
  seed of 34 diagrams and missing recipes. See `docs/build-diagrams.md`.
- **Admin search / filter / sort** on Menu & Categories (+ search on Orders).
  See `docs/admin-search-filter-sort.md`.
- Fixed Menu Management top-gap (grid auto-placement bumped the item grid to
  row 2).

### Known follow-ups
- 7 source-less drinks need recipes/diagrams (Soy, Mango Coffee Shake, Berry
  Cloud, Citrus Cloud, Mango Cloud Classic, Passion Citrus Punch, Tropical Sunset).
- Add French Vanilla Latte & Spanish Latte as menu items (diagram data ready).
- Food `prepInstructions` are DRAFTs — owner to verify.
- `npm run deploy` uses `npx firebase` which resolves to the SDK, not the CLI —
  use `firebase deploy --only hosting` directly until fixed.

## Session 3 - 2026-05-11

### Completed
- Replaced all Playfair Display fonts with Inter across all screens
- Replaced all "Joe Street" / "JS" text logos with logo.png image across all screens
- Removed redundant text ("CAFE & STUDY LOUNGE", "Joe Street Cafe", "& Study Lounge") below logos
- Moved menu_page_*.png files to assets/menu-pages/ directory
- Added menu page slideshow preview to POS Order Detail right panel
- Removed "Menu Management" nav link from POS Dashboard (moved to Super Admin)
- Deleted POS Menu Management screen (ZG0BL) — functionality moves to Super Admin backend

### In Progress
- Development plan created and saved to memory/dev-plan.md
- Awaiting Kline's review/approval before creating GitHub Issues

### Design Updates (continued)
- Added Completed accordion ("Done" section) to POS/4-SoloCounter-Prep left column
- Added Completed accordion ("Done" section) to POS/5-SoloCounter-Payment left column
- Updated Board/POS-Solo-Flow tablet frames 3 & 4 with refreshed Prep/Payment screens

### Previously Completed (Session 3 continued)
- Designed all 7 Super Admin screens: Dashboard, Menu Management, Item Editor, Orders, Users, Promos, Settings
- Added icons to Menu Management category tabs (coffee, cafe, beverage, bar, dinner, lunch, ramen, fastfood)
- Split "Coffee" tab into "Coffee - Hot" and "Coffee - Iced", "Chocolates" into "Chocolates - Hot" and "Chocolates - Iced"
- Added "Manage" button to category bar for accessing category management
- Designed Admin/8-Categories screen (z5wkB) — category table with #, icon, name, items count, station, status, actions
- Designed Admin/9-CategoryEditor screen (tzi4N) — edit form with name, icon, display order, station, status, description + items list
- Fixed spacing/alignment across Users, Orders, Dashboard, Menu Categories screens
- Centered all status badge texts across admin portal
- Designed POS/2-ModeSelect (Z4dW0i) — Solo / Dual / Full Team mode picker
- Designed POS/4-SoloCounter-Prep (vDvln) — hybrid prep view with orders split top/bottom + prep instructions
- Designed POS/5-SoloCounter-Payment (BZdg2) — payment view with order items + payment summary

### Decisions Made
- Menu Management is Super Admin only (not in POS)
- Super Admin can override cashier transactions
- logo.png replaces all "Joe Street" text instances
- Menu page images stored in assets/menu-pages/

### Super Admin Screen IDs
- Dashboard: v8QuT
- Menu Management: YLgz5
- Item Editor: Knt5k
- Orders: owswA
- Users: GPncM
- Promos: wOeF8
- Settings: i9ZRB1
- Categories: z5wkB
- Category Editor: tzi4N

## Session 2 - 2026-05-11

### Completed
- Redesigned Menu Browse screen: sidebar layout with categories on left, photo grid on right
- Cropped original menu item images from PDF (menu_items/*.png)
- Applied original Joe Street photos to Menu Browse design (absolute paths work)
- Discussed and finalized expanded station architecture (5 stations)
- Updated system spec with: Prep Counter, Kitchen, POS Customer Display, order routing, completion flow
- Updated data models: added station field, prepInstructions (rich text), prepStatus/kitchenStatus on orders
- Font decision: Inter everywhere (replacing Playfair Display)
- Saved all specs to memory
- Designed: Prep Counter, Kitchen, POS Customer Display, POS Order Detail v2

### Decisions Made
- 5 stations: Kiosk (x2), POS Cashier, POS Customer Display, Prep Counter, Kitchen
- Auto-routing: items split to Prep/Kitchen by category (configurable per item)
- Prep/Kitchen layout: 20% orders queue / 30% product photo / 50% instructions
- Both Prep and Kitchen show product image + rich text prep instructions
- Order completes only when both Prep AND Kitchen finish all items
- POS Customer Display: display-only, no interaction, live order mirror
- POS Order Detail: full-width view replacing dashboard (not overlay panel)
- Menu Management: add rich text editor for prep instructions + station dropdown
- Font: Inter everywhere
- Pen file image paths: use absolute paths (E:/Projects/POS/menu_items/...)

## Session 1 - 2026-05-09

### Completed
- Read and absorbed claude-code-workflow.md
- Updated workflow to include design phase (Pencil primary, Claude design supplementary)
- Set up memory system for POS project
- Created GitHub repo: https://github.com/klinelozada/POS
- Scaffolded React + TypeScript + Vite project
- Installed Firebase SDK, created src/firebase.ts with env-based config
- Set up branch strategy: master (prod) + dev (development)
- Created labels and milestone (v1.0 - MVP)
- Read full Joe Street Cafe menu PDF (9 pages, image-based)
- Designed all Kiosk screens (6): Welcome, Menu Browse, Item Detail, Cart, Checkout, Order Confirmed
- Designed POS screens (4): Login, Dashboard (kanban), Order Detail (overlay), Menu Management
- Created reusable Pencil components: Button, MenuCard, CartItem, OrderCard

### Files Modified
- claude-code-workflow.md — added design phase
- .gitignore — added .env entries
- src/firebase.ts — new
- .env.example — new
- menu_items/*.png — cropped menu item photos
