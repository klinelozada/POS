/**
 * Seed build diagrams + fill missing prep instructions for menu items.
 *
 * Sources (no fabrication):
 *  - Official "Visual Staff Build Guide" docx (Coffee, Chocolate, Street Fizz) → 20 diagrams
 *  - recipe/milktea-and-more.docx + recipe/fizz.docx → recipe-derived diagrams + prep text
 *  - Food prep text is DRAFT (no docx source) and marked as such for owner review.
 *
 * Usage:
 *   npx tsx src/scripts/seedBuildGuides.ts            # DRY RUN (prints planned changes, no writes)
 *   npx tsx src/scripts/seedBuildGuides.ts --apply    # writes buildDiagram + missing prepInstructions
 *   add --force to also overwrite existing non-empty prepInstructions
 */
import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import type { BuildDiagram } from '../types';

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');

// ---- color palette (matches official guide) ----
const C = {
  espresso: '#3f2817',
  espressoDk: '#4a2f1a',
  foam: '#e9dfca',
  milk: '#f2ead9',
  condensed: '#f6e9b8',
  iceWater: '#eef6ff',
  hotWater: '#c69a6d',
  caramel: '#caa06a',
  dalgona: '#b07a4f',
  brewed: '#5a3a22',
  choco: '#6b4226',
  chocoDk: '#5a3620',
  chocoOreo: '#4a3020',
  strawberry: '#e84d6a',
  mango: '#f5a623',
  matcha: '#a9c47d',
  boba: '#2c211a',
  // fizz
  upPomelo: '#fce38a',
  strawLayer: '#f17a6e',
  jamRed: '#c0392b',
  upBerry: '#f9c9b3',
  mangoBody: '#f5a623',
  jamMango: '#d2691e',
  upLychee: '#fbd6e8',
  blueberry: '#8a6fd1',
  jamBerry: '#3b2d8c',
  upCucumber: '#cde9c0',
  nataLight: '#eef6e6',
  upLycheeF: '#fadbe6',
  nataCream: '#f5f3e6',
  upGuava: '#f8cdb0',
  nataTan: '#f2ead9',
  rainbowJelly: '#f0a3c0',
};

const cup = (layers: BuildDiagram['layers'], hot = false): BuildDiagram => ({ style: 'cup', layers, hot });
const tapered = (layers: BuildDiagram['layers'], notes?: string[]): BuildDiagram => ({ style: 'tapered', layers, notes });

