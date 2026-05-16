import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasePath } from '../../hooks/useBasePath';
import { getCustomerOrderIds } from '../../utils/customerSession';
import { getOrder, subscribeToOrder } from '../../services/orderService';
import type { Order } from '../../types';
import styles from './PayFirst.module.css';

export default function PayFirst() {
  const navigate = useNavigate();
  const base = useBasePath();
  const [unpaidOrder, setUnpaidOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [justPaid, setJustPaid] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const justPaidRef = useRef(false);

  useEffect(() => {
    const ids = getCustomerOrderIds();
    if (ids.length === 0) {
      navigate(`${base}/welcome`, { replace: true });
      return;
    }

    Promise.all(ids.map((id) => getOrder(id).catch(() => null))).then((results) => {
      const valid = results.filter((o): o is Order => o !== null);
      const unpaid = valid.find(
        (o) => o.status !== 'completed' && (o.paymentStatus ?? 'unpaid') === 'unpaid'
      );

      if (!unpaid) {
        navigate(`${base}/welcome`, { replace: true });
        return;
      }

      setUnpaidOrder(unpaid);
      setLoading(false);
    });
  }, [navigate]);

  // Real-time listener: detect when order gets paid
  useEffect(() => {
    if (!unpaidOrder) return;

    const unsubscribe = subscribeToOrder(unpaidOrder.id, (order) => {
      if (!order) return;
      const isPaid = order.paymentStatus === 'paid' || order.status === 'completed';
      if (isPaid && !justPaidRef.current) {
        justPaidRef.current = true;
        setJustPaid(true);
      }
    });

    return () => unsubscribe();
  }, [unpaidOrder?.id]);

  // Countdown + redirect after payment detected
  useEffect(() => {
    if (!justPaid) return;
    if (countdown <= 0) {
      navigate(`${base}/welcome`, { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [justPaid, countdown, base, navigate]);

  if (loading || !unpaidOrder) return null;

  const formatItems = (order: Order) => {
    return order.items.map((item) => {
      const qty = item.quantity > 1 ? `${item.quantity}x ` : '1x ';
      const variant = item.variant ? ` (${item.variant})` : '';
      return `${qty}${item.name}${variant}`;
    });
  };

  if (justPaid) {
    return (
      <div className={styles.container}>
        <div className={styles.icon} style={{ color: '#4CAF50' }}>
          <span className="material-symbols-rounded">check_circle</span>
        </div>
        <div className={styles.title}>Payment Received!</div>
        <div className={styles.subtitle}>
          Thank you! Redirecting in {countdown}s...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <span className="material-symbols-rounded">receipt_long</span>
      </div>

      <div className={styles.title}>Pay First, Then Order</div>

      <div className={styles.subtitle}>
        You have an unpaid order that needs to be settled before placing a new one.
      </div>

      <div className={styles.orderCard}>
        <div className={styles.orderHeader}>
          <span className={styles.orderNumber}>
            #{String(unpaidOrder.orderNumber).padStart(3, '0')}
          </span>
          <span className={styles.badgeUnpaid}>Unpaid</span>
          <span className={styles.orderTotal}>
            {'\u20B1'}{unpaidOrder.total.toFixed(2)}
          </span>
        </div>
        <div className={styles.orderItems}>
          {formatItems(unpaidOrder).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      <div className={styles.payMessage}>Please pay at the counter</div>

      <div className={styles.hint}>
        Once this order is paid, you'll be able to place a new one.
      </div>

      <button
        className={styles.viewOrdersBtn}
        onClick={() => navigate(`${base}/my-orders`)}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 20 }}>receipt_long</span>
        View My Orders
      </button>

      <button
        className={styles.goToCounterLink}
        onClick={() => navigate(`${base}/my-orders`)}
      >
        Go to Counter to Pay
      </button>
    </div>
  );
}
