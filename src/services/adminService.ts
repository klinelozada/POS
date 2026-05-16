import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { User, Promo, Settings, CreateData, Order } from '../types';

const usersRef = collection(db, 'users');
const promosRef = collection(db, 'promos');
const settingsDocRef = doc(db, 'settings', 'global');
const ordersRef = collection(db, 'orders');

// --- Users ---

export async function getUsers(): Promise<User[]> {
  try {
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function createUser(data: CreateData<User>): Promise<string> {
  const docRef = await addDoc(usersRef, data);
  return docRef.id;
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, data);
}

export async function deleteUser(id: string): Promise<void> {
  const docRef = doc(db, 'users', id);
  await deleteDoc(docRef);
}

// --- Promos ---

export async function getPromos(): Promise<Promo[]> {
  try {
    const snapshot = await getDocs(promosRef);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Promo));
  } catch (error) {
    console.error('Error fetching promos:', error);
    return [];
  }
}

export async function createPromo(data: CreateData<Promo>): Promise<string> {
  const docRef = await addDoc(promosRef, data);
  return docRef.id;
}

export async function updatePromo(id: string, data: Partial<Promo>): Promise<void> {
  const docRef = doc(db, 'promos', id);
  await updateDoc(docRef, data);
}

export async function deletePromo(id: string): Promise<void> {
  const docRef = doc(db, 'promos', id);
  await deleteDoc(docRef);
}

// --- Settings ---

export async function getSettings(): Promise<Settings | null> {
  try {
    const snapshot = await getDoc(settingsDocRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as Settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function updateSettings(data: Partial<Settings>): Promise<void> {
  await updateDoc(settingsDocRef, data);
}

// --- Station PINs ---

export type PinType = 'adminPin' | 'kioskPin' | 'prepPin' | 'kitchenPin';

export async function verifyPin(type: PinType, pin: string): Promise<boolean> {
  const settings = await getSettings();
  if (!settings?.[type]) return false;
  return settings[type] === pin;
}

export async function setPin(type: PinType, pin: string): Promise<void> {
  await updateDoc(settingsDocRef, { [type]: pin });
}

// Convenience aliases
export const verifyAdminPin = (pin: string) => verifyPin('adminPin', pin);
export const setAdminPin = (pin: string) => setPin('adminPin', pin);

// --- User Role ---

export async function getUserRole(uid: string): Promise<User['role'] | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;
    return (userDoc.data() as User).role;
  } catch {
    return null;
  }
}

// --- Dashboard Stats ---

export interface DashboardStats {
  todayOrderCount: number;
  todayRevenue: number;
  popularItems: { name: string; count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(todayStart);

    const q = query(
      ordersRef,
      where('createdAt', '>=', todayTimestamp),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((d) => d.data() as Order);

    const todayOrderCount = orders.length;
    const todayRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);

    // Count item popularity
    const itemCounts = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const current = itemCounts.get(item.name) ?? 0;
        itemCounts.set(item.name, current + item.quantity);
      }
    }

    const popularItems = Array.from(itemCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { todayOrderCount, todayRevenue, popularItems };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { todayOrderCount: 0, todayRevenue: 0, popularItems: [] };
  }
}
