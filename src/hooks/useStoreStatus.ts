import { useState, useEffect } from 'react';
import { subscribeToStoreStatus } from '../services/storeService';
import type { StoreStatus } from '../types';

export function useStoreStatus(): StoreStatus | null {
  const [status, setStatus] = useState<StoreStatus | null>(null);

  useEffect(() => {
    const unsub = subscribeToStoreStatus(setStatus);
    return unsub;
  }, []);

  return status;
}