// ---- DIAGRAMS keyed by exact menu item name ----
const DIAGRAMS: Record<string, BuildDiagram> = {
  // ===== Official Coffee guide =====
  'Iced Americano': cup([{ label: 'espresso', color: C.espresso, size: 28 }, { label: 'ice + water', color: C.iceWater, size: 72 }]),
  'Greek Frappe': cup([{ label: 'foamy coffee', color: C.dalgona, size: 42 }, { label: 'ice', color: C.iceWater, size: 58 }]),
  'Dalgona': cup([{ label: 'dalgona', color: C.dalgona, size: 26 }, { label: 'milk + ice', color: C.milk, size: 74 }]),
  'Caramel Macchiato': cup([{ label: 'dalgona', color: C.caramel, size: 10 }, { label: 'espresso', color: C.espressoDk, size: 16 }, { label: 'milk', color: C.milk, size: 66 }, { label: 'condensed', color: C.condensed, size: 8 }]),
  'Brewed Coffee': cup([{ label: 'brewed coffee', color: C.brewed, size: 100 }], true),
  'Americano': cup([{ label: 'espresso', color: C.espresso, size: 24 }, { label: 'hot water', color: C.hotWater, size: 76 }], true),
  'Cafe Latte': cup([{ label: 'foam', color: C.foam, size: 12 }, { label: 'espresso', color: C.espresso, size: 14 }, { label: 'hot milk', color: C.milk, size: 74 }], true),
  'Salted Caramel': cup([{ label: 'caramel', color: C.caramel, size: 10 }, { label: 'espresso', color: C.espressoDk, size: 16 }, { label: 'hot milk', color: C.milk, size: 74 }], true),
  // ===== Official Chocolate guide =====
  'Hot Chocolate': cup([{ label: 'foam', color: C.foam, size: 12 }, { label: 'hot chocolate', color: C.choco, size: 88 }], true),
  'Hot Mocha': cup([{ label: 'foam', color: C.foam, size: 10 }, { label: 'espresso', color: C.espresso, size: 16 }, { label: 'chocolate milk', color: C.choco, size: 74 }], true),
  'Iced Choco': cup([{ label: 'foam', color: C.foam, size: 12 }, { label: 'chocolate milk', color: C.choco, size: 88 }]),
  'Iced Choco Latte': cup([{ label: 'foam', color: C.foam, size: 12 }, { label: 'chocolate', color: C.chocoDk, size: 30 }, { label: 'milk', color: C.milk, size: 58 }]),
  'Iced Choco Oreo': cup([{ label: 'foam', color: C.foam, size: 16, dots: true }, { label: 'choco oreo', color: C.chocoOreo, size: 84 }]),
  'Iced Choco Strawberry': cup([{ label: 'chocolate', color: C.chocoDk, size: 24 }, { label: 'milk', color: C.milk, size: 56 }, { label: 'strawberry', color: C.strawberry, size: 20 }]),
  // ===== Official Street Fizz guide =====
  'Strawberry Sunset': tapered([{ label: '7-Up + light pomelo', color: C.upPomelo, size: 50 }, { label: 'strawberry layer', color: C.strawLayer, size: 32 }, { label: 'nata + jam', color: C.jamRed, size: 18, dots: true }], ['Do not fully stir', 'Serve layered']),
  'Mango Sunset': tapered([{ label: '7-Up + light berries', color: C.upBerry, size: 46 }, { label: 'mango body', color: C.mangoBody, size: 36 }, { label: 'nata + mango jam', color: C.jamMango, size: 18, dots: true }], ['Mango stays main flavor', 'Light swirl only']),
  'Berry Sunset': tapered([{ label: '7-Up + light lychee', color: C.upLychee, size: 46 }, { label: 'blueberry layer', color: C.blueberry, size: 36 }, { label: 'nata + berry jam', color: C.jamBerry, size: 18, dots: true }], ['Deep bottom color', 'Do not fully stir']),
  'Cucumber Breeze': tapered([{ label: '7-Up + cucumber', color: C.upCucumber, size: 82 }, { label: 'nata', color: C.nataLight, size: 18, dots: true }], ['Light and clean', 'Stir lightly']),
  'Lychee Fizz': tapered([{ label: '7-Up + lychee', color: C.upLycheeF, size: 82 }, { label: 'nata', color: C.nataCream, size: 18, dots: true }], ['Light floral finish', 'Stir lightly']),
  'Guava Spritz': tapered([{ label: '7-Up + guava', color: C.upGuava, size: 82 }, { label: 'nata', color: C.nataTan, size: 18, dots: true }], ['Soft fruity tone', 'Stir lightly']),

  // ===== Recipe-derived (milktea-and-more.docx) =====
  'Wintermelon': cup([{ label: 'wintermelon milk tea', color: '#e7d9b0', size: 80 }, { label: 'boba pearls', color: C.boba, size: 20 }]),
  'Okinawa': cup([{ label: 'okinawa milk tea', color: '#c39a6b', size: 80 }, { label: 'boba pearls', color: C.boba, size: 20 }]),
  'Cookies & Cream': cup([{ label: 'cookies & cream', color: '#d9cfc4', size: 80 }, { label: 'boba pearls', color: C.boba, size: 20 }]),
  'Mango Milk Tea': cup([{ label: 'wintermelon milk', color: '#e7d9b0', size: 70 }, { label: 'mango', color: C.mango, size: 14 }, { label: 'boba pearls', color: C.boba, size: 16 }]),
  'Iced Choco Mango': cup([{ label: 'chocolate topper', color: C.chocoDk, size: 16 }, { label: 'mango milk', color: '#f3c98a', size: 84 }]),
  'Mango Strawberry': cup([{ label: 'milk', color: C.milk, size: 50 }, { label: 'mango', color: C.mango, size: 30 }, { label: 'strawberry', color: C.strawberry, size: 20 }]),
  'Iced Mango Latte': cup([{ label: 'coffee', color: C.espressoDk, size: 22 }, { label: 'milk', color: C.milk, size: 56 }, { label: 'mango', color: C.mango, size: 22 }]),
  'Matcha Latte': cup([{ label: 'matcha milk', color: C.matcha, size: 80 }, { label: 'boba pearls', color: C.boba, size: 20 }]),
  'Matcha Strawberry': cup([{ label: 'matcha milk', color: C.matcha, size: 72 }, { label: 'strawberry', color: C.strawberry, size: 28 }]),
  'Dirty Matcha': cup([{ label: 'coffee', color: C.espressoDk, size: 24 }, { label: 'matcha milk', color: C.matcha, size: 76 }]),
  'Matcha Mango': cup([{ label: 'matcha milk', color: C.matcha, size: 74 }, { label: 'mango', color: C.mango, size: 26 }]),

  // ===== Recipe-derived (fizz.docx) =====
  'Calamansi Spark': tapered([{ label: '7-Up + calamansi', color: '#eaf3c8', size: 80 }, { label: 'rainbow jelly', color: C.rainbowJelly, size: 20, dots: true }], ['Light stir only']),
  'Strawberry Citrus Fizz': tapered([{ label: '7-Up + calamansi', color: '#fde2c0', size: 62 }, { label: 'strawberry', color: C.strawLayer, size: 20 }, { label: 'rainbow jelly', color: C.rainbowJelly, size: 18, dots: true }], ['Light stir only']),

  // ===== Generic (derivable) =====
  'Iced Latte': cup([{ label: 'espresso', color: C.espresso, size: 20 }, { label: 'milk + ice', color: C.milk, size: 80 }]),
};

