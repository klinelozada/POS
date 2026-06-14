# Admin Search, Filter & Sort

Search, filtering, and sorting added to the admin list pages.

## Menu Management (`src/pages/admin/MenuManagement.tsx`)

A toolbar sits **below the title**, spanning columns 1–2 (sidebar + item grid):

```
[ search ............................ ] [ Sort ▾ ] [ Filter ]
```

- **Search** — matches item **name** and **description** (scoped to the selected
  category in the sidebar; "All" searches everything).
- **Sort** — Default, Name (A–Z / Z–A), Price (Low–High / High–Low). Applied
  after search + filters.
- **Filter** — popover with: Station (Prep/Kitchen), Availability
  (Available/Unavailable), Build Diagram (Has / None). Badge shows active count;
  "Clear all filters" resets.

The 3-column grid was re-rowed so the toolbar sits above the sidebar + item grid
and the detail panel spans full height in column 3 (no layout shift when
selecting an item).

## Categories (`src/pages/admin/Categories.tsx`)

Full-width toolbar below the title:

- **Search** — matches category **name**.
- **Filter** — Station (Prep/Kitchen), Status (Active/Inactive).

## Orders (`src/pages/admin/Orders.tsx`)

- **Search** in the header row — matches order #, item name, reference #,
  payment method, and order type. Resets pagination on change. (Existing date /
  status / payment pill filters retained.)

## Reusable component (`src/components/FilterMenu.tsx`)

`FilterMenu` is a declarative popover: pass `groups` (label + options + current
value + onChange). It renders pill options, an active-count badge, and "Clear
all", and closes on outside click. Adding a filter to any page is just passing a
new group.
