import type { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import type { BadgeStatus } from './StatusBadge';
import styles from './OrderCard.module.css';

export interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  isSelected?: boolean;
}

function formatTime(timestamp: { toDate?: () => Date } | null | undefined): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '--:--';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getItemsSummary(order: Order): string {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const names = order.items.slice(0, 3).map((item) => item.name);
  const suffix = order.items.length > 3 ? ` +${order.items.length - 3} more` : '';
  return `${totalItems} item${totalItems !== 1 ? 's' : ''}: ${names.join(', ')}${suffix}`;
}

export function OrderCard({ order, onClick, isSelected = false }: OrderCardProps) {
  const badgeStatus: BadgeStatus =
    order.status === 'new' ? 'new' :
    order.status === 'preparing' ? 'preparing' :
    'completed';

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      <div className={styles.header}>
        <span className={styles.orderNumber}>#{order.orderNumber}</span>
        <span className={styles.time}>{formatTime(order.createdAt)}</span>
      </div>
      <div className={styles.type}>{order.type}</div>
      <div className={styles.summary}>{getItemsSummary(order)}</div>
      <div className={styles.footer}>
        <span className={styles.total}>P{order.total.toFixed(2)}</span>
        <StatusBadge status={badgeStatus} />
      </div>
    </div>
  );
}
