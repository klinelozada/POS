import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useBasePath } from '../../hooks/useBasePath';
import { getMenuItemImage } from '../../utils/menuImages';
import styles from './Cart.module.css';

export default function Cart() {
  const navigate = useNavigate();
  const base = useBasePath();
  const orderType = useCartStore((s) => s.orderType);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const removePromoGroup = useCartStore((s) => s.removePromoGroup);
  const total = useCartStore((s) => s.total);

  const cartTotal = total();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`${base}/menu`)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={styles.title}>Your Order</span>
        <span className={styles.orderTypeBadge}>{orderType === 'dine-in' ? 'Dine In' : 'Take Out'}</span>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: 48 }}>{'\uD83D\uDED2'}</div>
          <div className={styles.emptyText}>Your cart is empty</div>
          <button className={styles.browseBtn} onClick={() => navigate(`${base}/menu`)}>
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div className={styles.itemsList}>
            {items.map((item, index) => {
              const addOnsTotal = item.addOns.reduce((sum, a) => sum + a.price, 0);
              const lineTotal = (item.price + addOnsTotal) * item.quantity;
              return (
                <div key={`${item.menuItemId}-${item.variant}-${index}`} className={styles.cartItem}>
                  <div className={styles.itemPhoto}>
                    {getMenuItemImage(item.name) ? (
                      <img src={getMenuItemImage(item.name)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                    ) : '\u2615'}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>
                      {item.name}
                      {item.promoName && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#1565C0', background: '#E3F2FD', padding: '2px 6px', borderRadius: 8, marginLeft: 6 }}>
                          {item.isFreeItem ? 'FREE' : item.promoName}
                        </span>
                      )}
                    </div>
                    {item.variant && (
                      <div className={styles.itemVariant}>{item.variant}</div>
                    )}
                    {item.addOns.length > 0 && (
                      <div className={styles.itemAddOns}>
                        {item.addOns.map((a) => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className={styles.itemPrice}>
                    {item.isFreeItem ? 'FREE' : `${'\u20B1'}${lineTotal.toFixed(2)}`}
                  </div>
                  {!item.promoId ? (
                    <div className={styles.qtyControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className={styles.qtyControls}>
                      <span className={styles.qtyValue}>1</span>
                    </div>
                  )}
                  <button className={styles.removeBtn} onClick={() => item.promoId ? removePromoGroup(index) : removeItem(index)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalValue}>{'\u20B1'}{cartTotal.toFixed(2)}</span>
            </div>
            <button
              className={styles.checkoutBtn}
              onClick={() => navigate(`${base}/checkout`)}
              disabled={items.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
