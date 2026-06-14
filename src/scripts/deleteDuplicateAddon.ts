import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ credential: applicationDefault(), projectId: 'brandserps-demo' });
const db = getFirestore(app, 'joes-pos');

async function main() {
  // Delete the duplicate
  await db.collection('addOnGroups').doc('q1x6lwULlvLgaus2JTId').delete();
  console.log('Deleted q1x6lwULlvLgaus2JTId');

  // Verify
  const snap = await db.collection('addOnGroups').get();
  console.log(`Remaining groups: ${snap.size}`);
  snap.docs.forEach(d => console.log(`  ${d.id} | ${d.data().name}`));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
