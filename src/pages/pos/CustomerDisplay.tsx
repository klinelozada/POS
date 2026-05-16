import { useOrders } from '../../hooks/useOrders';
import type { Order } from '../../types';
import styles from './CustomerDisplay.module.css';

function renderOrderItems(order: Order) {
  return order.items.map((item, index) => (
    <div key={index} className={styles.displayItem}>
      <span className={styles.displayItemName}>
        {item.name}
        {item.variant ? ` (${item.variant})` : ''}
      </span>
      <span className={styles.displayItemQty}>x{item.quantity}</span>
      <span className={styles.displayItemPrice}>
        {'\u20B1'}{(item.price * item.quantity).toFixed(2)}
      </span>
    </div>
  ));
}

export default function CustomerDisplay() {
  const { orders } = useOrders();

  // Show the most recent active order
  const activeOrders = orders.filter((o) => o.status === 'new' || o.status === 'preparing');
  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;
  const runningTotal = activeOrder?.total ?? 0;

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <div className={styles.adPlaceholder}>
          Today's Special: Iced Latte + Pastry Combo
        </div>
      </div>
      <div className={styles.right}>
        {activeOrder ? (
          <>
            <div className={styles.rightHeader}>
              Order #{String(activeOrder.orderNumber).padStart(3, '0')}
            </div>
            <div className={styles.ordersList}>
              {renderOrderItems(activeOrder)}
            </div>
            <div className={styles.totalBar}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalValue}>{'\u20B1'}{runningTotal.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className={styles.welcomeRight}>
            <div style={{ fontSize: 48 }}>{'\u2615'}</div>
            <div className={styles.welcomeText}>Welcome to Joe Street Cafe</div>
            <div className={styles.welcomeSub}>Your order will appear here</div>
          </div>
        )}
      </div>
    </div>
  );
}
