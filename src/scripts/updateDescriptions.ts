/**
 * Update all menu items with descriptions from the menu pages.
 * Also adds prep instructions (recipes) for iced coffee items.
 * Usage: npx tsx src/scripts/updateDescriptions.ts
 */
import 'dotenv/config';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ credential: applicationDefault(), projectId: 'brandserps-demo' });
const db = getFirestore(app, 'joes-pos');

// Coffee Base Guide table (shared across all iced coffee recipes)
const coffeeBaseTable = `<h4>Coffee Base Guide</h4>
<table>
<tr><th>Option</th><th>Use</th><th>Notes</th></tr>
<tr><td>Espresso</td><td>30ml per drink</td><td>Best taste if available</td></tr>
<tr><td>Strong coffee base</td><td>60ml per milk-based drink</td><td>Practical for batching and chilled drinks</td></tr>
<tr><td>Strong Americano base</td><td>75ml for Iced Americano</td><td>Keeps the drink bold after ice melts</td></tr>
</table>
<p><strong>Standard Iced Coffee Rule:</strong> Fill cup 80–85% with ice. Use solid ice maker ice first, then crushed ice to fill gaps. Serve within 3–5 minutes.</p>
<hr>`;

// Descriptions extracted from menu pages
const descriptions: Record<string, string> = {
  // Coffee - Hot
  'Brewed Coffee': 'Freshly brewed and straight to the point.',
  'Americano': 'Bold espresso with hot water.',
  'Cafe Latte': 'Smooth espresso with creamy milk.',
  'Salted Caramel': 'Sweet espresso with a hint of salt, blended into a creamy latte.',

  // Coffee - Iced
  'Iced Americano': 'Cold, bold, and refreshing. Strong coffee, no extras.',
  'Greek Frappe': 'Frothy iced coffee, light and refreshing with a smooth finish.',
  'Iced Latte': 'Cool, creamy, and perfectly balanced with milk and espresso.',
  'Dalgona': 'Whipped coffee over milk. Creamy, fun, and made to stand out.',
  'Caramel Macchiato': 'Milk, espresso, and caramel drizzle. Sweet, smooth, and a little extra.',

  // Chocolates - Hot
  'Hot Chocolate': 'Rich, smooth, and comforting. Like your favourite chocolate, served warm.',
  'Hot Mocha': 'Chocolate with a coffee kick. Bold, creamy, and made for long days.',

  // Chocolates - Iced
  'Iced Choco': 'Cold and smooth for chocolate cravings. Always a good idea.',
  'Iced Choco Latte': 'Creamy chocolate latte, perfectly balanced with chocolate and milk.',
  'Iced Choco Oreo': 'Oreo meets iced chocolate with crushed Oreo crumbs. Fun and seriously satisfying.',
  'Iced Choco Strawberry': 'Chocolate with strawberry, the perfect sweet pair in a refreshing cup.',

  // Milk Teas - Classics
  'Wintermelon': 'Light, smooth, and naturally sweet.',
  'Okinawa': 'Rich, bold, and full of roasty, caramelized flavour.',
  'Soy': 'Nutty, creamy, a comforting twist to a classic.',
  'Cookies & Cream': 'Creamy, playful, and loaded with cookies-and-cream goodness.',

  // Milk Teas - Mango Series
  'Mango Milk Tea': 'Sweet, bold, and full of mango punch.',
  'Iced Choco Mango': 'Chocolate and mango. A sweet, creamy, daring mix in a cup.',
  'Mango Coffee Shake': 'Coffee meets mango. A bold, creamy, refreshing mix.',
  'Iced Mango Latte': 'Creamy, rich, and refreshing.',

  // Milk Teas - Matcha Series
  'Matcha Latte': 'Earthy, creamy, and made for slow sips or busy study days.',
  'Matcha Strawberry': 'Classic matcha meets sweet strawberry, setting a bold duo.',
  'Dirty Matcha': 'Coffee meets matcha. A bold, earthy, caffeinated boost.',
  'Matcha Mango': 'Matcha meets tropical mango. Creamy, light, and refreshing.',

  // Street Fizz (series-level)
  'Sunset': 'Layered blends crafted for that sunset glow. Colours light on top, richer as you sip.',
  'Fresh & Light': 'Clean flavours with a smooth, easy finish.',
  'Citrus Boost': 'Brighter, bolder blends with a refreshing kick.',

  // Mango Cloud Series
  'Classic': 'Creamy mango with a smooth, balanced finish.',
  'Berry Cloud': 'Creamy mango with a light strawberry twist and a sweet berry finish.',
  'Citrus Cloud': 'Creamy mango with a light calamansi lift. Smooth and refreshing.',

  // Pastas
  'Garlic Tuna Penne': 'Creamy, garlicky penne pasta tossed with spicy tuna, milk, cream, and house spices.',
  'Chicken Tomato Penne': 'Penne pasta tossed in a rich homestyle tomato sauce with tender chicken, mushrooms, garlic, and house spices.',

  // Sandwiches
  'Egg & Toast': 'Toasted bread served with egg. Simple, warm, and filling.',
  'Egg Sandwich': 'Creamy egg filling served on toasted bread.',
  'Ham & Egg Sandwich': 'Toasted sandwich with ham, egg, and creamy spread.',

  // Noodle Corner
  'Jjajangmyeon': 'Korean-style black bean noodles served with egg. Rich, savory, and filling.',
  'Kimchi Ramen': 'Warm and spicy kimchi ramen served with egg. Comforting, flavorful, and satisfying.',
  'Buldak Cheese': 'Bold, spicy, and cheesy Korean noodles served with egg. Perfect for those who like a kick.',
  'Pancit Canton Combo': 'Choose from Sweet & Spicy, Spicy, or Calamansi. Served with egg and 2 pcs siomai.',

  // Barkada Favorites
  'Pinoy Barkada Platter': 'Good for 4–5 pax. Pancit Canton, eggs, siomai, Joe Street Bites, and 1L cooler pitcher.',
  'K-Barkada Platter': 'Good for 4–5 pax. K-Ramen, Korean-style toppings, Joe Street Bites, and 1L cooler pitcher.',
  'Cooler Pitchers': 'Choose Mango or Cucumber. Sweet, fruity, and refreshing. Perfect for sharing.',

  // Street Bites
  'Spam Fries': 'Crispy spam fries served with dipping sauce.',
  'French Fries': 'Classic fries — Regular or Cheese, Solo or Large.',
  'Street Bites Platter': 'Simple, savoury bites made for merienda, sharing, and quick cravings.',
};

