import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ credential: applicationDefault(), projectId: 'brandserps-demo' });
const db = getFirestore(app, 'joes-pos');

async function main() {
  const snap = await db.collection('menuItems').get();
  console.log('=== MENU ITEMS (' + snap.size + ') ===');
  snap.docs.forEach(d => {
    const data = d.data();
    const fields = Object.keys(data).sort().join(', ');
    const variants = data.variants ? JSON.stringify(data.variants) : 'none';
    const basePrice = data.basePrice ?? data.price ?? '??';
    console.log(`${data.name} | basePrice: ${basePrice} | variants: ${variants} | fields: [${fields}]`);
  });

  console.log('');
  const catSnap = await db.collection('categories').get();
  console.log('=== CATEGORIES (' + catSnap.size + ') ===');
  catSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`${d.id} | ${data.name} | icon: ${data.icon} | order: ${data.displayOrder}`);
  });

  console.log('');
  const addOnSnap = await db.collection('addOnGroups').get();
  console.log('=== ADD-ON GROUPS (' + addOnSnap.size + ') ===');
  addOnSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`${d.id} | ${data.name} | cats: ${JSON.stringify(data.applicableCategories)} | items: ${data.items?.length ?? 0}`);
  });

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
