import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useBasePath } from '../../hooks/useBasePath';
import { getCustomerOrderIds } from '../../utils/customerSession';
import { getOrder } from '../../services/orderService';
import { getSettings } from '../../services/adminService';
import type { OrderType } from '../../types';
import styles from './Welcome.module.css';

export default function Welcome() {
  const navigate = useNavigate();
  const base = useBasePath();
  const setOrderType = useCartStore((s) => s.setOrderType);
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const isMobile = base === '/m';

  useEffect(() => {
    setChecking(true);

    const ids = getCustomerOrderIds();
    if (ids.length === 0) {
      setChecking(false);
      setActiveCount(0);
      return;
    }

    Promise.all([
      getSettings().catch(() => null),
      Promise.all(ids.map((id) => getOrder(id).catch(() => null))),
    ])
      .then(([settings, results]) => {
        const validOrders = results.filter((o) => o !== null);
        const active = validOrders.filter(
          (o) => o!.status !== 'completed' && o!.status !== 'cancelled'
        );
        setActiveCount(active.length);

        if (settings && settings.requirePayFirst === false) {
          setChecking(false);
          return;
        }

        const hasUnpaid = results.some(
          (o) => o && o.status !== 'completed' && (o.paymentStatus ?? 'unpaid') === 'unpaid'
        );
        if (hasUnpaid) {
          navigate(`${base}/pay-first`, { replace: true });
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        setChecking(false);
      });
  }, [location.key]);

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

      {/* My Orders - mobile only */}
      {isMobile && (
        <div className={styles.myOrdersSection}>
          <div className={styles.divider} />
          <button className={styles.myOrdersBtn} onClick={() => navigate(`${base}/my-orders`)}>
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>receipt_long</span>
            My Orders
            {activeCount > 0 && (
              <span className={styles.orderBadge}>{activeCount}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
