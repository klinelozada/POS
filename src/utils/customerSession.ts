/**
 * Tracks customer order IDs so we can:
 * 1. Show "My Orders" for the current session
 * 2. Block new orders when an unpaid order exists
 *
 * Uses localStorage with daily reset at midnight PH time (Asia/Manila).
 * This allows mobile customers to return to their orders within the same day.
 */

const STORAGE_KEY = 'customerOrderIds';
const DATE_KEY = 'customerSessionDate';

function getPhDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

function checkDailyReset(): void {
  const storedDate = localStorage.getItem(DATE_KEY);
  const today = getPhDate();
  if (storedDate !== today) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(DATE_KEY, today);
  }
}

export function getCustomerOrderIds(): string[] {
  checkDailyReset();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function addCustomerOrderId(orderId: string): void {
  checkDailyReset();
  const ids = getCustomerOrderIds();
  if (!ids.includes(orderId)) {
    ids.push(orderId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

export function clearCustomerOrders(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DATE_KEY);
}
