/**
 * Fix all menu prices, restructure items, add noodle add-ons, and add recipes.
 * Usage: npx tsx src/scripts/updateMenuPrices.ts
 */
import 'dotenv/config';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ credential: applicationDefault(), projectId: 'brandserps-demo' });
const db = getFirestore(app, 'joes-pos');

// ============================================================
// 1. PRICE FIXES (basePrice corrections)
// ============================================================
const priceFixes: Record<string, number> = {
  // Coffee
  'hJorx8gvMpiA4LbMz1O9': 89,   // Greek Frappe: 99 → 89
  'ylWxmwbjv7mNX6vejY8J': 99,   // Iced Latte: 89 → 99
  // Chocolates
  '5CUtUNKiCfeadJl6Oe42': 105,  // Iced Choco Latte: 99 → 105
  'n98ikTAQaLqJiVXdyGDM': 115,  // Iced Choco Oreo: 109 → 115
  // Milk Tea Classics
  'Z09ZPY16MMOQAPYlIEIE': 49,   // Wintermelon: 75 → 49 (base is 12oz, Regular adds +30)
  '4VrAv8XxFIjzR2Vi8HSl': 49,   // Okinawa: 89 → 49 (base is 12oz, Regular adds +30)
  'nMFlIAks3F7rh43NTPWF': 49,   // Soy: 79 → 49 (base is 12oz, Regular adds +30)
  '1KsFaqYbFlygs7wdc4sX': 49,   // Cookies & Cream: 99 → 49 (base is 12oz, Regular adds +40)
  // Noodle Corner
  'ReV1ZduQ71PNDG4kjrIv': 159,  // Jjajangmyeon: 99 → 159
  'OpDBB40pc4irFDSSIDK4': 159,  // Kimchi Ramen: 149 → 159
  // Barkada
  '06ZYmRBTHKtAddjEocLL': 329,  // Pinoy Barkada Platter: 429 → 329
  'NYbDe4QMV1Snbi4UjoXE': 429,  // K-Barkada Platter: 399 → 429
  // Street Bites
  'UVmDGoMUrMvygDVGtmY4': 125,  // Spam Fries: 89 → 125
};

// ============================================================
// 2. MILK TEA CLASSICS — add 12oz/16oz variants
// ============================================================
const milkTeaVariantUpdates: Record<string, { basePrice: number; variants: { name: string; priceAdd: number }[] }> = {
  'Z09ZPY16MMOQAPYlIEIE': { basePrice: 49, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 30 }] },  // Wintermelon 12oz=49, 16oz=79
  '4VrAv8XxFIjzR2Vi8HSl': { basePrice: 49, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 30 }] },  // Okinawa 12oz=49, 16oz=79
  'nMFlIAks3F7rh43NTPWF': { basePrice: 49, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 30 }] },  // Soy 12oz=49, 16oz=79
  '1KsFaqYbFlygs7wdc4sX': { basePrice: 49, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 40 }] },  // Cookies & Cream 12oz=49, 16oz=89
};

// ============================================================
// 3. STREET BITES — rename + restructure
// ============================================================
// Street Bites Platter (7RRz5CzHwiWxdZP6AGSb) → "Street Bites" with Solo/Large variants
const streetBitesUpdate = {
  id: '7RRz5CzHwiWxdZP6AGSb',
  name: 'Street Bites',
  basePrice: 60,
  variants: [{ name: 'Solo', priceAdd: 0 }, { name: 'Large', priceAdd: 55 }],
};

// French Fries (d5v349YftuoZCLLccop3) → multi-dimensional variant groups
const frenchFriesUpdate = {
  id: 'd5v349YftuoZCLLccop3',
  name: 'French Fries',
  basePrice: 35,
  variants: [], // clear old single variants
  variantGroups: [
    { label: 'Size', options: ['Solo', 'Large'] },
    { label: 'Flavor', options: ['Regular', 'Cheese'] },
  ],
  priceMatrix: {
    'Solo|Regular': 35,
    'Solo|Cheese': 39,
    'Large|Regular': 65,
    'Large|Cheese': 75,
  },
};

