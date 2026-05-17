import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasePath } from '../../hooks/useBasePath';
import { getCustomerOrderIds } from '../../utils/customerSession';
import { subscribeToOrder } from '../../services/orderService';
import type { Order } from '../../types';
import styles from './MyOrders.module.css';

export default function MyOrders() {
  const navigate = useNavigate();
  const base = useBasePath();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const ids = getCustomerOrderIds();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    // Subscribe to all customer orders in real-time
    const unsubscribes = ids.map((id) =>
      subscribeToOrder(id, (order) => {
        setOrders((prev) => {
          if (!order) return prev.filter((o) => o.id !== id);
          const idx = prev.findIndex((o) => o.id === id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = order;
            return next;
          }
          return [...prev, order];
        });
        setLoading(false);
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  const sortedOrders = [...orders].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });

  const activeOrders = sortedOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = sortedOrders.filter((o) => o.status === 'completed');

  const selectedOrder = selectedOrderId ? orders.find((o) => o.id === selectedOrderId) : null;

  const formatTime = (order: Order) => {
    if (!order.createdAt?.toDate) return '';
    return order.createdAt.toDate().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getOrderStatus = (order: Order) => {
    const allDone = order.items.every((i) => i.isDone);
    if (order.status === 'completed' || allDone) return 'ready';
    if (order.items.some((i) => i.isDone)) return 'preparing';
    return 'preparing';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'ready') return 'Ready for Pickup';
    return 'Preparing';
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

  // Order detail view
  if (selectedOrder) {
    const status = getOrderStatus(selectedOrder);
    const doneCount = selectedOrder.items.filter((i) => i.isDone).length;
    const totalItems = selectedOrder.items.length;

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => setSelectedOrderId(null)}>
            <span className="material-symbols-rounded" style={{ fontSize: 22 }}>arrow_back</span>
          </button>
          <span className={styles.headerTitle}>
            Order #{String(selectedOrder.orderNumber).padStart(3, '0')}
          </span>
        </div>

        <div className={styles.body}>
          {status === 'ready' && (
            <div className={styles.readyBanner}>
              <span className="material-symbols-rounded" style={{ fontSize: 32 }}>check_circle</span>
              <div className={styles.readyText}>Ready for Pickup!</div>
            </div>
          )}

          <div className={styles.detailMeta}>
            <div className={styles.detailMetaRow}>
              <span>Status</span>
              <span className={status === 'ready' ? styles.statusDone : styles.statusPreparing}>
                {getStatusLabel(status)}
              </span>
            </div>
            <div className={styles.detailMetaRow}>
              <span>Payment</span>
              <span className={selectedOrder.paymentStatus === 'paid' ? styles.badgePaid : styles.badgeUnpaid}>
                {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <div className={styles.detailMetaRow}>
              <span>Progress</span>
              <span className={styles.progressText}>{doneCount}/{totalItems} items done</span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(doneCount / totalItems) * 100}%` }}
            />
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsSectionLabel}>Items</div>
            {selectedOrder.items.map((item, i) => (
              <div key={i} className={`${styles.detailItem} ${item.isDone ? styles.detailItemDone : ''}`}>
                <div className={styles.detailItemCheck}>
                  {item.isDone ? (
                    <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#1A8A4A' }}>check_circle</span>
                  ) : (
                    <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#ccc' }}>radio_button_unchecked</span>
                  )}
                </div>
                <div className={styles.detailItemInfo}>
                  <div className={styles.detailItemName}>
                    {item.quantity > 1 && <span>{item.quantity}x </span>}
                    {item.name}
                    {item.isFreeItem && (
                      <span className={styles.freeTag}>FREE</span>
                    )}
                  </div>
                  {item.variant && (
                    <div className={styles.detailItemVariant}>{item.variant}</div>
                  )}
                </div>
                <div className={styles.detailItemStatus}>
                  {item.isDone ? 'Done' : 'Preparing'}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.detailFooter}>
            <div className={styles.detailFooterRow}>
              <span>Total</span>
              <span className={styles.detailTotal}>{'\u20B1'}{selectedOrder.total.toFixed(2)}</span>
            </div>
            <div className={styles.detailFooterMeta}>
              {formatTime(selectedOrder)} · {selectedOrder.type === 'dine-in' ? 'Dine In' : 'Take Out'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Orders list view
  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(`${base}`)}>
            <span className="material-symbols-rounded" style={{ fontSize: 22 }}>arrow_back</span>
          </button>
          <span className={styles.headerTitle}>My Orders</span>
        </div>
        <div className={styles.empty}>
          <span className={`${styles.emptyIcon} material-symbols-rounded`}>receipt_long</span>
          <div className={styles.emptyText}>No orders yet</div>
          <button className={styles.startOrderBtn} onClick={() => navigate(`${base}`)}>
            Start Ordering
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`${base}`)}>
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <span className={styles.headerTitle}>My Orders</span>
      </div>

      <div className={styles.body}>
        {activeOrders.length > 0 && (
          <div className={styles.sectionGroup}>
            <div className={styles.sectionLabel}>Active</div>
            {activeOrders.map((order) => {
              const status = getOrderStatus(order);
              const doneCount = order.items.filter((i) => i.isDone).length;
              const totalItems = order.items.length;
              return (
                <div
                  key={order.id}
                  className={`${styles.orderCard} ${styles.orderCardActive}`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div className={styles.orderHeader}>
                    <span className={styles.orderNumber}>
                      #{String(order.orderNumber).padStart(3, '0')}
                    </span>
                    <span className={order.paymentStatus === 'paid' ? styles.badgePaid : styles.badgeUnpaid}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className={status === 'ready' ? styles.statusDone : styles.statusPreparing}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <div className={styles.orderProgress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${(doneCount / totalItems) * 100}%` }} />
                    </div>
                    <span className={styles.progressLabel}>{doneCount}/{totalItems}</span>
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
              <div
                key={order.id}
                className={styles.orderCard}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className={styles.orderHeader}>
                  <span className={styles.orderNumber}>
                    #{String(order.orderNumber).padStart(3, '0')}
                  </span>
                  <span className={styles.badgePaid}>Paid</span>
                  <span className={styles.statusDone}>Ready for Pickup</span>
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
