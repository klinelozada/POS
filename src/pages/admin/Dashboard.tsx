import { useState, useEffect } from 'react';
import { getDashboardStats, getPromos } from '../../services/adminService';
import type { DashboardStats } from '../../services/adminService';
import { useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../../components/StatusBadge';
import type { Promo } from '../../types';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [promoCount, setPromoCount] = useState(0);
  const { orders } = useOrders();

  useEffect(() => {
    const load = async () => {
      const [dashStats, promos] = await Promise.all([
        getDashboardStats(),
        getPromos(),
      ]);
      setStats(dashStats);
      setPromoCount(promos.filter((p: Promo) => p.isActive).length);
    };
    load();
  }, []);

  const recentOrders = orders.slice(0, 10);
  const popularItem = stats?.popularItems[0]?.name ?? '--';

  const formatTime = (timestamp: { toDate?: () => Date }) => {
    if (!timestamp?.toDate) return '--';
    const d = timestamp.toDate();
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={`material-icons ${styles.statIcon}`}>receipt_long</span>
          <div className={styles.statValue}>{stats?.todayOrderCount ?? 0}</div>
          <div className={styles.statLabel}>Today's Orders</div>
        </div>
        <div className={styles.statCard}>
          <span className={`material-icons ${styles.statIcon}`}>attach_money</span>
          <div className={styles.statValue}>
            ${(stats?.todayRevenue ?? 0).toFixed(2)}
          </div>
          <div className={styles.statLabel}>Revenue</div>
        </div>
        <div className={styles.statCard}>
          <span className={`material-icons ${styles.statIcon}`}>star</span>
          <div className={styles.statValue}>{popularItem}</div>
          <div className={styles.statLabel}>Popular Item</div>
        </div>
        <div className={styles.statCard}>
          <span className={`material-icons ${styles.statIcon}`}>local_offer</span>
          <div className={styles.statValue}>{promoCount}</div>
          <div className={styles.statLabel}>Active Promos</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className={styles.emptyState}>No orders yet today.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.orderNumber}</td>
                  <td>{order.type}</td>
                  <td>{order.items?.length ?? 0}</td>
                  <td>${order.total?.toFixed(2)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>{formatTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
