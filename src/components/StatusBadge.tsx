import styles from './StatusBadge.module.css';

export type BadgeStatus = 'new' | 'preparing' | 'completed' | 'cancelled' | 'paid' | 'unpaid';

export interface StatusBadgeProps {
  status: BadgeStatus;
}

const labels: Record<BadgeStatus, string> = {
  new: 'New',
  preparing: 'Preparing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  paid: 'Paid',
  unpaid: 'Unpaid',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
