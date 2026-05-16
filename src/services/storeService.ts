import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  onSnapshot,
  Timestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { StoreStatus, DailyReport } from '../types';

const settingsDocRef = doc(db, 'settings', 'global');
const ordersRef = collection(db, 'orders');
const dailyReportsRef = collection(db, 'dailyReports');

export async function getStoreStatus(): Promise<StoreStatus> {
  const snap = await getDoc(settingsDocRef);
  const data = snap.data();
  return data?.storeStatus ?? { isOpen: false, openedAt: null, openingCash: 0, closedAt: null };
}

export function subscribeToStoreStatus(callback: (status: StoreStatus) => void) {
  return onSnapshot(settingsDocRef, (snap) => {
    const data = snap.data();
    callback(data?.storeStatus ?? { isOpen: false, openedAt: null, openingCash: 0, closedAt: null });
  });
}

export async function openStore(openingCash: number): Promise<void> {
  await updateDoc(settingsDocRef, {
    'storeStatus.isOpen': true,
    'storeStatus.openedAt': Timestamp.now(),
    'storeStatus.openingCash': openingCash,
    'storeStatus.closedAt': null,
  });
}

export interface CloseStoreSummary {
  totalOrders: number;
  totalRevenue: number;
  cashTotal: number;
  cardTotal: number;
  openingCash: number;
  closingCash: number;
}

export async function getCloseStoreSummary(): Promise<CloseStoreSummary> {
  const statusSnap = await getDoc(settingsDocRef);
  const storeStatus = statusSnap.data()?.storeStatus as StoreStatus | undefined;
  const openingCash = storeStatus?.openingCash ?? 0;
  const openedAt = storeStatus?.openedAt;

  // Get today's orders (since store opened)
  let q = query(ordersRef, where('status', '!=', 'cancelled'));
  if (openedAt) {
    q = query(ordersRef, where('createdAt', '>=', openedAt));
  }

  const snap = await getDocs(q);
  let totalOrders = 0;
  let totalRevenue = 0;
  let cashTotal = 0;
  let cardTotal = 0;

  snap.forEach((doc) => {
    const order = doc.data();
    if (order.paymentStatus === 'paid') {
      totalOrders++;
      totalRevenue += order.total ?? 0;
      if (order.paymentMethod === 'cash') cashTotal += order.total ?? 0;
      if (order.paymentMethod === 'card') cardTotal += order.total ?? 0;
    }
  });

  return {
    totalOrders,
    totalRevenue,
    cashTotal,
    cardTotal,
    openingCash,
    closingCash: openingCash + cashTotal,
  };
}

export async function closeStore(summary: CloseStoreSummary, closedBy: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Save daily report
  const report: Omit<DailyReport, 'id'> = {
    date: today,
    openingCash: summary.openingCash,
    totalOrders: summary.totalOrders,
    totalRevenue: summary.totalRevenue,
    cashTotal: summary.cashTotal,
    cardTotal: summary.cardTotal,
    closingCash: summary.closingCash,
    closedBy,
  };
  await addDoc(dailyReportsRef, report);

  // Update store status
  await updateDoc(settingsDocRef, {
    'storeStatus.isOpen': false,
    'storeStatus.closedAt': Timestamp.now(),
  });
}