// Cooler Pitchers (iMI1untw6r16gEEzSGA1) → rename to "Mango Cooler Pitcher"
// Create new "Cucumber Cooler Pitcher"

// ============================================================
// 4. STREET FIZZ RECIPES
// ============================================================
const fizzRecipes: Record<string, string> = {
  'Strawberry Sunset': `<h4>Strawberry Sunset</h4>
<p><em>Strawberry and citrus layered with a sparkling finish.</em></p>
<h5>Ingredients</h5>
<ul>
<li>15ml Strawberry Syrup</li>
<li>10g Strawberry Jam</li>
<li>20g Nata</li>
<li>Light Pomelo Tang Mix</li>
<li>Soda Water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add strawberry syrup, strawberry jam, and nata to cup.</li>
<li>Fill cup halfway with ice.</li>
<li>Slowly pour light pomelo Tang mix.</li>
<li>Add more ice if needed.</li>
<li>Slowly top with soda water.</li>
<li><strong>Do NOT fully stir.</strong></li>
</ol>`,

  'Berry Sunset': `<h4>Berry Sunset</h4>
<p><em>Blueberry and lychee layered for a rich yet refreshing blend.</em></p>
<h5>Ingredients</h5>
<ul>
<li>15ml Blueberry Syrup</li>
<li>10g Blueberry Jam</li>
<li>20g Nata</li>
<li>Light Lychee Tang Mix</li>
<li>Soda Water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add blueberry syrup, blueberry jam, and nata to cup.</li>
<li>Fill cup halfway with ice.</li>
<li>Slowly pour light lychee Tang mix.</li>
<li>Add more ice if needed.</li>
<li>Slowly top with soda water.</li>
<li><strong>Do NOT fully stir.</strong></li>
</ol>`,

  'Calamansi Spark': `<h4>Calamansi Spark</h4>
<p><em>Pure calamansi with sparkling soda. Sharp, clean, and thirst-quenching.</em></p>
<h5>Ingredients</h5>
<ul>
<li>15-20ml Calamansi Puree</li>
<li>20g Rainbow Jelly</li>
<li>7-Up</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add calamansi puree and rainbow jelly to cup.</li>
<li>Fill cup with ice.</li>
<li>Slowly top with 7-Up.</li>
<li>Light stir only.</li>
</ol>`,

  'Strawberry Citrus Fizz': `<h4>Strawberry Citrus Fizz</h4>
<p><em>Strawberry and calamansi balanced with a lively fizz.</em></p>
<h5>Ingredients</h5>
<ul>
<li>15ml Strawberry Syrup</li>
<li>10-15ml Calamansi Puree</li>
<li>20g Rainbow Jelly</li>
<li>7-Up</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add strawberry syrup and calamansi puree to cup.</li>
<li>Add rainbow jelly.</li>
<li>Fill cup with ice.</li>
<li>Slowly top with 7-Up.</li>
<li>Light stir only.</li>
</ol>`,

  'Cucumber Breeze': `<h4>Cucumber Breeze</h4>
<p><em>Cool, crisp, and easy to enjoy.</em></p>
<h5>Ingredients</h5>
<ul>
<li>20ml Cucumber Syrup</li>
<li>20g Nata</li>
<li>Soda Water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add cucumber syrup to cup.</li>
<li>Add nata.</li>
<li>Fill cup with ice.</li>
<li>Slowly top with soda water.</li>
<li>Light stir only.</li>
</ol>`,

  'Lychee Fizz': `<h4>Lychee Fizz</h4>
<p><em>Light, floral, and smooth.</em></p>
<h5>Ingredients</h5>
<ul>
<li>20ml Lychee Syrup</li>
<li>20g Nata</li>
<li>Soda Water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add lychee syrup to cup.</li>
<li>Add nata.</li>
<li>Fill cup with ice.</li>
<li>Slowly top with soda water.</li>
<li>Light stir only.</li>
</ol>`,

  'Guava Fizz': `<h4>Guava Fizz</h4>
<p><em>Smooth, fruity, and easy to enjoy.</em></p>
<h5>Ingredients</h5>
<ul>
<li>20ml Guava Syrup</li>
<li>20g Nata</li>
<li>Soda Water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add guava syrup to cup.</li>
<li>Add nata.</li>
<li>Fill cup with ice.</li>
<li>Slowly top with soda water.</li>
<li>Light stir only.</li>
</ol>`,
};