// Iced coffee recipes as HTML
const recipes: Record<string, string> = {
  'Iced Americano': `${coffeeBaseTable}
<h4>Ingredients</h4>
<ul>
<li>80–85% cup ice</li>
<li>120ml cold water</li>
<li>75ml strong coffee base OR 30ml espresso</li>
</ul>
<h4>Build</h4>
<ol>
<li>Fill cup 80–85% with ice. Use more solid ice, less crushed ice.</li>
<li>Pour 120ml cold water.</li>
<li>Add 75ml strong coffee base or 30ml espresso.</li>
<li>Stir lightly.</li>
<li>Serve immediately.</li>
</ol>
<p><strong>Taste guide:</strong> Cold, bold, refreshing, and not creamy.</p>
<p><mark>Staff note: Reduce water from the old 150ml to 120ml because our ice melts faster.</mark></p>`,

  'Greek Frappe': `${coffeeBaseTable}
<h4>Ingredients</h4>
<ul>
<li>2 tsp instant coffee</li>
<li>2 tsp sugar</li>
<li>30ml cold water</li>
<li>80–85% cup ice</li>
<li>100ml cold water OR milk</li>
</ul>
<h4>Build</h4>
<ol>
<li>In a shaker, add instant coffee, sugar, and 30ml cold water.</li>
<li>Shake hard until foamy.</li>
<li>Fill cup 80–85% with ice.</li>
<li>Pour foam mixture into the cup.</li>
<li>Add 100ml cold water or milk.</li>
<li>Stir lightly or serve layered.</li>
<li>Serve immediately.</li>
</ol>
<p><strong>Taste guide:</strong> Frothy iced coffee, light and refreshing with a smooth finish.</p>
<p><mark>Staff note: Use water for a lighter frappe, milk for a creamier one.</mark></p>`,

  'Iced Latte': `${coffeeBaseTable}
<h4>Ingredients</h4>
<ul>
<li>80–85% cup ice</li>
<li>110ml milk</li>
<li>60ml strong coffee base OR 30ml espresso</li>
<li>Optional: sugar syrup on request</li>
</ul>
<h4>Build</h4>
<ol>
<li>Fill cup 80–85% with ice.</li>
<li>Pour 110ml milk.</li>
<li>Slowly add 60ml strong coffee base or 30ml espresso.</li>
<li>Stir gently.</li>
<li>Serve immediately.</li>
</ol>
<p><strong>Taste guide:</strong> Cool, creamy, and balanced with milk and coffee.</p>
<p><mark>Staff note: This is the basic version. No condensed milk, no French vanilla, and no foam topper unless requested.</mark></p>`,

  'Dalgona': `${coffeeBaseTable}
<h4>Dalgona Foam Recipe</h4>
<ul>
<li>2 tbsp instant coffee</li>
<li>2 tbsp sugar</li>
<li>2 tbsp hot water</li>
</ul>
<ol>
<li>Mix all ingredients in a bowl or cup.</li>
<li>Whip until thick, fluffy, and light brown.</li>
</ol>
<p><em>Texture: Thick and fluffy, not watery.</em></p>
<hr>
<h4>Ingredients</h4>
<ul>
<li>80–85% cup ice</li>
<li>110ml milk</li>
<li>Dalgona foam (from above)</li>
</ul>
<h4>Build</h4>
<ol>
<li>Fill cup 80–85% with ice.</li>
<li>Pour 110ml milk.</li>
<li>Spoon dalgona foam on top.</li>
<li>Serve immediately without mixing first.</li>
</ol>
<p><strong>Taste guide:</strong> Whipped coffee over milk. Creamy, fun, and made to stand out.</p>
<p><mark>Staff note: Best served fresh because the foam can lose volume.</mark></p>`,

  'Caramel Macchiato': `${coffeeBaseTable}
<h4>Dalgona Foam Recipe</h4>
<ul>
<li>2 tbsp instant coffee + 2 tbsp sugar + 2 tbsp hot water</li>
<li>Whip until thick, fluffy, and light brown.</li>
</ul>
<hr>
<h4>Ingredients</h4>
<ul>
<li>15ml condensed milk</li>
<li>80–85% cup ice</li>
<li>100ml milk</li>
<li>60ml strong coffee base OR 30ml espresso</li>
<li>Dalgona foam</li>
<li>Caramel drizzle</li>
</ul>
<h4>Build</h4>
<ol>
<li>Add 15ml condensed milk at the bottom of the cup.</li>
<li>Fill cup 80–85% with ice.</li>
<li>Pour 100ml milk.</li>
<li>Slowly add 60ml strong coffee base or 30ml espresso.</li>
<li>Add dalgona foam on top.</li>
<li>Finish with caramel drizzle.</li>
<li>Serve immediately without mixing first.</li>
</ol>
<p><strong>Taste guide:</strong> Sweet condensed milk, creamy milk, coffee, whipped foam, and caramel drizzle. A little extra, in the best way.</p>
<p><mark>Staff note: Keep at ₱109 minimum because it has condensed milk, milk, coffee, dalgona foam, and caramel.</mark></p>`,
};

async function main() {
  const snap = await db.collection('menuItems').get();
  let updated = 0;
  let recipesAdded = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const name = data.name as string;
    const updates: Record<string, string> = {};

    if (descriptions[name] && !data.description) {
      updates.description = descriptions[name];
    }

    if (recipes[name] && !data.prepInstructions) {
      updates.prepInstructions = recipes[name];
      recipesAdded++;
    }

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      console.log(`Updated: ${name}${updates.description ? ' [desc]' : ''}${updates.prepInstructions ? ' [recipe]' : ''}`);
      updated++;
    } else {
      console.log(`Skipped: ${name} (already has data)`);
    }
  }

  console.log(`\nDone! Updated ${updated} items, added ${recipesAdded} recipes.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
