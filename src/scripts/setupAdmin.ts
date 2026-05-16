import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCNL26vAEm5NxVHRZ1YVDz1T26HsZYycAQ",
  authDomain: "brandserps-demo.firebaseapp.com",
  projectId: "brandserps-demo",
  storageBucket: "brandserps-demo.appspot.com",
  messagingSenderId: "931055495274",
  appId: "1:931055495274:web:ba22bffe1b9575311c8213",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'joes-pos');

async function setupAdmin() {
  try {
    console.log('Creating Super Admin user...');
    const cred = await createUserWithEmailAndPassword(auth, 'admin@joestreet.cafe', 'joespos1234');

    console.log('Auth user created:', cred.user.uid);

    // Add user doc to Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: 'Admin',
      email: 'admin@joestreet.cafe',
      role: 'super_admin',
      station: '',
      pin: '',
      isActive: true,
    });

    console.log('User document created in Firestore.');
    console.log('\n✅ Super Admin setup complete!');
    console.log('   Email: admin@joestreet.cafe');
    console.log('   Password: joespos1234');

    process.exit(0);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  User already exists. Skipping creation.');
      process.exit(0);
    }
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