// ============================================================
// 5. MILK TEA & MORE RECIPES
// ============================================================
const milkTeaRecipes: Record<string, string> = {
  'Wintermelon': `<h4>Wintermelon Milk Tea</h4>
<p><em>Light, smooth, and easy to love.</em></p>
<h5>Ingredients</h5>
<ul>
<li>35g Injoy Wintermelon Powder</li>
<li>120ml water</li>
<li>30g boba pearls</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add boba pearls to cup.</li>
<li>Fill cup with ice.</li>
<li>Shake powder and water thoroughly.</li>
<li>Pour into cup and serve.</li>
</ol>`,

  'Okinawa': `<h4>Okinawa Milk Tea</h4>
<p><em>Rich, bold, and creamy with that caramel kick.</em></p>
<h5>Ingredients</h5>
<ul>
<li>35g Injoy Okinawa Powder</li>
<li>120ml water</li>
<li>30g boba pearls</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add boba pearls to cup.</li>
<li>Fill cup with ice.</li>
<li>Shake powder and water thoroughly.</li>
<li>Pour into cup.</li>
</ol>`,

  'Soy': `<h4>Taro Milk Tea</h4>
<p><em>Nutty, creamy, and comforting.</em></p>
<h5>Ingredients</h5>
<ul>
<li>35g Injoy Taro Powder</li>
<li>120ml water</li>
<li>30g boba pearls</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add boba pearls to cup.</li>
<li>Fill cup with ice.</li>
<li>Shake taro mixture thoroughly.</li>
<li>Pour into cup.</li>
</ol>`,

  'Cookies & Cream': `<h4>Cookies & Cream Milk Tea</h4>
<p><em>Creamy, sweet, and loaded with cookies-and-cream goodness.</em></p>
<h5>Ingredients</h5>
<ul>
<li>30g Cookies & Cream Powder</li>
<li>5g crushed Oreo</li>
<li>120ml water</li>
<li>30g boba pearls</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add boba pearls to cup.</li>
<li>Fill cup with ice.</li>
<li>Shake cookies & cream powder with water.</li>
<li>Pour into cup.</li>
<li>Optional: sprinkle crushed Oreo on top.</li>
</ol>`,

  'Mango Milk Tea': `<h4>Mango Milk Tea</h4>
<p><em>Creamy milk tea with that sweet mango punch.</em></p>
<h5>Ingredients</h5>
<ul>
<li>30g Wintermelon Powder</li>
<li>15-20ml Mango Syrup</li>
<li>110ml water</li>
<li>30g boba pearls</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add mango syrup walling around cup.</li>
<li>Add boba pearls.</li>
<li>Fill cup with ice.</li>
<li>Shake wintermelon base thoroughly.</li>
<li>Pour into cup slowly.</li>
</ol>`,

  'Iced Choco Mango': `<h4>Iced Choco Mango Milk</h4>
<p><em>Creamy mango milk topped with rich chocolate blend.</em></p>
<h5>Ingredients</h5>
<ul>
<li>35ml Mango Syrup</li>
<li>30g Milk Powder</li>
<li>100ml cold water</li>
<li>Ice</li>
<li>1 tbsp Chocolate Powder topper</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add mango syrup walling around cup.</li>
<li>Fill cup with ice.</li>
<li>Shake milk powder and water thoroughly.</li>
<li>Pour into cup.</li>
<li>Blend chocolate powder with small splash of water or milk.</li>
<li>Pour chocolate topper slowly on top.</li>
</ol>`,

  'Mango Coffee Shake': `<h4>Iced Mango Coffee Latte</h4>
<p><em>Sweet mango, creamy milk, and coffee in one smooth iced drink.</em></p>
<h5>Ingredients</h5>
<ul>
<li>20ml Mango Syrup</li>
<li>60ml Coffee Base / Espresso</li>
<li>30g Milk Powder</li>
<li>100ml water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add mango syrup walling.</li>
<li>Fill cup with ice.</li>
<li>Pour milk base.</li>
<li>Slowly add coffee layer on top.</li>
</ol>`,

  'Matcha Latte': `<h4>Matcha Latte</h4>
<p><em>Smooth, creamy matcha with just the right balance.</em></p>
<h5>Ingredients</h5>
<ul>
<li>8g Matcha Powder</li>
<li>30g Milk Powder</li>
<li>110ml water</li>
<li>Ice</li>
<li>30g boba pearls</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add boba pearls.</li>
<li>Fill cup with ice.</li>
<li>Shake matcha and milk base thoroughly.</li>
<li>Pour into cup.</li>
</ol>`,

  'Matcha Strawberry': `<h4>Matcha Strawberry</h4>
<p><em>Creamy matcha with sweet strawberry walling.</em></p>
<h5>Ingredients</h5>
<ul>
<li>8g Matcha Powder</li>
<li>30g Milk Powder</li>
<li>5ml Strawberry Syrup</li>
<li>110ml water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add strawberry walling.</li>
<li>Fill cup with ice.</li>
<li>Shake matcha milk base thoroughly.</li>
<li>Pour slowly.</li>
</ol>`,

  'Dirty Matcha': `<h4>Dirty Matcha</h4>
<p><em>Creamy matcha latte with a coffee kick.</em></p>
<h5>Ingredients</h5>
<ul>
<li>8g Matcha Powder</li>
<li>30g Milk Powder</li>
<li>60ml Coffee Base</li>
<li>100ml water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Fill cup with ice.</li>
<li>Pour matcha milk base.</li>
<li>Slowly add coffee layer on top.</li>
</ol>`,

  'Matcha Mango': `<h4>Matcha Mango</h4>
<p><em>Creamy matcha with a bright mango twist.</em></p>
<h5>Ingredients</h5>
<ul>
<li>8g Matcha Powder</li>
<li>20ml Mango Syrup</li>
<li>30g Milk Powder</li>
<li>100ml water</li>
<li>Ice</li>
</ul>
<h5>Build Process</h5>
<ol>
<li>Add mango syrup walling.</li>
<li>Fill cup with ice.</li>
<li>Shake matcha milk base thoroughly.</li>
<li>Pour slowly.</li>
</ol>`,
};

