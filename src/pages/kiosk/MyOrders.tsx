import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasePath } from '../../hooks/useBasePath';
import { getCustomerOrderIds } from '../../utils/customerSession';
import { getOrder } from '../../services/orderService';
import type { Order } from '../../types';
import styles from './MyOrders.module.css';

export default function MyOrders() {
  const navigate = useNavigate();
  const base = useBasePath();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getCustomerOrderIds();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(ids.map((id) => getOrder(id))).then((results) => {
      const valid = results.filter((o): o is Order => o !== null);
      // Sort by createdAt desc
      valid.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      setOrders(valid);
      setLoading(false);
    });
  }, []);

  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const hasUnpaid = activeOrders.some(
    (o) => (o.paymentStatus ?? 'unpaid') === 'unpaid'
  );

  const handleNewOrder = () => {
    if (hasUnpaid) {
      navigate(`${base}/pay-first`);
    } else {
      navigate(`${base}/welcome`);
    }
  };

  const formatTime = (order: Order) => {
    if (!order.createdAt?.toDate) return '';
    const d = order.createdAt.toDate();
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatItems = (order: Order) => {
    return order.items
      .map((item) => {
        const qty = item.quantity > 1 ? `${item.quantity}x ` : '1x ';
        const variant = item.variant ? ` (${item.variant})` : '';
        return `${qty}${item.name}${variant}`;
      })
      .join('\n');
  };

  const getStatusLabel = (order: Order) => {
    const allDone = order.items.every((i) => i.isDone);
    if (order.status === 'completed') return 'done';
    if (allDone) return 'done';
    if (order.status === 'preparing') return 'preparing';
    return 'preparing';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div>Loading orders...</div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
          <span className={styles.headerTitle}>My Orders</span>
        </div>
        <div className={styles.empty}>
          <span className={`${styles.emptyIcon} material-symbols-rounded`}>receipt_long</span>
          <div className={styles.emptyText}>No orders yet</div>
          <button className={styles.startOrderBtn} onClick={() => navigate(`${base}/welcome`)}>
            Start Ordering
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <span className={styles.headerTitle}>My Orders</span>
        <button className={styles.newOrderBtn} onClick={handleNewOrder}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
          New Order
        </button>
      </div>

      <div className={styles.body}>
        {activeOrders.length > 0 && (
          <div className={styles.sectionGroup}>
            <div className={styles.sectionLabel}>Active</div>
            {activeOrders.map((order) => {
              const status = getStatusLabel(order);
              const payStatus = (order.paymentStatus ?? 'unpaid') as string;
              return (
                <div key={order.id} className={`${styles.orderCard} ${styles.orderCardActive}`}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderNumber}>
                      #{String(order.orderNumber).padStart(3, '0')}
                    </span>
                    <span className={payStatus === 'paid' ? styles.badgePaid : styles.badgeUnpaid}>
                      {payStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className={status === 'preparing' ? styles.statusPreparing : styles.statusDone}>
                      {status === 'preparing' ? 'Preparing' : 'Done'}
                    </span>
                  </div>
                  <div className={styles.orderItems}>
                    {formatItems(order)}
                  </div>
                  <div className={styles.orderFooter}>
                    <span className={styles.orderTotal}>
                      {'\u20B1'}{order.total.toFixed(2)}
                    </span>
                    <span className={styles.orderMeta}>
                      {formatTime(order)} · {order.type === 'dine-in' ? 'Dine In' : 'Take Out'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {completedOrders.length > 0 && (
          <div className={styles.sectionGroup}>
            <div className={styles.sectionLabel}>Completed</div>
            {completedOrders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderNumber}>
                    #{String(order.orderNumber).padStart(3, '0')}
                  </span>
                  <span className={styles.badgePaid}>Paid</span>
                  <span className={styles.statusDone}>Done</span>
                </div>
                <div className={styles.orderItems}>
                  {formatItems(order)}
                </div>
                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>
                    {'\u20B1'}{order.total.toFixed(2)}
                  </span>
                  <span className={styles.orderMeta}>
                    {formatTime(order)} · {order.type === 'dine-in' ? 'Dine In' : 'Take Out'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
