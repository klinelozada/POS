import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useBasePath } from '../../hooks/useBasePath';
import { createOrder } from '../../services/orderService';
import { getSettings } from '../../services/adminService';
import { addCustomerOrderId } from '../../utils/customerSession';
import { getCurrentPosition, isWithinCafe } from '../../utils/geolocation';
import type { PaymentMethod, OrderItem } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import styles from './Checkout.module.css';

export default function Checkout() {
  const navigate = useNavigate();
  const base = useBasePath();
  const isMobile = base === '/m';
  const items = useCartStore((s) => s.items);
  const orderType = useCartStore((s) => s.orderType);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitting, setSubmitting] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [enabledMethods, setEnabledMethods] = useState<PaymentMethod[]>(['cash', 'card']);

  useEffect(() => {
    getSettings().then((s) => {
      if (s?.enabledPaymentMethods) setEnabledMethods(s.enabledPaymentMethods);
    }).catch(() => {});
  }, []);

  const cartTotal = total();

  const handlePayment = async (method: PaymentMethod) => {
    if (submitting || items.length === 0) return;
    setSubmitting(true);
    setLocationError('');

    // Re-check location for mobile customers
    if (isMobile) {
      try {
        const position = await getCurrentPosition();
        const result = isWithinCafe(position.coords.latitude, position.coords.longitude);
        if (!result.allowed) {
          setLocationError(
            `You appear to be ${result.distance >= 1000 ? `${(result.distance / 1000).toFixed(1)}km` : `${result.distance}m`} away from the cafe. Please return to place your order.`
          );
          setSubmitting(false);
          return;
        }
      } catch {
        setLocationError('Unable to verify your location. Please allow location access and try again.');
        setSubmitting(false);
        return;
      }
    }

    try {
      const orderItems: OrderItem[] = items.map((cartItem) => ({
        menuItemId: cartItem.menuItemId,
        name: cartItem.name,
        ...(cartItem.variant ? { variant: cartItem.variant } : {}),
        quantity: cartItem.quantity,
        price: cartItem.price,
        addOns: cartItem.addOns,
        station: cartItem.station,
        isDone: false,
        ...(cartItem.promoId ? { promoId: cartItem.promoId, promoName: cartItem.promoName } : {}),
        ...(cartItem.isFreeItem ? { isFreeItem: true } : {}),
      }));

      const orderId = await createOrder({
        type: orderType,
        items: orderItems,
        total: cartTotal,
        paymentMethod: method,
        paymentStatus: 'unpaid',
        status: 'new',
        prepStatus: 'pending',
        kitchenStatus: 'pending',
      });

      addCustomerOrderId(orderId);

      // Request notification permission for order updates
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      sessionStorage.setItem(
        'lastOrder',
        JSON.stringify({
          id: orderId,
          total: cartTotal,
          paymentMethod: method,
        })
      );

      clearCart();
      navigate(`${base}/confirmed`);
    } catch (error) {
      console.error('Failed to create order:', error);
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitting) {
    return <Navigate to={`${base}/menu`} replace />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`${base}/cart`)} disabled={submitting}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={styles.title}>Checkout</span>
      </div>

      <div className={styles.body}>
        {submitting ? (
          <div className={styles.loading}>
            <LoadingSpinner />
            <div>{isMobile ? 'Verifying location & placing order...' : 'Placing your order...'}</div>
          </div>
        ) : (
          <>
            <div className={styles.totalLabel}>Total Amount</div>
            <div className={styles.totalAmount}>{'\u20B1'}{cartTotal.toFixed(2)}</div>

            {locationError && (
              <div className={styles.locationError}>
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>location_off</span>
                {locationError}
              </div>
            )}

            <div className={styles.paymentLabel}>Select Payment Method</div>
            <div className={styles.paymentCards}>
              {enabledMethods.includes('cash') && (
                <div className={styles.paymentCard} onClick={() => handlePayment('cash')}>
                  <div className={styles.paymentIcon}>
                    <span className="material-symbols-rounded" style={{ fontSize: 28 }}>payments</span>
                  </div>
                  <div className={styles.paymentTitle}>Cash</div>
                  <div className={styles.paymentSubtitle}>Pay at counter</div>
                </div>
              )}
              {enabledMethods.includes('card') && (
                <div className={styles.paymentCard} onClick={() => handlePayment('card')}>
                  <div className={styles.paymentIcon}>
                    <span className="material-symbols-rounded" style={{ fontSize: 28 }}>credit_card</span>
                  </div>
                  <div className={styles.paymentTitle}>Card</div>
                  <div className={styles.paymentSubtitle}>Debit or credit</div>
                </div>
              )}
              {enabledMethods.includes('gcash') && (
                <div className={styles.paymentCard} onClick={() => handlePayment('gcash')}>
                  <div className={styles.paymentIcon}>
                    <span className="material-symbols-rounded" style={{ fontSize: 28 }}>smartphone</span>
                  </div>
                  <div className={styles.paymentTitle}>GCash</div>
                  <div className={styles.paymentSubtitle}>Pay via GCash</div>
                </div>
              )}
              {enabledMethods.includes('instapay') && (
                <div className={styles.paymentCard} onClick={() => handlePayment('instapay')}>
                  <div className={styles.paymentIcon}>
                    <span className="material-symbols-rounded" style={{ fontSize: 28 }}>account_balance</span>
                  </div>
                  <div className={styles.paymentTitle}>Instapay</div>
                  <div className={styles.paymentSubtitle}>Bank transfer</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
