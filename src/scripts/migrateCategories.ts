/**
 * Migrate flat categories to parent-child structure.
 * Creates parent categories and links existing sub-categories.
 * Also creates individual Street Fizz drink items.
 * Usage: npx tsx src/scripts/migrateCategories.ts
 */
import 'dotenv/config';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ credential: applicationDefault(), projectId: 'brandserps-demo' });
const db = getFirestore(app, 'joes-pos');

const catsRef = db.collection('categories');
const itemsRef = db.collection('menuItems');

async function main() {
  // 1. Create parent categories
  console.log('=== Creating parent categories ===');

  const coffeeParent = await catsRef.add({
    name: 'Coffee',
    displayOrder: 1,
    icon: 'coffee',
    isActive: true,
    defaultStation: 'prep',
  });
  console.log(`Created: Coffee (${coffeeParent.id})`);

  const chocoParent = await catsRef.add({
    name: 'Chocolates',
    displayOrder: 3,
    icon: 'local_drink',
    isActive: true,
    defaultStation: 'prep',
  });
  console.log(`Created: Chocolates (${chocoParent.id})`);

  const milkteaParent = await catsRef.add({
    name: 'Milk Teas',
    displayOrder: 5,
    icon: 'local_drink',
    isActive: true,
    defaultStation: 'prep',
  });
  console.log(`Created: Milk Teas (${milkteaParent.id})`);

  // Street Fizz already exists as a category (6cz9crilRitypCShOkZd)
  // It becomes the parent, and we create sub-categories under it
  const streetFizzId = '6cz9crilRitypCShOkZd';

  // 2. Update existing categories with parentId and shorter names
  console.log('\n=== Updating sub-categories ===');

  const updates: { id: string; name: string; parentId: string; order: number }[] = [
    // Coffee
    { id: '1p4SeYPTCf8hNssW8Dsw', name: 'Hot', parentId: coffeeParent.id, order: 1 },
    { id: '9ySavV4R7Uz4AP1uvDnu', name: 'Iced', parentId: coffeeParent.id, order: 2 },
    // Chocolates
    { id: '6QlpTUbBSacFH4WG1Xpc', name: 'Hot', parentId: chocoParent.id, order: 1 },
    { id: 'wa1qdp33I8wzcqq6Byey', name: 'Iced', parentId: chocoParent.id, order: 2 },
    // Milk Teas
    { id: 'Ljq5Uz5reERFiIOJxHqc', name: 'Classics', parentId: milkteaParent.id, order: 1 },
    { id: '2dC3FKeFI0R6It77XJR7', name: 'Mango Series', parentId: milkteaParent.id, order: 2 },
    { id: '5eN9nwEopT5BQv5kiC2r', name: 'Matcha Series', parentId: milkteaParent.id, order: 3 },
  ];

  for (const u of updates) {
    await catsRef.doc(u.id).update({
      name: u.name,
      parentId: u.parentId,
      displayOrder: u.order,
    });
    console.log(`Updated: ${u.name} → parent ${u.parentId}`);
  }

  // 3. Create Street Fizz sub-categories
  console.log('\n=== Creating Street Fizz sub-categories ===');

  const sunsetCat = await catsRef.add({
    name: 'Sunset Series',
    displayOrder: 1,
    icon: 'local_bar',
    isActive: true,
    defaultStation: 'prep',
    parentId: streetFizzId,
    description: 'Layered blends crafted for that sunset glow. Colours light on top, richer as you sip.',
  });
  console.log(`Created: Sunset Series (${sunsetCat.id})`);

  const freshLightCat = await catsRef.add({
    name: 'Fresh & Light',
    displayOrder: 2,
    icon: 'local_bar',
    isActive: true,
    defaultStation: 'prep',
    parentId: streetFizzId,
    description: 'Clean flavours with a smooth, easy finish.',
  });
  console.log(`Created: Fresh & Light (${freshLightCat.id})`);

  const citrusBoostCat = await catsRef.add({
    name: 'Citrus Boost',
    displayOrder: 3,
    icon: 'local_bar',
    isActive: true,
    defaultStation: 'prep',
    parentId: streetFizzId,
    description: 'Brighter, bolder blends with a refreshing kick.',
  });
  console.log(`Created: Citrus Boost (${citrusBoostCat.id})`);

  // 4. Create individual Street Fizz drink items
  console.log('\n=== Creating Street Fizz individual drinks ===');

  const fizzDrinks = [
    // Sunset Series
    { name: 'Strawberry Sunset', catId: sunsetCat.id, desc: 'Strawberry and citrus layered with a sparkling fizz.' },
    { name: 'Mango Sunset', catId: sunsetCat.id, desc: 'Mango with a light berry citrus lift, like a tropical golden sunset.' },
    { name: 'Berry Sunset', catId: sunsetCat.id, desc: 'Blueberry and strawberry. Bold, refreshing, slightly tart.' },
    { name: 'Tropical Sunset', catId: sunsetCat.id, desc: 'Passion fruit and mango. Bright, fruity, layered.' },
    // Fresh & Light
    { name: 'Cucumber Breeze', catId: freshLightCat.id, desc: 'Cucumber with a hint of calamansi and sparkling fizz. Crisp.' },
    { name: 'Lychee Fizz', catId: freshLightCat.id, desc: 'Light, floral, sweet, and fresh.' },
    { name: 'Guava Fizz', catId: freshLightCat.id, desc: 'Guava in a gentle sparkling soda. Easy and refreshing.' },
    // Citrus Boost
    { name: 'Calamansi Spark', catId: citrusBoostCat.id, desc: 'Fizzy calamansi with sparkling soda.' },
    { name: 'Strawberry Citrus Fizz', catId: citrusBoostCat.id, desc: 'Strawberry and calamansi, balanced with a fruity fizz.' },
    { name: 'Passion Citrus Punch', catId: citrusBoostCat.id, desc: 'Passion fruit and calamansi, bold and refreshing.' },
  ];

  for (const drink of fizzDrinks) {
    const ref = await itemsRef.add({
      name: drink.name,
      categoryId: drink.catId,
      basePrice: 69,
      description: drink.desc,
      variants: [{ name: '16oz', priceAdd: 10 }],
      isAvailable: true,
      station: 'prep',
    });
    console.log(`Created: ${drink.name} (${ref.id})`);
  }

  // 5. Delete old Street Fizz series items (they're now sub-categories)
  console.log('\n=== Removing old Street Fizz series items ===');

  const oldFizzItems = [
    'rBwA49iHbYwqSCugI0C8', // Sunset
    'boebpYNrT2bxZRIm3mKo', // Fresh & Light
    '8Rggu39xC5nvbKKsdqnA', // Citrus Boost
  ];

  for (const itemId of oldFizzItems) {
    const doc = await itemsRef.doc(itemId).get();
    if (doc.exists) {
      const name = doc.data()?.name;
      await itemsRef.doc(itemId).delete();
      console.log(`Deleted old item: ${name} (${itemId})`);
    }
  }

  // 6. Update top-level category display orders
  console.log('\n=== Updating display orders ===');

  const topLevelOrders: Record<string, number> = {
    [coffeeParent.id]: 1,
    [chocoParent.id]: 2,
    [milkteaParent.id]: 3,
    [streetFizzId]: 4,
    '0qymZniAmJQegIxYwrgz': 5,   // Mango Cloud Series
    'G3F5K5S8hhwVD8Pv5Ng5': 6,   // Pastas
    'nNcEP7n22m1xw8DSpPs8': 7,   // Sandwiches
    'za4NUrv3hKSIKk9qNPcB': 8,   // Noodle Corner
    'iklV39Hsh8an0UkE3pNx': 9,   // Barkada Favorites
    'mDj1IF7VLiSUPfQJp2gf': 10,  // Street Bites
  };

  for (const [id, order] of Object.entries(topLevelOrders)) {
    await catsRef.doc(id).update({ displayOrder: order });
  }
  console.log('Display orders updated.');

  console.log('\nMigration complete!');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
