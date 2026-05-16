import {
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  type Unsubscribe,
  type QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Order, CreateData, OrderStatus, StationStatus } from '../types';

const ordersRef = collection(db, 'orders');
const settingsDocRef = doc(db, 'settings', 'global');

export interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
  prepStatus?: StationStatus;
  kitchenStatus?: StationStatus;
}

/**
 * Create a new order with auto-incrementing order number.
 * Uses a single transaction for both order number increment and order creation
 * to minimize network round trips.
 */
export async function createOrder(
  data: Omit<CreateData<Order>, 'orderNumber' | 'createdAt'>
): Promise<string> {
  // Pre-generate the document ID so we can use set() inside the transaction
  const newOrderRef = doc(ordersRef);

  await runTransaction(db, async (transaction) => {
    const settingsSnap = await transaction.get(settingsDocRef);

    let currentNumber = 0;
    if (settingsSnap.exists()) {
      currentNumber = settingsSnap.data().currentOrderNumber ?? 0;
    }

    const nextNumber = currentNumber + 1;
    transaction.update(settingsDocRef, { currentOrderNumber: nextNumber });
    transaction.set(newOrderRef, {
      ...data,
      orderNumber: nextNumber,
      createdAt: serverTimestamp(),
    });
  });

  return newOrderRef.id;
}

/**
 * Update order fields.
 */
export async function updateOrder(id: string, data: Partial<Order>): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, data);
}

/**
 * Mark an order item as done. Checks if all items for the relevant station are
 * completed and updates station status accordingly.
 */
export async function updateOrderItemStatus(
  orderId: string,
  itemIndex: number,
  isDone: boolean
): Promise<void> {
  const docRef = doc(db, 'orders', orderId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error(`Order ${orderId} not found`);
  }

  const order = { id: snapshot.id, ...snapshot.data() } as Order;
  const items = [...order.items];

  if (itemIndex < 0 || itemIndex >= items.length) {
    throw new Error(`Item index ${itemIndex} out of range`);
  }

  items[itemIndex] = { ...items[itemIndex], isDone };

  const station = items[itemIndex].station;

  // Check if all items for this station are done
  const stationItems = items.filter((item) => item.station === station);
  const allStationDone = stationItems.every((item) => item.isDone);
  const anyStationStarted = stationItems.some((item) => item.isDone);

  const stationStatusField = station === 'prep' ? 'prepStatus' : 'kitchenStatus';
  let stationStatus: StationStatus = 'pending';
  if (allStationDone) {
    stationStatus = 'done';
  } else if (anyStationStarted) {
    stationStatus = 'in-progress';
  }

  const allDone = items.every((item) => item.isDone);

  const updateData: Partial<Order> = {
    items,
    [stationStatusField]: stationStatus,
  };

  // Auto-complete only if all items done AND already paid
  if (allDone && order.paymentStatus === 'paid') {
    updateData.status = 'completed';
  } else if (anyStationStarted || stationStatus === 'in-progress' || stationStatus === 'done') {
    updateData.status = 'preparing';
  }

  await updateDoc(docRef, updateData);
}

/**
 * Subscribe to real-time order updates with optional filters.
 * Returns an unsubscribe function.
 */
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  filters?: OrderFilters
): Unsubscribe {
  const constraints: QueryConstraint[] = [];

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      constraints.push(where('status', 'in', filters.status));
    } else {
      constraints.push(where('status', '==', filters.status));
    }
  }

  if (filters?.prepStatus) {
    constraints.push(where('prepStatus', '==', filters.prepStatus));
  }

  if (filters?.kitchenStatus) {
    constraints.push(where('kitchenStatus', '==', filters.kitchenStatus));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  const q = query(ordersRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Order)
      );
      callback(orders);
    },
    (error) => {
      console.error('Error subscribing to orders:', error);
      // If index error, log the URL from the error message
      if (error.message?.includes('index')) {
        console.error('Firestore index required. Check the error above for the creation link.');
      }
      callback([]);
    }
  );
}

/**
 * Subscribe to real-time updates for a single order.
 * Returns an unsubscribe function.
 */
export function subscribeToOrder(
  orderId: string,
  callback: (order: Order | null) => void
): Unsubscribe {
  const docRef = doc(ordersRef, orderId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Order);
    } else {
      callback(null);
    }
  });
}

/**
 * Get a single order by ID.
 */
export async function getOrder(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, 'orders', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}
