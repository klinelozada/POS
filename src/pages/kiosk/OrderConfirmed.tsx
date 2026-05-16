import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasePath } from '../../hooks/useBasePath';
import { getOrder } from '../../services/orderService';
import styles from './OrderConfirmed.module.css';

interface LastOrderInfo {
  id: string;
  total: number;
  paymentMethod: 'cash' | 'card';
}

export default function OrderConfirmed() {
  const navigate = useNavigate();
  const base = useBasePath();
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [lastOrder, setLastOrder] = useState<LastOrderInfo | null>(null);
  const [countdown, setCountdown] = useState(10);

  const goToIntro = useCallback(() => {
    sessionStorage.removeItem('lastOrder');
    navigate(base);
  }, [navigate, base]);

  useEffect(() => {
    const stored = sessionStorage.getItem('lastOrder');
    if (!stored) {
      navigate(base);
      return;
    }

    const info = JSON.parse(stored) as LastOrderInfo;
    setLastOrder(info);

    // Fetch order number
    getOrder(info.id).then((order) => {
      if (order) {
        setOrderNumber(order.orderNumber);
      }
    });
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          goToIntro();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [goToIntro]);

  if (!lastOrder) return null;

  const paymentLabel = lastOrder.paymentMethod === 'cash'
    ? `Cash \u2014 Pay \u20B1${lastOrder.total.toFixed(2)} at counter`
    : `Card \u2014 \u20B1${lastOrder.total.toFixed(2)}`;

  return (
    <div className={styles.container}>
      <div className={styles.checkmark}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className={styles.title}>Order Placed!</div>
      <div className={styles.subtitle}>Your order number is</div>
      <div className={styles.orderNumber}>
        #{orderNumber !== null ? String(orderNumber).padStart(3, '0') : '---'}
      </div>
      <div className={styles.waitMessage}>
        Please wait for your number to be called
      </div>
      <div className={styles.paymentBadge}>{paymentLabel}</div>
      <button className={styles.doneBtn} onClick={goToIntro}>
        Done
      </button>
      <button
        className={styles.myOrdersLink}
        onClick={() => {
          sessionStorage.removeItem('lastOrder');
          navigate(`${base}/my-orders`);
        }}
      >
        View My Orders
      </button>
      <div className={styles.countdown}>
        Returning to home in {countdown}s
      </div>
    </div>
  );
}
