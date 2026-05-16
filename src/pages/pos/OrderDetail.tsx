import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrder, updateOrder } from '../../services/orderService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getMenuItemImage } from '../../utils/menuImages';
import type { Order } from '../../types';
import styles from './OrderDetail.module.css';

function formatTime(timestamp: { toDate?: () => Date } | null | undefined): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '--:--';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrder(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  const handleProcessPayment = async () => {
    if (!order) return;
    await updateOrder(order.id, { status: 'preparing' });
    // Refresh
    const updated = await getOrder(order.id);
    setOrder(updated);
  };

  const handleMarkComplete = async () => {
    if (!order) return;
    await updateOrder(order.id, { status: 'completed' });
    navigate('/pos/dashboard');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}><LoadingSpinner /></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate('/pos/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
          </button>
          <span className={styles.pageTitle}>Order Not Found</span>
        </div>
      </div>
    );
  }

  const statusClass = order.status === 'new' ? styles.statusNew
    : order.status === 'preparing' ? styles.statusPreparing
    : styles.statusCompleted;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/pos/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
        </button>
        <span className={styles.pageTitle}>Order #{String(order.orderNumber).padStart(3, '0')}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.orderHeader}>
            <span className={styles.orderNum}>#{String(order.orderNumber).padStart(3, '0')}</span>
            <span className={styles.typeBadge}>{order.type}</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--color-foreground-muted)' }}>
              {formatTime(order.createdAt)}
            </span>
          </div>
          {order.items.map((item, index) => {
            const lineTotal = item.price * item.quantity;
            return (
              <div key={index} className={styles.itemRow}>
                <div className={styles.itemPhoto}>
                  {getMenuItemImage(item.name) ? (
                    <img src={getMenuItemImage(item.name)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                  ) : '\u2615'}
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  {item.variant && <div className={styles.itemVariant}>{item.variant}</div>}
                </div>
                <div className={styles.itemQty}>x{item.quantity}</div>
                <div className={styles.itemPrice}>{'\u20B1'}{lineTotal.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.right}>
          <div className={styles.summaryLabel}>Order Summary</div>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{'\u20B1'}{order.total.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>{'\u20B1'}{order.total.toFixed(2)}</span>
          </div>
          <div className={styles.summaryLabel}>Status</div>
          <div className={styles.statusRow}>
            <span className={`${styles.statusDot} ${statusClass}`} />
            <span className={styles.statusText}>{order.status}</span>
          </div>
          <div className={styles.summaryLabel}>Payment</div>
          <div className={styles.paymentRow}>
            {order.paymentMethod ?? 'Not set'}
          </div>
          <div className={styles.actionSpacer} />
          {order.status === 'new' && (
            <button className={styles.actionBtnPrimary} onClick={handleProcessPayment}>
              Process Payment
            </button>
          )}
          {order.status === 'preparing' && (
            <button className={styles.actionBtnSuccess} onClick={handleMarkComplete}>
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
