import type { Timestamp } from 'firebase/firestore';

export type StationType = 'prep' | 'kitchen';

export type OrderType = 'dine-in' | 'takeout';

export type PaymentMethod = 'cash' | 'card' | 'gcash' | 'instapay';

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

export interface VariantGroup {
  label: string;
  options: string[];
}

export type BuildDiagramStyle = 'cup' | 'tapered';

export interface BuildLayer {
  label: string;
  color: string; // hex color for the band
  size?: number; // relative band height (default 1)
  dots?: boolean; // draw "nata pearl" dots across the band
}

// Visual layered-cup build guide shown in the prep/kitchen station.
// Mirrors the official Joe Street "Visual Staff Build Guide" diagrams.
export interface BuildDiagram {
  style: BuildDiagramStyle; // 'cup' = straight cup, 'tapered' = fizz-style cup with side callouts
  layers: BuildLayer[]; // ordered top → bottom
  hot?: boolean; // draws steam lines (cup style only)
  notes?: string[]; // short bullet reminders (e.g. "Do not fully stir")
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  description?: string;
  photo?: string; // Firebase Storage URL
  variants: MenuItemVariant[];
  variantGroups?: VariantGroup[]; // multi-dimensional variants (e.g., Size + Flavor)
  priceMatrix?: Record<string, number>; // "Solo|Regular" → 35
  isAvailable: boolean;
  station: StationType;
  prepInstructions?: string; // HTML rich text
  buildDiagram?: BuildDiagram; // visual layered-cup build guide
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
  promoId?: string; // links this item to a promo
  promoName?: string; // e.g. "B1T1 Mango Cloud"
  isFreeItem?: boolean; // true for the free item in BOGO
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
  referenceNumber?: string; // For digital payments (GCash/Instapay)
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface Promo {
  id: string;
  name: string;
  type: PromoType;
  description?: string;
  poster?: string; // base64 data URL or image URL
  promoPrice: number; // override price for the promo (e.g. ₱69 for B1T1)
  mainItemId: string; // The "Buy 1" item (always included)
  takeItemIds: string[]; // The "Take 1" options (customer picks one)
  eligibleItems: string[]; // All eligible item IDs (mainItemId + takeItemIds combined)
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  isActive: boolean;
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
  gcashQrUrl?: string; // Firebase Storage URL for GCash QR code image
  instapayQrUrl?: string; // Firebase Storage URL for Instapay QR code image
  enabledPaymentMethods?: PaymentMethod[]; // Which payment methods are active (default: all)
}

// Omit 'id' helper for creating new documents
export type CreateData<T> = Omit<T, 'id'>;
