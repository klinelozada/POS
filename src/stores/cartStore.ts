import { create } from 'zustand';
import type { OrderType, OrderItemAddOn } from '../types';

export interface CartItem {
  menuItemId: string;
  name: string;
  variant: string;
  quantity: number;
  price: number; // unit price including variant
  addOns: OrderItemAddOn[];
  station: 'prep' | 'kitchen';
  promoId?: string;
  promoName?: string;
  isFreeItem?: boolean;
}

interface CartState {
  orderType: OrderType;
  items: CartItem[];
  setOrderType: (type: OrderType) => void;
  addItem: (item: CartItem) => void;
  addPromoItems: (items: CartItem[]) => void;
  removeItem: (index: number) => void;
  removePromoGroup: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  orderType: 'dine-in',
  items: [],

  setOrderType: (type: OrderType) => set({ orderType: type }),

  addItem: (item: CartItem) =>
    set((state) => {
      // Promo items never merge — always add as new entries
      if (item.promoId) {
        return { items: [...state.items, item] };
      }

      // Check if same item with same variant and addOns already exists
      const existingIndex = state.items.findIndex(
        (existing) =>
          !existing.promoId &&
          existing.menuItemId === item.menuItemId &&
          existing.variant === item.variant &&
          JSON.stringify(existing.addOns) === JSON.stringify(item.addOns)
      );

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + item.quantity,
        };
        return { items: newItems };
      }

      return { items: [...state.items, item] };
    }),

  addPromoItems: (items: CartItem[]) =>
    set((state) => ({ items: [...state.items, ...items] })),

  removeItem: (index: number) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),

  // Remove a promo item and its paired free item (same promoId, added consecutively)
  removePromoGroup: (index: number) =>
    set((state) => {
      const item = state.items[index];
      if (!item?.promoId) return { items: state.items.filter((_, i) => i !== index) };
      // Remove both the promo item and its free pair
      const promoId = item.promoId;
      let found = 0;
      return {
        items: state.items.filter((it) => {
          if (it.promoId === promoId && found < 2) {
            found++;
            return false;
          }
          return true;
        }),
      };
    }),

  updateQuantity: (index: number, quantity: number) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((_, i) => i !== index) };
      }
      const newItems = [...state.items];
      newItems[index] = { ...newItems[index], quantity };
      return { items: newItems };
    }),

  clearCart: () => set({ items: [], orderType: 'dine-in' }),

  total: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const addOnsTotal = item.addOns.reduce((a, addon) => a + addon.price, 0);
      return sum + (item.price + addOnsTotal) * item.quantity;
    }, 0);
  },
}));