// ---- PREP INSTRUCTIONS to FILL where missing (sourced) ----
const r = (title: string, desc: string, ing: string[], steps: string[]) =>
  `<h4>${title}</h4>\n<p><em>${desc}</em></p>\n<h5>Ingredients</h5>\n<ul>\n${ing.map((i) => `<li>${i}</li>`).join('\n')}\n</ul>\n<h5>Build Process</h5>\n<ol>\n${steps.map((s) => `<li>${s}</li>`).join('\n')}\n</ol>`;

const PREP: Record<string, string> = {
  // Coffee guide build text
  'Brewed Coffee': r('Brewed Coffee', 'Freshly brewed and straight to the point.', ['200ml fresh brewed coffee'], ['Brew fresh coffee.', 'Pour 200ml into the cup.', 'Serve immediately. No milk or sugar unless requested.']),
  'Americano': r('Hot Americano', 'Smooth, bold, and simple black coffee.', ['120ml hot water', '45ml espresso'], ['Add 120ml hot water to the cup.', 'Pour 45ml espresso.', 'Stir lightly. Clean and simple, no milk.']),
  'Cafe Latte': r('Café Latte', 'Creamy and smooth with light foam.', ['45ml espresso', '120ml hot milk', 'light milk foam'], ['Add 45ml espresso.', 'Pour 120ml hot milk.', 'Finish with light milk foam. Creamy, not too foamy.']),
  'Salted Caramel': r('Salted Caramel Latte', 'Creamy with a light caramel finish.', ['10ml salted caramel syrup', '45ml espresso', '110ml hot milk', 'light foam'], ['Add 10ml salted caramel syrup.', 'Add 45ml espresso.', 'Pour 110ml hot milk.', 'Top with light foam. Sweet and balanced.']),
  // Chocolate guide build text
  'Hot Chocolate': r('Hot Chocolate', 'Warm, creamy chocolate comfort.', ['chocolate powder', 'hot water', 'hot milk'], ['Dissolve chocolate powder fully with hot water.', 'Add hot milk.', 'Froth lightly and serve warm.']),
  'Hot Mocha': r('Hot Mocha', 'Chocolate with a coffee kick.', ['chocolate powder', 'hot milk', '45ml espresso', 'light foam'], ['Make hot chocolate base.', 'Add espresso.', 'Top with light foam. Chocolatey first, with a clear coffee kick.']),
  'Iced Choco': r('Iced Chocolate', 'Cold, creamy, and easy to love.', ['chocolate powder', 'milk', 'mixed ice', 'milk foam (optional)'], ['Dissolve chocolate powder, add milk.', 'Pour over mixed ice.', 'Top with milk foam if available. Serve immediately (mixed ice melts fast).']),
  'Iced Choco Latte': r('Iced Chocolate Latte', 'Creamier chocolate with soft foam.', ['chocolate base', 'milk', 'ice', 'soft milk foam'], ['Add chocolate base, milk, and ice.', 'Mix gently.', 'Finish with a soft milk foam topper. Richer than regular iced chocolate.']),
  'Iced Choco Oreo': r('Iced Choco Oreo', 'Chocolate blended with Oreo goodness.', ['chocolate base', 'milk', 'crushed Oreo', 'ice'], ['Mix chocolate base, milk, crushed Oreo, and ice.', 'Top with foam or extra Oreo crumbs if available.', 'Stir well so the Oreo flavor spreads through the drink.']),
  'Iced Choco Strawberry': r('Iced Choco Strawberry', 'Chocolate and strawberry in one sweet cup.', ['strawberry base', 'ice', 'milk', 'chocolate base'], ['Add strawberry base, ice, then milk.', 'Add chocolate base on top.', 'Serve layered or mix lightly. Layered looks more premium.']),
  // Street Fizz / milktea gaps (same build family as their sourced siblings)
  'Mango Sunset': r('Mango Sunset', 'Mango layered with a sparkling finish.', ['mango syrup', '10g mango jam', '20g nata', 'light berry Tang mix', 'soda water / 7-Up', 'Ice'], ['Add mango syrup, mango jam, and nata to cup.', 'Fill cup halfway with ice.', 'Slowly pour light berry Tang mix.', 'Top slowly with soda water. Mango stays the main flavor; light swirl only.']),
  'Mango Strawberry': r('Mango Strawberry', 'Sweet meets tangy. Fun, bright, and refreshing.', ['20ml Mango Syrup', '5ml Strawberry Syrup', '30g Milk Powder', '110ml water', 'Ice'], ['Add strawberry syrup walling.', 'Add mango syrup.', 'Fill cup with ice.', 'Shake milk base thoroughly.', 'Pour slowly for swirl effect.']),
  'Iced Mango Latte': r('Iced Mango Coffee Latte', 'Sweet mango, creamy milk, and coffee in one smooth iced drink.', ['20ml Mango Syrup', '60ml Coffee Base / Espresso', '30g Milk Powder', '100ml water', 'Ice'], ['Add mango syrup walling.', 'Fill cup with ice.', 'Pour milk base.', 'Slowly add coffee layer on top.']),
};

