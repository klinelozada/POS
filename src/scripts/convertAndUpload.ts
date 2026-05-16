/**
 * Convert all menu item images to WebP and re-upload to Firebase Storage.
 * Updates Firestore photo URLs.
 *
 * Usage: npx tsx src/scripts/convertAndUpload.ts
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import sharp from 'sharp';

const projectId = 'brandserps-demo';
const storageBucket = 'brandserps-demo.appspot.com';
const databaseId = 'joes-pos';

const app = initializeApp({ credential: applicationDefault(), projectId, storageBucket });
const db = getFirestore(app, databaseId);
const bucket = getStorage(app).bucket();

// Map Firestore item names (lowercased) to local image files in menu_items/items/
const imageMap: Record<string, string> = {
  // Coffee - Hot
  'brewed coffee': 'items/coffee/hot/brewed.png',
  'americano': 'items/coffee/hot/americano.png',
  'cafe latte': 'items/coffee/hot/cafe-latte.png',
  'salted caramel': 'items/coffee/hot/salted-caramel.png',
  // Coffee - Iced
  'iced americano': 'items/coffee/iced/iced-americano.png',
  'greek frappe': 'items/coffee/iced/greek-frappe.png',
  'iced latte': 'items/coffee/iced/iced-latte.png',
  'dalgona': 'items/coffee/iced/iced-dalgona.png',
  'caramel macchiato': 'items/coffee/iced/iced-caramel-machiato.png',
  // Chocolate - Hot
  'hot chocolate': 'items/chocolate/hot/hot-chocolate.png',
  'hot mocha': 'items/chocolate/hot/hot-mocha.png',
  // Chocolate - Iced
  'iced choco': 'items/chocolate/iced/iced-choco.png',
  'iced choco latte': 'items/chocolate/iced/iced-choco-latte.png',
  'iced choco oreo': 'items/chocolate/iced/iced-choco-oreo.png',
  'iced choco strawberry': 'items/chocolate/iced/iced-choco-strawberry.png',
  // Milk Tea - Classics
  'wintermelon': 'items/milktea/classic/wintermelon.png',
  'okinawa': 'items/milktea/classic/okinawa.png',
  'taro': 'items/milktea/classic/taro.png',
  'cookies & cream': 'items/milktea/classic/cookies-and-cream.png',
  'soy': 'items/milktea/classic/okinawa.png',
  // Milk Tea - Mango Series
  'mango milk tea': 'items/milktea/mango/mango.png',
  'iced choco mango': 'items/milktea/mango/iced-chocolate-mango.png',
  'mango strawberry': 'items/milktea/mango/mango-strawberry.png',
  'iced mango coffee': 'items/milktea/mango/iced-mango-coffee.png',
  'iced mango latte': 'items/milktea/mango/iced-mango-coffee.png',
  'mango coffee shake': 'items/milktea/mango/mango.png',
  // Mango Cloud Series
  'classic': 'items/milktea/mango/mango.png',
  'berry cloud': 'items/milktea/mango/mango-berry-cloud.png',
  'citrus cloud': 'items/milktea/mango/mango-passion-fruit-cloud.png',
  // Milk Tea - Matcha Series
  'matcha latte': 'items/milktea/matcha/matcha.png',
  'matcha strawberry': 'items/milktea/matcha/matcha-strawberry.png',
  'dirty matcha': 'items/milktea/matcha/dirty-matcha.png',
  'matcha mango': 'items/milktea/matcha/matcha-mango.png',
  // Street Fizz
  'strawberry sunset': 'items/fizz/strawberry-sunset.png',
  'mango sunset': 'items/fizz/mango-sunset.png',
  'berry sunset': 'items/fizz/berry-sunset.png',
  'tropical sunset': 'items/fizz/tropical-sunset.png',
  'sunset': 'items/fizz/strawberry-sunset.png',
  'cucumber breeze': 'items/fizz/cucumber-breeze.png',
  'lychee fizz': 'items/fizz/lychee-fizz.png',
  'guava spritz': 'items/fizz/guava-fizz.png',
  'calamansi spark': 'items/fizz/calamansi-spark.png',
  'strawberry citrus fizz': 'items/fizz/strawberry-citrus-fizz.png',
  'passion citrus punch': 'items/fizz/passion-citrus-punch.png',
  'citrus boost': 'items/fizz/calamansi-spark.png',
  'fresh & light': 'items/fizz/cucumber-breeze.png',
  // Pasta
  'garlic tuna penne': 'items/pasta/garlic-tuna.png',
  'chicken tomato penne': 'items/pasta/chicken-tomato-penne.png',
  // Noodles
  'jjajangmyeon': 'items/noodles/jajangmyeon-egg.png',
  'kimchi ramen': 'items/noodles/kimchi-ramen-egg.png',
  'buldak cheese': 'items/noodles/buldak-cheese-egg.png',
  'pancit canton combo': 'items/noodles/pancit-canton-combo.png',
  // Sandwiches
  'egg & toast': 'items/sandwiches/egg-toast-sandwich.png',
  'egg sandwich': 'items/sandwiches/egg-sandwich.png',
  'ham & egg sandwich': 'items/sandwiches/ham-egg-sandwich.png',
  // Barkada Favorites
  'pinoy barkada platter': 'items/barkada-favorites/pinoy-platter.png',
  'k-barkada platter': 'items/barkada-favorites/k-barkada-platter.png',
  'cooler pitchers': 'items/pitcher/mango-cooler-pitcher.png',
  // Pitcher
  'mango cooler pitcher': 'items/pitcher/mango-cooler-pitcher.png',
  'cucumber cooler pitcher': 'items/pitcher/cucumber-cooler-pitcher.png',
  // Street Bites
  'spam fries': 'items/street-bites/street-bites.png',
  'french fries': 'items/street-bites/french-fries-solo.png',
  'street bites': 'items/street-bites/street-bites.png',
  'street bites platter': 'items/street-bites/street-bites.png',
};

async function convertAndUpload() {
  console.log('Fetching menu items from Firestore...');
  const snapshot = await db.collection('menuItems').get();

  const items = snapshot.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
    photo: d.data().photo as string | undefined,
  }));

  console.log(`Found ${items.length} menu items.\n`);

  let uploaded = 0;
  let skipped = 0;
  let notFound = 0;
  let fileNotFound = 0;

  for (const item of items) {
    const localRelPath = imageMap[item.name.toLowerCase()];

    if (!localRelPath) {
      console.log(`  SKIP (no mapping): ${item.name}`);
      notFound++;
      continue;
    }

    const fullPath = resolve('menu_items', localRelPath);
    if (!existsSync(fullPath)) {
      console.log(`  SKIP (file not found): ${item.name} -> ${fullPath}`);
      fileNotFound++;
      continue;
    }

    try {
      // Convert to WebP with sharp
      const pngBuffer = readFileSync(fullPath);
      const webpBuffer = await sharp(pngBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      const origSize = (pngBuffer.length / 1024).toFixed(1);
      const newSize = (webpBuffer.length / 1024).toFixed(1);

      const storagePath = `menu-items/${item.id}.webp`;
      const file = bucket.file(storagePath);
      await file.save(webpBuffer, {
        metadata: { contentType: 'image/webp' },
        public: true,
      });

      const downloadUrl = `https://storage.googleapis.com/${storageBucket}/${storagePath}`;
      await db.collection('menuItems').doc(item.id).update({ photo: downloadUrl });

      console.log(`  UPLOADED: ${item.name} (${origSize}KB -> ${newSize}KB webp)`);
      uploaded++;
    } catch (err) {
      console.error(`  ERROR: ${item.name} - ${err}`);
    }
  }

  // Also delete old .png files from storage
  console.log('\nCleaning up old .png files from storage...');
  const [files] = await bucket.getFiles({ prefix: 'menu-items/' });
  for (const f of files) {
    if (f.name.endsWith('.png')) {
      await f.delete();
      console.log(`  DELETED: ${f.name}`);
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}, No mapping: ${notFound}, File not found: ${fileNotFound}`);
  process.exit(0);
}

convertAndUpload().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
