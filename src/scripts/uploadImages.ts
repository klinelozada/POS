/**
 * Bulk upload script: uploads all local menu item images to Firebase Storage
 * and updates the corresponding Firestore menuItems documents with photo URLs.
 *
 * Usage:
 *   npx tsx src/scripts/uploadImages.ts
 *
 * Prerequisites:
 * - Must be authenticated via `gcloud auth application-default login`
 *   OR have GOOGLE_APPLICATION_CREDENTIALS pointing to a service account key
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const projectId = 'brandserps-demo';
const storageBucket = 'brandserps-demo.appspot.com';
const databaseId = 'joes-pos';

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
  storageBucket,
});

const db = getFirestore(app, databaseId);
const bucket = getStorage(app).bucket();

// Map of item names (lowercased) to local file paths relative to public/
const imageMap: Record<string, string> = {
  'brewed coffee': 'images/menu/brewed-coffee.png',
  'americano': 'images/menu/americano.png',
  'cafe latte': 'images/menu/cafe-latte.png',
  'salted caramel': 'images/menu/salted-caramel.png',
  'iced americano': 'images/menu/iced-americano.png',
  'greek frappe': 'images/menu/greek-frappe.png',
  'iced latte': 'images/menu/iced-latte.png',
  'dalgona': 'images/menu/iced-dalgona.png',
  'caramel macchiato': 'images/menu/iced-caramel-macchiato.png',
  'hot chocolate': 'images/menu/hot-chocolate.png',
  'hot mocha': 'images/menu/hot-mocha.png',
  'iced choco': 'images/menu/iced-chocolate.png',
  'iced choco latte': 'images/menu/iced-chocolate-latte.png',
  'iced choco oreo': 'images/menu/iced-chocolate-oreo.png',
  'iced choco strawberry': 'images/menu/iced-chocolate-strawberry.png',
  'wintermelon': 'images/menu/wintermelon.png',
  'okinawa': 'images/menu/okinawa.png',
  'taro': 'images/menu/taro.png',
  'cookies & cream milk tea': 'images/menu/cookies-and-cream.png',
  'mango milk tea': 'images/menu/mango.png',
  'iced choco mango': 'images/menu/iced-chocolate-mango.png',
  'mango strawberry': 'images/menu/mango-strawberry.png',
  'iced mango coffee': 'images/menu/iced-mango-coffee.png',
  'mango cloud classic': 'images/menu/mango.png',
  'mango berry cloud': 'images/menu/mang-berry-cloud.png',
  'mango citrus cloud': 'images/menu/mango-passion-fruit-cloud.png',
  'matcha latte': 'images/menu/matcha.png',
  'matcha strawberry': 'images/menu/matcha-strawberry.png',
  'dirty matcha': 'images/menu/dirty-matcha.png',
  'matcha mango': 'images/menu/matcha-mango.png',
  'strawberry sunset': 'images/menu/strawberry-sunset.png',
  'mango sunset': 'images/menu/mango-sunset.png',
  'berry sunset': 'images/menu/berry-sunset.png',
  'tropical sunset': 'images/menu/tropical-sunset.png',
  'cucumber breeze': 'images/menu/cucumber-breeze.png',
  'lychee fizz': 'images/menu/lychee-fizz.png',
  'guava spritz': 'images/menu/guava-fizz.png',
  'calamansi spark': 'images/menu/calamansi-spark.png',
  'strawberry citrus fizz': 'images/menu/strawberry-citrus-fizz.png',
  'passion citrus punch': 'images/menu/passion-citrus-punch.png',
  'garlic tuna penne': 'images/menu/garlic-tuna.png',
  'chicken tomato penne': 'images/menu/chicken-tomato-penne.png',
  'jjajangmyeon with egg': 'images/menu/jajangmyeon-egg.png',
  'kimchi ramen with egg': 'images/menu/kimchi-ramen-egg.png',
  'buldak cheese with egg': 'images/menu/buldak-cheese-egg.png',
  'pancit canton combo': 'images/menu/pancit-canton-combo.png',
  'egg & toast': 'images/menu/egg-toast-sandwich.png',
  'egg sandwich': 'images/menu/egg-sandwich.png',
  'ham & egg sandwich': 'images/menu/ham-egg-sandwich.png',
  'pinoy barkada platter': 'images/menu/pinoy-platter.png',
  'k-barkada platter': 'images/menu/k-barkada-platter.png',
  'mango cooler pitcher': 'images/menu/mango-cooler-pitcher.png',
  'cucumber cooler pitcher': 'images/menu/cucumber-cooler-pitcher.png',
  'spam fries': 'images/menu/street-bites.png',
  'french fries solo': 'images/menu/french-fries-solo.png',
  'french fries large': 'images/menu/french-fries-large.png',
  'street bites': 'images/menu/street-bites.png',
};

async function uploadImages() {
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
    const localPath = imageMap[item.name.toLowerCase()];

    if (!localPath) {
      console.log(`  SKIP (no mapping): ${item.name}`);
      notFound++;
      continue;
    }

    if (item.photo && item.photo.startsWith('https://')) {
      console.log(`  SKIP (already uploaded): ${item.name}`);
      skipped++;
      continue;
    }

    const fullPath = resolve('public', localPath);
    if (!existsSync(fullPath)) {
      console.log(`  SKIP (file not found): ${item.name} -> ${fullPath}`);
      fileNotFound++;
      continue;
    }

    try {
      const fileBuffer = readFileSync(fullPath);
      const storagePath = `menu-items/${item.id}.png`;

      const file = bucket.file(storagePath);
      await file.save(fileBuffer, {
        metadata: { contentType: 'image/png' },
        public: true,
      });

      const downloadUrl = `https://storage.googleapis.com/${storageBucket}/${storagePath}`;

      await db.collection('menuItems').doc(item.id).update({ photo: downloadUrl });
      console.log(`  UPLOADED: ${item.name} -> ${storagePath}`);
      uploaded++;
    } catch (err) {
      console.error(`  ERROR: ${item.name} - ${err}`);
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}, No mapping: ${notFound}, File not found: ${fileNotFound}`);
  process.exit(0);
}

uploadImages().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
