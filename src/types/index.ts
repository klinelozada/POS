import type { Timestamp } from 'firebase/firestore';

export type StationType = 'prep' | 'kitchen';

export type OrderType = 'dine-in' | 'takeout';

export type PaymentMethod = 'cash' | 'card';

export type OrderStatus = 'new' | 'preparing' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid';

export type StationStatus = 'pending' | 'in-progress' | 'done';

export type UserRole = 'super_admin' | 'cashier' | 'prep_staff' | 'kitchen_staff';

export type PromoType = 'bogo' | 'discount' | 'bundle';

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  icon: string; // Material icon name
  image?: string; // Firebase Storage URL
  isActive: boolean;
  defaultStation: StationType;
  description?: string;
  parentId?: string; // Parent category ID for sub-categories
}

export interface MenuItemVariant {
  name: string;
  priceAdd: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  description?: string;
  photo?: string; // Firebase Storage URL
  variants: MenuItemVariant[];
  isAvailable: boolean;
  station: StationType;
  prepInstructions?: string; // HTML rich text
}

export interface AddOnItem {
  name: string;
  price: number;
}

export interface AddOnGroup {
  id: string;
  name: string;
  applicableCategories: string[]; // category IDs
  items: AddOnItem[];
}

export interface OrderItemAddOn {
  name: string;
  price: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number; // unit price including variant
  addOns: OrderItemAddOn[];
  station: StationType;
  isDone: boolean;
}

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  prepStatus: StationStatus;
  kitchenStatus: StationStatus;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface Promo {
  id: string;
  name: string;
  type: PromoType;
  conditions: Record<string, unknown>;
  isActive: boolean;
  categories: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  station?: string;
  pin?: string; // 4-digit PIN for station login
  isActive: boolean;
}

export interface CafeInfo {
  name: string;
  address: string;
  phone: string;
}

export interface StoreStatus {
  isOpen: boolean;
  openedAt: Timestamp | null;
  openingCash: number;
  closedAt: Timestamp | null;
}

export interface CafeLocation {
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface DailyReport {
  id: string;
  date: string; // 'YYYY-MM-DD'
  openingCash: number;
  totalOrders: number;
  totalRevenue: number;
  cashTotal: number;
  cardTotal: number;
  closingCash: number;
  closedBy: string;
}

export interface Settings {
  currentOrderNumber: number;
  cafeInfo: CafeInfo;
  stationRouting: Record<string, StationType>; // categoryId -> station
  storeStatus: StoreStatus;
  location: CafeLocation;
  adminPin?: string; // 4-digit PIN for non-admin order modifications
  kioskPin?: string; // 4-digit PIN to unlock in-store kiosk tablets
  prepPin?: string;  // 4-digit PIN for prep station access
  kitchenPin?: string; // 4-digit PIN for kitchen station access
  mobileOrderUrl?: string; // Custom URL for QR code (defaults to window.location.origin/m)
  requirePayFirst?: boolean; // If true, customers must pay before placing another order (default: true)
}

// Omit 'id' helper for creating new documents
export type CreateData<T> = Omit<T, 'id'>;
