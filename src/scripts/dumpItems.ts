import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ credential: applicationDefault(), projectId: 'brandserps-demo' });
const db = getFirestore(app, 'joes-pos');

async function main() {
  const snap = await db.collection('menuItems').get();
  console.log('=== MENU ITEMS (' + snap.size + ') ===');
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`${d.id} | ${data.name} | photo: ${data.photo ? 'YES' : 'NO'} | cat: ${data.categoryId}`);
  });

  console.log('');
  const catSnap = await db.collection('categories').get();
  console.log('=== CATEGORIES (' + catSnap.size + ') ===');
  catSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`${d.id} | ${data.name} | icon: ${data.icon} | order: ${data.displayOrder}`);
  });

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
