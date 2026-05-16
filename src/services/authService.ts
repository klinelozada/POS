import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { User } from '../types';

/**
 * Sign in with email and password.
 */
export async function login(email: string, password: string): Promise<FirebaseUser> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Sign out the current user.
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Get the currently authenticated Firebase user (synchronous snapshot).
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Verify a 4-digit PIN against the users collection.
 * Returns the matching User document or null.
 */
export async function verifyPin(pin: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('pin', '==', pin),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  } catch (error) {
    console.error('PIN verification error:', error);
    return null;
  }
}

/**
 * Listen to Firebase Auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}