// ---- FOOD prep DRAFTS (no docx source — owner must review) ----
const FOOD_DRAFT: Record<string, string> = {
  'Garlic Tuna Penne': r('Garlic Tuna Penne — DRAFT', 'Garlic, tuna, and penne in a light sauce.', ['penne pasta', 'tuna flakes', 'garlic', 'olive oil / butter', 'salt & pepper', 'parsley (optional)'], ['Boil penne until al dente; drain.', 'Sauté garlic in oil/butter until fragrant.', 'Add tuna flakes, season with salt & pepper.', 'Toss in penne and coat evenly.', 'Plate and garnish with parsley.']),
  'Chicken Tomato Penne': r('Chicken Tomato Penne — DRAFT', 'Chicken in tomato sauce over penne.', ['penne pasta', 'chicken strips', 'tomato sauce', 'garlic & onion', 'salt & pepper'], ['Boil penne until al dente; drain.', 'Sauté garlic and onion; add chicken and cook through.', 'Pour tomato sauce; simmer until thick.', 'Toss penne in sauce.', 'Plate and serve hot.']),
  'Egg & Toast': r('Egg & Toast — DRAFT', 'Simple egg with toasted bread.', ['2 eggs', '2 slices bread', 'butter', 'salt & pepper'], ['Toast bread and butter lightly.', 'Cook eggs to preference.', 'Season; plate eggs beside toast.']),
  'Egg Sandwich': r('Egg Sandwich — DRAFT', 'Egg filling in toasted bread.', ['2 eggs', '2 slices bread', 'mayo', 'salt & pepper'], ['Cook and chop/scramble eggs; season.', 'Mix with mayo.', 'Toast bread, fill, slice, and serve.']),
  'Ham & Egg Sandwich': r('Ham & Egg Sandwich — DRAFT', 'Ham and egg in toasted bread.', ['2 eggs', '2 slices ham', '2 slices bread', 'mayo', 'salt & pepper'], ['Cook egg; warm ham.', 'Toast bread, spread mayo.', 'Layer ham and egg; slice and serve.']),
  'French Fries': r('French Fries — DRAFT', 'Crispy golden fries.', ['frozen fries', 'cooking oil', 'salt'], ['Heat oil to 175°C.', 'Fry until golden and crisp.', 'Drain, salt, and serve hot.']),
  'Spam Fries': r('Spam Fries — DRAFT', 'Spam strips fried crisp.', ['Spam', 'cooking oil'], ['Slice Spam into strips.', 'Fry until edges are crisp.', 'Drain and serve hot.']),
  'Street Bites': r('Street Bites — DRAFT', 'Assorted fried street snacks.', ['assorted street bites', 'cooking oil', 'dipping sauce'], ['Heat oil to 175°C.', 'Fry until golden and cooked through.', 'Drain; serve with dipping sauce.']),
  'Kimchi Ramen': r('Kimchi Ramen — DRAFT', 'Spicy kimchi noodle soup.', ['ramen noodles', 'kimchi', 'broth/soup base', 'egg (optional)', 'green onion'], ['Boil broth with soup base.', 'Add noodles and kimchi; cook until tender.', 'Top with egg and green onion; serve hot.']),
  'Buldak Cheese': r('Buldak Cheese — DRAFT', 'Spicy buldak noodles with cheese.', ['buldak noodles', 'cheese', 'water'], ['Boil noodles; drain most water.', 'Add buldak sauce and toss.', 'Top with cheese, melt, and serve.']),
  'Jjajangmyeon': r('Jjajangmyeon — DRAFT', 'Korean black bean noodles.', ['noodles', 'jjajang (black bean) sauce', 'vegetables'], ['Boil noodles; drain.', 'Heat jjajang sauce with vegetables.', 'Pour over noodles; mix and serve.']),
  'Pancit Canton Combo': r('Pancit Canton Combo — DRAFT', 'Stir-fried canton noodles combo.', ['pancit canton noodles', 'vegetables', 'meat/toppings', 'soy sauce'], ['Cook noodles per pack.', 'Stir-fry with vegetables and toppings.', 'Season with soy sauce; plate combo and serve.']),
  'Pinoy Barkada Platter': r('Pinoy Barkada Platter — DRAFT', 'Shareable Filipino snack platter.', ['assorted Pinoy bites', 'dipping sauces'], ['Prepare each component per its recipe.', 'Arrange on a sharing platter with sauces.', 'Serve immediately.']),
  'K-Barkada Platter': r('K-Barkada Platter — DRAFT', 'Shareable Korean snack platter.', ['assorted Korean bites', 'dipping sauces'], ['Prepare each component per its recipe.', 'Arrange on a sharing platter with sauces.', 'Serve immediately.']),
  'Mango Cooler Pitcher': r('Mango Cooler Pitcher — DRAFT', 'Shareable mango cooler.', ['mango syrup/puree', 'water', 'ice'], ['Combine mango base with water in a pitcher.', 'Add ice.', 'Stir and serve with glasses.']),
  'Cucumber Cooler Pitcher': r('Cucumber Cooler Pitcher — DRAFT', 'Shareable cucumber cooler.', ['cucumber syrup', 'water', 'ice'], ['Combine cucumber base with water in a pitcher.', 'Add ice.', 'Stir and serve with glasses.']),
};

