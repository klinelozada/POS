import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import type { Order } from '../../types';
import styles from './Dashboard.module.css';

function formatTime(timestamp: { toDate?: () => Date } | null | undefined): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '--:--';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getItemsSummary(order: Order): string {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const names = order.items.slice(0, 2).map((item) => item.name);
  const suffix = order.items.length > 2 ? ` +${order.items.length - 2}` : '';
  return `${totalItems} items: ${names.join(', ')}${suffix}`;
}

export default function PosDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { orders } = useOrders();

  const newOrders = orders.filter((o) => o.status === 'new');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  const handleLogout = async () => {
    await logout();
    navigate('/pos/login');
  };

  const renderOrderCard = (order: Order) => (
    <div
      key={order.id}
      className={styles.orderCard}
      onClick={() => navigate(`/pos/order/${order.id}`)}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardOrderNum}>#{String(order.orderNumber).padStart(3, '0')}</span>
        <span className={styles.cardTime}>{formatTime(order.createdAt)}</span>
      </div>
      <div className={styles.cardType}>{order.type}</div>
      <div className={styles.cardItems}>{getItemsSummary(order)}</div>
      <div className={styles.cardFooter}>
        <span className={styles.cardTotal}>{'\u20B1'}{order.total.toFixed(2)}</span>
        <span className={styles.cardPayment}>{order.paymentMethod ?? 'pending'}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.topNav}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <div className={styles.navLinks}>
          <button className={styles.navLinkActive}>Dashboard</button>
          <button className={styles.navLink}>Orders</button>
        </div>
        <span className={styles.navSpacer} />
        <button className={styles.notifBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
        <div className={styles.userAvatar} onClick={handleLogout} title="Click to logout">
          {userInitial}
        </div>
      </div>
      <div className={styles.kanban}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>New</span>
            <span className={styles.columnCount}>{newOrders.length}</span>
          </div>
          <div className={styles.columnBody}>
            {newOrders.length > 0 ? (
              newOrders.map(renderOrderCard)
            ) : (
              <div className={styles.emptyCol}>No new orders</div>
            )}
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>Preparing</span>
            <span className={styles.columnCount}>{preparingOrders.length}</span>
          </div>
          <div className={styles.columnBody}>
            {preparingOrders.length > 0 ? (
              preparingOrders.map(renderOrderCard)
            ) : (
              <div className={styles.emptyCol}>No orders preparing</div>
            )}
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>Completed</span>
            <span className={styles.columnCount}>{completedOrders.length}</span>
          </div>
          <div className={styles.columnBody}>
            {completedOrders.length > 0 ? (
              completedOrders.map(renderOrderCard)
            ) : (
              <div className={styles.emptyCol}>No completed orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
