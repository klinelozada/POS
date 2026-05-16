import { useState, useEffect, type ReactNode } from 'react';
import { subscribeToStoreStatus } from '../../services/storeService';
import type { StoreStatus } from '../../types';
import StoreClosed from './StoreClosed';
import { LoadingSpinner } from '../../components';

interface StoreGateProps {
  children: ReactNode;
}

export default function StoreGate({ children }: StoreGateProps) {
  const [status, setStatus] = useState<StoreStatus | null>(null);

  useEffect(() => {
    const unsub = subscribeToStoreStatus(setStatus);
    return unsub;
  }, []);

  if (status === null) return <LoadingSpinner />;
  if (!status.isOpen) return <StoreClosed />;

  return <>{children}</>;
}