async function main() {
  const env = Object.fromEntries(
    readFileSync('.env', 'utf8').split('\n').filter(Boolean).map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
  );
  const cfg = {
    apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN, projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: env.VITE_FIREBASE_APP_ID,
  };
  const app = initializeApp(cfg);
  const db = getFirestore(app, 'joes-pos');
  if (APPLY) {
    await signInWithEmailAndPassword(getAuth(app), 'admin@joestreet.cafe', 'joespos1234');
  }
  const snap = await getDocs(collection(db, 'menuItems'));
  const byName = new Map(snap.docs.map((d) => [d.data().name as string, d]));

  console.log(`\n=== ${APPLY ? 'APPLYING' : 'DRY RUN (no writes)'}${FORCE ? ' [FORCE]' : ''} ===\n`);
  let diagSet = 0, prepSet = 0, foodSet = 0, missing = 0;
  const allPrep = { ...PREP, ...FOOD_DRAFT };

  for (const name of new Set([...Object.keys(DIAGRAMS), ...Object.keys(allPrep)])) {
    const d = byName.get(name);
    if (!d) { console.log(`  ⚠️  no menu item named "${name}" (skipped)`); missing++; continue; }
    const cur = d.data();
    const update: Record<string, unknown> = {};
    if (DIAGRAMS[name]) { update.buildDiagram = DIAGRAMS[name]; diagSet++; }
    if (allPrep[name]) {
      const has = cur.prepInstructions && cur.prepInstructions.trim();
      if (!has || FORCE) {
        update.prepInstructions = allPrep[name];
        if (FOOD_DRAFT[name]) foodSet++; else prepSet++;
      }
    }
    if (Object.keys(update).length === 0) continue;
    const tags = Object.keys(update).map((k) => (k === 'buildDiagram' ? 'diagram' : 'prep')).join('+');
    console.log(`  ${APPLY ? '✏️ ' : '•'} ${name}  [${tags}]`);
    if (APPLY) await updateDoc(doc(db, 'menuItems', d.id), update);
  }

  // Drinks with no source — left photo-only, reported for owner
  const sourceless = ['Soy', 'Mango Coffee Shake', 'Berry Cloud', 'Citrus Cloud', 'Mango Cloud Classic', 'Passion Citrus Punch', 'Tropical Sunset'];
  console.log(`\n  Diagrams: ${diagSet} | Prep (sourced): ${prepSet} | Food prep (DRAFT): ${foodSet} | missing items: ${missing}`);
  console.log(`\n  No diagram (need owner recipe): ${sourceless.filter((n) => byName.has(n)).join(', ')}`);
  console.log(`  Not in Firestore (add as new items): French Vanilla Latte, Spanish Latte\n`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
