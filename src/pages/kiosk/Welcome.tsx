import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useBasePath } from '../../hooks/useBasePath';
import { getCustomerOrderIds } from '../../utils/customerSession';
import { getOrder } from '../../services/orderService';
import type { OrderType } from '../../types';
import styles from './Welcome.module.css';

export default function Welcome() {
  const navigate = useNavigate();
  const base = useBasePath();
  const setOrderType = useCartStore((s) => s.setOrderType);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const ids = getCustomerOrderIds();
    if (ids.length === 0) {
      setChecking(false);
      return;
    }

    // Check if any unpaid active orders exist
    Promise.all(ids.map((id) => getOrder(id))).then((results) => {
      const hasUnpaid = results.some(
        (o) => o && o.status !== 'completed' && (o.paymentStatus ?? 'unpaid') === 'unpaid'
      );
      if (hasUnpaid) {
        navigate(`${base}/pay-first`, { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  const handleSelect = (type: OrderType) => {
    setOrderType(type);
    navigate(`${base}/menu`);
  };

  if (checking) return null;

  return (
    <div className={styles.container}>
      <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
      <div className={styles.subtitle}>A place you can come back to.</div>
      <div className={styles.prompt}>How would you like to order?</div>
      <div className={styles.cards}>
        <div className={styles.card} onClick={() => handleSelect('dine-in')}>
          <span className={`${styles.cardIcon} material-symbols-rounded`}>restaurant</span>
          <div className={styles.cardTitle}>Dine In</div>
          <div className={styles.cardSubtitle}>Eat here at the cafe</div>
        </div>
        <div className={styles.card} onClick={() => handleSelect('takeout')}>
          <span className={`${styles.cardIcon} material-symbols-rounded`}>shopping_bag</span>
          <div className={styles.cardTitle}>Take Out</div>
          <div className={styles.cardSubtitle}>Pack it to go</div>
        </div>
      </div>
    </div>
  );
}
