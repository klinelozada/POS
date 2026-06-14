# Visual Build Diagrams

Layered-cup "how to build this drink" diagrams shown to staff in the Prep,
Kitchen, and Solo stations, plus an admin editor to manage them. Reproduces the
official Joe Street "Visual Staff Build Guide" docx diagrams as live, editable
data (no image files).

## Approach: structured data, not images

Each drink's diagram is stored as **structured layer data** on the menu item and
rendered live as SVG. There are no PNG assets to host or swap — you describe the
layers and the cup draws itself, uniformly across every station and editable in
the admin.

### Data model (`src/types/index.ts`)

```ts
MenuItem.buildDiagram?: BuildDiagram

interface BuildDiagram {
  style: 'cup' | 'tapered';   // cup = coffee/milk tea; tapered = fizz/sunset
  layers: BuildLayer[];        // ordered top → bottom
  hot?: boolean;               // draws steam lines (cup style)
  notes?: string[];            // short bullet reminders
}

interface BuildLayer {
  label: string;   // e.g. "espresso", "nata + jam"
  color: string;   // hex band color
  size?: number;   // relative band height (default 1)
  dots?: boolean;  // white "nata pearl" dots across the band
}
```

## Rendering (`src/components/BuildDiagram.tsx`)

- `cup` style — straight rounded cup, horizontal labeled bands, optional steam.
- `tapered` style — fizz cup with side callout labels.
- `dots` draws nata/oreo pearls; `notes` render as bullets beneath the cup.

### Where it shows
- **Prep / Kitchen** — `src/pages/prep/StationCounter.tsx`
- **Solo** — `src/pages/pos/SoloCounter.tsx`

Both render the diagram as a **~150px overlay pinned to the bottom-right** over
the left-aligned item photo (uniform across stations — no toggle). Items without
a diagram simply show the photo.

## Admin editor (`src/components/BuildDiagramEditor.tsx`)

In **Admin → Menu → (item) → Build Diagram**: pick style, toggle hot, add /
reorder / recolor / resize layers, toggle pearl dots, and add notes — with a
**live preview**. Saving writes `buildDiagram` to Firestore (`joes-pos` DB).
Removing it clears the field (item falls back to photo only).

## Seeding (`src/scripts/seedBuildGuides.ts`)

One-time seed, dry-run by default:

```
npx tsx src/scripts/seedBuildGuides.ts            # dry run (no writes)
npx tsx src/scripts/seedBuildGuides.ts --apply    # write to Firestore
# add --force to overwrite existing prepInstructions
```

Sources (no fabrication): the official Coffee / Chocolate / Street Fizz visual
guides + `menu_items/recipe/*.docx`. It seeded **34 diagrams** and filled
missing `prepInstructions` (drink recipes from the guides; food recipes are
**DRAFT**, titled with "— DRAFT" for owner review). It never overwrites an
existing recipe.

## Coverage / follow-ups

- **34 drinks** have diagrams (20 official-derived + 14 recipe-derived).
- **No diagram (need owner recipe):** Soy, Mango Coffee Shake, Berry Cloud,
  Citrus Cloud, Mango Cloud Classic, Passion Citrus Punch, Tropical Sunset —
  add via the admin editor once recipes are known.
- **Not yet menu items (diagram data ready in the seed):** French Vanilla Latte,
  Spanish Latte.
- **Food recipes are DRAFTs** and should be verified by the owner.
