import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCloseStoreSummary, getStoreStatus, closeStore, type CloseStoreSummary } from '../../services/storeService';
import { useOrders } from '../../hooks';
import { useAuth } from '../../hooks';
import type { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './CloseStore.module.css';

export default function CloseStore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders } = useOrders();
  const [summary, setSummary] = useState<CloseStoreSummary | null>(null);
  const [openedAt, setOpenedAt] = useState<Timestamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    Promise.all([getCloseStoreSummary(), getStoreStatus()]).then(([s, status]) => {
      setSummary(s);
      setOpenedAt(status.openedAt);
      setLoading(false);
    });
  }, []);

  // Only show orders from the current session (since store opened)
  const sessionOrders = orders.filter((o) => {
    if (o.paymentStatus !== 'paid') return false;
    if (!openedAt || !o.createdAt) return false;
    return o.createdAt.toMillis() >= openedAt.toMillis();
  });

  const recentOrders = sessionOrders.slice(0, 20);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = async () => {
    if (!summary || !user) return;
    setClosing(true);
    try {
      await closeStore(summary, user.uid);
      localStorage.removeItem('posLastRoute');
      toast.success('Store closed. Daily report saved.');
      navigate('/pos/login', { replace: true });
    } catch {
      toast.error('Failed to close store');
    } finally {
      setClosing(false);
    }
  };

  if (loading || !summary) {
    return <div className={styles.container}><div className={styles.loading}>Loading summary...</div></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <div className={styles.headerCenter}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Store Open</span>
        </div>
        <button className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
      </header>

      <div className={styles.body}>
        <div className={styles.leftCol}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Close Store</h1>
            <p className={styles.subtitle}>Review today's transactions before closing.</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Orders</span>
              <span className={styles.statValue}>{summary.totalOrders}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Revenue</span>
              <span className={`${styles.statValue} ${styles.accent}`}>₱{summary.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Cash Payments</span>
              <span className={styles.statValue}>₱{summary.cashTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Card Payments</span>
              <span className={styles.statValue}>₱{summary.cardTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className={styles.cashSummary}>
            <h3 className={styles.cashTitle}>Cash Drawer Summary</h3>
            <div className={styles.cashRow}>
              <span>Opening Cash</span>
              <span>₱{summary.openingCash.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.cashRow}>
              <span>+ Cash Sales</span>
              <span className={styles.cashPositive}>₱{summary.cashTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.cashDivider} />
            <div className={`${styles.cashRow} ${styles.cashTotal}`}>
              <span>Expected in Drawer</span>
              <span className={styles.accent}>₱{summary.closingCash.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <h3 className={styles.recentTitle}>Recent Orders</h3>
          <div className={styles.orderTable}>
            <div className={styles.tableHeader}>
              <span>Order #</span>
              <span>Type</span>
              <span>Payment</span>
              <span>Amount</span>
            </div>
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.tableRow}>
                <span className={styles.orderNum}>#{String(order.orderNumber).padStart(3, '0')}</span>
                <span>{order.type}</span>
                <span>{order.paymentMethod ?? '-'}</span>
                <span className={styles.orderAmount}>₱{order.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className={styles.emptyRow}>No paid orders today</div>
            )}
          </div>

          <div className={styles.btnRow}>
            <button className={styles.printBtn} onClick={handlePrint}>
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>print</span>
              Print Report
            </button>
            <button className={styles.closeBtn} onClick={handleClose} disabled={closing}>
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>lock</span>
              {closing ? 'Closing...' : 'Close Store'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
