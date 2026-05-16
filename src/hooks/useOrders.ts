import { useState, useEffect } from 'react';
import { subscribeToOrders, type OrderFilters } from '../services/orderService';
import type { Order } from '../types';

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
}

export function useOrders(filters?: OrderFilters): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    }, filters);

    return unsubscribe;
    // Stringify filters for stable dependency comparison
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { orders, loading };
}