async function main() {
  const batch = db.batch();
  let count = 0;

  // --- 1. Price fixes (non-milk-tea items) ---
  for (const [id, price] of Object.entries(priceFixes)) {
    // Skip milk tea classics (handled separately with variants)
    if (milkTeaVariantUpdates[id]) continue;
    const ref = db.collection('menuItems').doc(id);
    batch.update(ref, { basePrice: price });
    count++;
    console.log(`Price fix: ${id} → ${price}`);
  }

  // --- 2. Milk Tea Classics — price + variant update ---
  for (const [id, update] of Object.entries(milkTeaVariantUpdates)) {
    const ref = db.collection('menuItems').doc(id);
    batch.update(ref, { basePrice: update.basePrice, variants: update.variants });
    count++;
    console.log(`Milk Tea variant: ${id} → base ${update.basePrice}, variants: ${JSON.stringify(update.variants)}`);
  }

  // --- 3. Street Bites restructure ---
  const streetBitesRef = db.collection('menuItems').doc(streetBitesUpdate.id);
  batch.update(streetBitesRef, {
    name: streetBitesUpdate.name,
    basePrice: streetBitesUpdate.basePrice,
    variants: streetBitesUpdate.variants,
  });
  count++;
  console.log(`Street Bites restructured: Solo 60, Large 115`);

  // --- 4. French Fries — multi-dimensional variants ---
  const frenchFriesRef = db.collection('menuItems').doc(frenchFriesUpdate.id);
  batch.update(frenchFriesRef, {
    name: frenchFriesUpdate.name,
    basePrice: frenchFriesUpdate.basePrice,
    variants: frenchFriesUpdate.variants,
    variantGroups: frenchFriesUpdate.variantGroups,
    priceMatrix: frenchFriesUpdate.priceMatrix,
  });
  count++;
  console.log(`French Fries restructured with price matrix`);

  // --- 5. Cooler Pitchers — rename existing + create new ---
  const coolerRef = db.collection('menuItems').doc('iMI1untw6r16gEEzSGA1');
  batch.update(coolerRef, { name: 'Mango Cooler Pitcher' });
  count++;
  console.log(`Cooler Pitchers renamed to Mango Cooler Pitcher`);

  // Create Cucumber Cooler Pitcher
  const cucumberRef = db.collection('menuItems').doc();
  batch.set(cucumberRef, {
    name: 'Cucumber Cooler Pitcher',
    categoryId: 'iklV39Hsh8an0UkE3pNx', // Barkada Favorites
    basePrice: 99,
    description: 'Light, cool, and refreshing. A perfect match for noodles, bites, and merienda moments.',
    variants: [{ name: 'Regular', priceAdd: 0 }],
    isAvailable: true,
    station: 'prep',
  });
  count++;
  console.log(`Created Cucumber Cooler Pitcher`);

  // --- 6. Noodle Corner Add-on Group ---
  const addOnRef = db.collection('addOnGroups').doc();
  batch.set(addOnRef, {
    name: 'Noodle Add-ons',
    applicableCategories: ['za4NUrv3hKSIKk9qNPcB'], // Noodle Corner
    items: [
      { name: 'Extra Egg', price: 15 },
      { name: 'Cheese Slice', price: 20 },
      { name: 'Fish Tofu', price: 20 },
      { name: 'Squid Balls', price: 20 },
      { name: 'Fish Cake', price: 20 },
      { name: 'Spam Slice', price: 30 },
      { name: 'Extra Siomai 4pcs', price: 30 },
    ],
  });
  count++;
  console.log(`Created Noodle Add-ons group`);

  // --- 7. Recipes — Street Fizz ---
  const allItems = await db.collection('menuItems').get();
  const itemsByName = new Map<string, string>();
  allItems.docs.forEach(d => itemsByName.set(d.data().name, d.id));

  for (const [name, recipe] of Object.entries(fizzRecipes)) {
    const docId = itemsByName.get(name);
    if (docId) {
      batch.update(db.collection('menuItems').doc(docId), { prepInstructions: recipe });
      count++;
      console.log(`Recipe added: ${name}`);
    } else {
      console.warn(`⚠ Item not found for recipe: ${name}`);
    }
  }

  // --- 8. Recipes — Milk Tea & More ---
  for (const [name, recipe] of Object.entries(milkTeaRecipes)) {
    const docId = itemsByName.get(name);
    if (docId) {
      batch.update(db.collection('menuItems').doc(docId), { prepInstructions: recipe });
      count++;
      console.log(`Recipe added: ${name}`);
    } else {
      console.warn(`⚠ Item not found for recipe: ${name}`);
    }
  }

  console.log(`\nCommitting ${count} updates...`);
  await batch.commit();
  console.log('Done!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
