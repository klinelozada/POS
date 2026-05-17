import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useMenu } from '../../hooks/useMenu';
import { useAuth } from '../../hooks/useAuth';
import { useStoreStatus } from '../../hooks/useStoreStatus';
import { updateOrder, updateOrderItemStatus } from '../../services/orderService';
import { getUserRole, getSettings } from '../../services/adminService';
import { getMenuItemImage } from '../../utils/menuImages';
import { ConfirmDialog, PinDialog } from '../../components';
import type { Order, OrderItem, PaymentMethod, MenuItem, UserRole } from '../../types';
import styles from './SoloCounter.module.css';

type PanelMode = 'prep' | 'payment' | 'receipt';

function formatTime(timestamp: { toDate?: () => Date } | null | undefined): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '--:--';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: { toDate?: () => Date } | null | undefined): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '';
  return timestamp.toDate().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function SoloCounter() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { user } = useAuth();
  const { categories, menuItems } = useMenu();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('prep');
  const [showDone, setShowDone] = useState(false);
  const [paymentMethodOverride, setPaymentMethodOverride] = useState<PaymentMethod | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [cashTendered, setCashTendered] = useState<string>('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [receiptChange, setReceiptChange] = useState<number>(0);

  // Edit order state
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [removeItemIndex, setRemoveItemIndex] = useState<number | null>(null);
  const [swapItemIndex, setSwapItemIndex] = useState<number | null>(null);
  const [pinAction, setPinAction] = useState<(() => void) | null>(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [swapCategoryId, setSwapCategoryId] = useState<string | null>(null);
  const [showMarkAllConfirm, setShowMarkAllConfirm] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  // Digital payment state
  const [referenceNumber, setReferenceNumber] = useState('');
  const [gcashQrUrl, setGcashQrUrl] = useState('');
  const [instapayQrUrl, setInstapayQrUrl] = useState('');

  const storeStatus = useStoreStatus();

  // Redirect to login if store was closed from another device
  useEffect(() => {
    if (storeStatus && !storeStatus.isOpen) {
      localStorage.removeItem('posLastRoute');
      navigate('/pos/login', { replace: true });
    }
  }, [storeStatus, navigate]);

  // Fetch user role once
  useEffect(() => {
    if (user?.uid) {
      getUserRole(user.uid).then((role) => setUserRole(role));
    }
  }, [user?.uid]);

  // Load digital payment QR URLs
  useEffect(() => {
    getSettings().then((s) => {
      if (s?.gcashQrUrl) setGcashQrUrl(s.gcashQrUrl);
      if (s?.instapayQrUrl) setInstapayQrUrl(s.instapayQrUrl);
    }).catch(() => {});
  }, []);

  const isAdmin = userRole === 'super_admin';

  // Gate action behind PIN if not admin
  const gateAction = (action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      setPinAction(() => action);
    }
  };

  // Categorize orders
  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  // Pay: unpaid orders (can be in prep simultaneously)
  const payOrders = activeOrders.filter((o) => (o.paymentStatus ?? 'unpaid') === 'unpaid');
  // Prep: items still being prepared (can be in pay simultaneously)
  const prepOrders = activeOrders.filter((o) => !o.items.every((item) => item.isDone));
  // Done: fully completed (all items done + paid)
  const doneOrders = orders.filter((o) => o.status === 'completed');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  // Auto-redirect to solo dashboard when no active orders for 5 seconds
  useEffect(() => {
    if (activeOrders.length === 0 && panelMode !== 'receipt') {
      const timer = setTimeout(() => {
        navigate('/pos/solo');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeOrders.length, panelMode, navigate]);

  // Auto-switch to payment mode when all items are done during prep (and still unpaid)
  useEffect(() => {
    if (
      selectedOrder &&
      panelMode === 'prep' &&
      selectedOrder.items.length > 0 &&
      selectedOrder.items.every((item) => item.isDone) &&
      (selectedOrder.paymentStatus ?? 'unpaid') === 'unpaid'
    ) {
      setPanelMode('payment');
      setPaymentMethodOverride(selectedOrder.paymentMethod ?? 'cash');
      setCashTendered('');
      setSelectedItemIndex(null);
    }
  }, [selectedOrder, panelMode]);

  // Auto-deselect when selected order is completed (all done + paid)
  useEffect(() => {
    if (
      selectedOrder &&
      panelMode === 'prep' &&
      selectedOrder.status === 'completed'
    ) {
      setSelectedOrderId(null);
      setPanelMode('prep');
      setSelectedItemIndex(null);
    }
  }, [selectedOrder, panelMode]);

  const focusedItem = selectedOrder && selectedItemIndex !== null
    ? selectedOrder.items[selectedItemIndex]
    : null;

  const handleSelectPrepOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setPanelMode('prep');
    setPaymentMethodOverride(null);
    setCashTendered('');
    const firstPending = order.items.findIndex((item) => !item.isDone);
    setSelectedItemIndex(firstPending >= 0 ? firstPending : null);
  };

  const handleSelectPayOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setPanelMode('payment');
    setPaymentMethodOverride(order.paymentMethod ?? 'cash');
    setCashTendered('');
    setSelectedItemIndex(null);
  };

  const handleItemDone = useCallback(async (orderId: string, itemIndex: number, isDone: boolean) => {
    try {
      await updateOrderItemStatus(orderId, itemIndex, isDone);
    } catch (error) {
      console.error('Failed to update item status:', error);
    }
  }, []);

  const currentMethod = paymentMethodOverride ?? selectedOrder?.paymentMethod ?? 'cash';
  const isDigital = currentMethod === 'gcash' || currentMethod === 'instapay';
  const cashAmount = parseFloat(cashTendered) || 0;
  const change = selectedOrder ? cashAmount - selectedOrder.total : 0;
  const canComplete = currentMethod === 'card'
    || (currentMethod === 'cash' && cashAmount >= (selectedOrder?.total ?? 0))
    || (isDigital && referenceNumber.trim().length > 0);

  const handleCompletePayment = async () => {
    if (!selectedOrder || !canComplete) return;
    try {
      // Save receipt data before updating
      setReceiptOrder({ ...selectedOrder });
      setReceiptChange(currentMethod === 'cash' ? change : 0);

      const allItemsDone = selectedOrder.items.every((item) => item.isDone);
      await updateOrder(selectedOrder.id, {
        paymentMethod: currentMethod,
        paymentStatus: 'paid',
        ...(isDigital && referenceNumber.trim() ? { referenceNumber: referenceNumber.trim() } : {}),
        // Only mark completed if all items are also done
        ...(allItemsDone ? { status: 'completed' } : {}),
      });
      setReferenceNumber('');
      setPanelMode('receipt');
    } catch (error) {
      console.error('Failed to complete payment:', error);
    }
  };

  const handleCloseReceipt = () => {
    setSelectedOrderId(null);
    setPanelMode('prep');
    setReceiptOrder(null);
    setCashTendered('');
  };

  const handleCancelOrder = () => {
    setSelectedOrderId(null);
    setCashTendered('');
  };

  const handleCancelEntireOrder = async () => {
    if (!selectedOrder) return;
    await updateOrder(selectedOrder.id, { status: 'cancelled' });
    setShowCancelConfirm(false);
    setSelectedOrderId(null);
    setPanelMode('prep');
  };

  const handleRemoveItem = async () => {
    if (!selectedOrder || removeItemIndex === null) return;
    const newItems = selectedOrder.items.filter((_, i) => i !== removeItemIndex);
    if (newItems.length === 0) {
      // If removing last item, cancel the order
      await updateOrder(selectedOrder.id, { status: 'cancelled' });
      setRemoveItemIndex(null);
      setSelectedOrderId(null);
      setPanelMode('prep');
      return;
    }
    const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await updateOrder(selectedOrder.id, { items: newItems, total: newTotal });
    setRemoveItemIndex(null);
  };

  const handleSwapItem = async (menuItem: MenuItem) => {
    if (!selectedOrder || swapItemIndex === null) return;
    const oldItem = selectedOrder.items[swapItemIndex];
    const newItem: OrderItem = {
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: oldItem.quantity,
      price: menuItem.basePrice,
      addOns: [],
      station: menuItem.station,
      isDone: false,
      variant: undefined,
    };
    const newItems = [...selectedOrder.items];
    newItems[swapItemIndex] = newItem;
    const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await updateOrder(selectedOrder.id, { items: newItems, total: newTotal });
    setSwapItemIndex(null);
    setSwapSearch('');
    setSwapCategoryId(null);
  };

  const handleMarkAllDone = async () => {
    if (!selectedOrder) return;
    for (let i = 0; i < selectedOrder.items.length; i++) {
      if (!selectedOrder.items[i].isDone) {
        await updateOrderItemStatus(selectedOrder.id, i, true);
      }
    }
    setShowMarkAllConfirm(false);
  };

  const allItemsDone = selectedOrder?.items.every((item) => item.isDone) ?? false;

  const quickAmounts = selectedOrder
    ? [
        selectedOrder.total,
        Math.ceil(selectedOrder.total / 50) * 50,
        Math.ceil(selectedOrder.total / 100) * 100,
        Math.ceil(selectedOrder.total / 500) * 500,
        1000,
      ].filter((v, i, arr) => arr.indexOf(v) === i && v >= selectedOrder.total)
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <span className={styles.badge}>SOLO</span>
        <span className={styles.spacer} />
        <button className={styles.switchBtn} onClick={() => navigate('/pos/qr')}>
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>qr_code</span>
          QR Code
        </button>
        <button className={styles.switchBtn} onClick={() => {
          sessionStorage.setItem('soloMode', 'true');
          navigate('/kiosk/welcome');
        }}>
          Switch to Kiosk
        </button>
        <button className={styles.closeBtn} onClick={() => navigate('/pos/close')}>
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>power_settings_new</span>
          Close Store
        </button>
      </div>
      <div className={styles.body}>
        {/* Left Column - Orders Queue */}
        <div className={styles.leftCol}>
          <div className={showDone ? styles.sectionPane33 : styles.sectionPane50}>
            <div className={styles.sectionHeaderPay}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
              Pay ({payOrders.length})
            </div>
            <div className={styles.sectionScroll}>
              {payOrders.map((order) => (
                <div
                  key={order.id}
                  className={selectedOrderId === order.id && panelMode === 'payment' ? styles.orderItemSelected : styles.orderItem}
                  onClick={() => handleSelectPayOrder(order)}
                >
                  <div className={styles.orderNum}>#{String(order.orderNumber).padStart(3, '0')}</div>
                  <div className={styles.orderMeta}>
                    <span>{formatTime(order.createdAt)}</span>
                    <span className={styles.orderTotal}>{'\u20B1'}{order.total.toFixed(0)}</span>
                  </div>
                  <div className={styles.orderPayment}>{order.paymentMethod ?? 'pending'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.dividerOrange} />

          <div className={showDone ? styles.sectionPane33 : styles.sectionPane50}>
            <div className={styles.sectionHeaderPrep}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
              Prep ({prepOrders.length})
            </div>
            <div className={styles.sectionScroll}>
              {prepOrders.map((order) => {
                const doneCount = order.items.filter((i) => i.isDone).length;
                const totalCount = order.items.length;
                return (
                  <div
                    key={order.id}
                    className={selectedOrderId === order.id && panelMode === 'prep' ? styles.orderItemSelected : styles.orderItem}
                    onClick={() => handleSelectPrepOrder(order)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className={styles.orderNum}>#{String(order.orderNumber).padStart(3, '0')}</div>
                      <span className={(order.paymentStatus ?? 'unpaid') === 'paid' ? styles.paidBadge : styles.unpaidBadge}>
                        {(order.paymentStatus ?? 'unpaid') === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div className={styles.orderMeta}>
                      <span>{formatTime(order.createdAt)}</span>
                      <span className={styles.orderTotal}>{doneCount}/{totalCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.dividerGrey} />

          <div className={showDone ? styles.sectionPane33 : styles.sectionPaneCollapsed}>
            <div className={styles.sectionHeaderDone} onClick={() => setShowDone(!showDone)}>
              Done
              <span className={styles.doneCount}>({doneOrders.length})</span>
              <span className={showDone ? styles.chevronOpen : styles.chevron}>{'\u25B6'}</span>
            </div>
            {showDone && (
              <div className={styles.sectionScroll}>
                {doneOrders.map((order) => (
                  <div key={order.id} className={styles.orderItem} style={{ opacity: 0.5 }}>
                    <div className={styles.orderNum}>#{String(order.orderNumber).padStart(3, '0')}</div>
                    <div className={styles.orderMeta}>
                      <span>{formatTime(order.createdAt)}</span>
                      <span className={styles.orderTotal}>{'\u20B1'}{order.total.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Right Panels */}
        {panelMode === 'receipt' && receiptOrder ? (
          /* Receipt View */
          <div className={styles.paymentPanel}>
            <div className={styles.receiptContainer}>
              <div className={styles.receiptPaper}>
                <img src="/images/logo.png" alt="Joe Street" className={styles.receiptLogo} />
                <div className={styles.receiptCafeName}>Joe Street Cafe & Study Lounge</div>
                <div className={styles.receiptAddress}>Sitio Malinong East, Brgy. Layog, Maasin, Iloilo</div>
                <div className={styles.receiptDivider} />
                <div className={styles.receiptMeta}>
                  <span>Order #{String(receiptOrder.orderNumber).padStart(3, '0')}</span>
                  <span>{formatDate(receiptOrder.createdAt)} {formatTime(receiptOrder.createdAt)}</span>
                </div>
                <div className={styles.receiptMeta}>
                  <span>{receiptOrder.type === 'dine-in' ? 'Dine In' : 'Take Out'}</span>
                  <span>{currentMethod === 'gcash' ? 'GCash' : currentMethod === 'instapay' ? 'Instapay' : currentMethod === 'cash' ? 'Cash' : 'Card'}</span>
                </div>
                <div className={styles.receiptDivider} />
                {receiptOrder.items.map((item, i) => (
                  <div key={i} className={styles.receiptItem}>
                    <div className={styles.receiptItemLeft}>
                      <span>{item.name}</span>
                      {item.variant && <span className={styles.receiptItemVariant}> ({item.variant})</span>}
                      {item.quantity > 1 && <span className={styles.receiptItemQty}> x{item.quantity}</span>}
                    </div>
                    <span>{'\u20B1'}{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className={styles.receiptDivider} />
                <div className={styles.receiptRow}>
                  <span>Subtotal</span>
                  <span>{'\u20B1'}{receiptOrder.total.toFixed(2)}</span>
                </div>
                <div className={styles.receiptRowBold}>
                  <span>Total</span>
                  <span>{'\u20B1'}{receiptOrder.total.toFixed(2)}</span>
                </div>
                {currentMethod === 'cash' && (
                  <>
                    <div className={styles.receiptRow}>
                      <span>Cash Tendered</span>
                      <span>{'\u20B1'}{cashAmount.toFixed(2)}</span>
                    </div>
                    <div className={styles.receiptRowBold}>
                      <span>Change</span>
                      <span>{'\u20B1'}{receiptChange.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {receiptOrder.referenceNumber && (
                  <div className={styles.receiptRow}>
                    <span>Ref #</span>
                    <span>{receiptOrder.referenceNumber}</span>
                  </div>
                )}
                <div className={styles.receiptDivider} />
                <div className={styles.receiptFooter}>Thank you for visiting Joe Street!</div>
              </div>
              <button className={styles.receiptDoneBtn} onClick={handleCloseReceipt}>
                Done
              </button>
            </div>
          </div>
        ) : !selectedOrder ? (
          <div className={styles.emptyPanel}>
            <div style={{ fontSize: 32 }}>{'\u2615'}</div>
            <div>Select an order to view details</div>
          </div>
        ) : panelMode === 'prep' ? (
          <>
            {/* Mid column - 50/50 photo + checklist */}
            <div className={styles.midCol}>
              <div className={styles.midPhoto}>
                {focusedItem && getMenuItemImage(focusedItem.name) ? (
                  <img src={getMenuItemImage(focusedItem.name)} alt={focusedItem.name} className={styles.photoImg} />
                ) : (
                  <div className={styles.photoFallback}>{'\u2615'}</div>
                )}
              </div>
              <div className={styles.midChecklist}>
                <div className={styles.priceBar}>{'\u20B1'}{selectedOrder.total.toFixed(2)}</div>
                <div className={styles.checklistScroll}>
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className={`${styles.checklistItem} ${selectedItemIndex === index ? styles.checklistItemSelected : ''}`}
                      onClick={() => setSelectedItemIndex(index)}
                    >
                      <input
                        type="checkbox"
                        className={styles.checklistCheckbox}
                        checked={item.isDone}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleItemDone(selectedOrder.id, index, e.target.checked);
                        }}
                      />
                      <div>
                        <div className={`${styles.checklistName} ${item.isDone ? styles.checklistDone : ''}`}>
                          {item.name}
                        </div>
                        {item.variant && (
                          <div className={styles.checklistVariant}>{item.variant}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {!allItemsDone && (
                  <button
                    className={styles.markAllBtn}
                    onClick={() => setShowMarkAllConfirm(true)}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>done_all</span>
                    Mark All as Done
                  </button>
                )}
              </div>
            </div>

            {/* Right column - prep instructions */}
            <div className={styles.rightCol}>
              <div className={styles.prepHeader}>Prep Instructions</div>
              {focusedItem && !focusedItem.isDone ? (
                (() => {
                  const menuItem = menuItems.find((mi) => mi.id === focusedItem.menuItemId);
                  const recipe = menuItem?.prepInstructions;
                  return (
                    <>
                      <div className={styles.prepItemName}>{focusedItem.name}</div>
                      <div className={styles.prepDesc}>
                        {focusedItem.variant ? `Variant: ${focusedItem.variant}` : 'Standard preparation'}
                        {focusedItem.quantity > 1 ? ` | Qty: ${focusedItem.quantity}` : ''}
                      </div>
                      {recipe ? (
                        <div className={styles.prepRecipe} dangerouslySetInnerHTML={{ __html: recipe }} />
                      ) : (
                        <ol className={styles.prepSteps}>
                          <li className={styles.prepStep}>Prepare ingredients</li>
                          <li className={styles.prepStep}>Follow recipe for {focusedItem.name}</li>
                          <li className={styles.prepStep}>Plate and present</li>
                        </ol>
                      )}
                      <button
                        className={styles.markDoneBtn}
                        onClick={() => handleItemDone(selectedOrder.id, selectedItemIndex!, true)}
                      >
                        Mark Item Done
                      </button>
                    </>
                  );
                })()
              ) : focusedItem && focusedItem.isDone ? (
                <div className={styles.emptyPanel}>
                  <div style={{ fontSize: 32, color: 'var(--color-success)' }}>{'\u2713'}</div>
                  <div>This item is completed</div>
                </div>
              ) : (
                <div className={styles.emptyPanel}>
                  <div>Select an item to view instructions</div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Payment mode */
          <div className={styles.paymentPanel}>
            <div className={styles.payHeader}>
              <span className={styles.payOrderNum}>#{String(selectedOrder.orderNumber).padStart(3, '0')}</span>
              <span className={styles.payTypeBadge}>{selectedOrder.type}</span>
              <span className={styles.payTime}>{formatTime(selectedOrder.createdAt)}</span>
              <span style={{ flex: 1 }} />
              <button
                className={styles.cancelOrderBtn}
                onClick={() => gateAction(() => setShowCancelConfirm(true))}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>block</span>
                Cancel Order
              </button>
            </div>
            <div className={styles.payContent}>
              <div className={styles.payItemsList}>
                {selectedOrder.items.map((item, index) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <div key={index} className={styles.payItem}>
                      <div className={styles.payItemPhoto}>
                        {getMenuItemImage(item.name) ? (
                          <img src={getMenuItemImage(item.name)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                        ) : '\u2615'}
                      </div>
                      <div className={styles.payItemInfo}>
                        <div className={styles.payItemName}>{item.name}</div>
                        {item.variant && <div className={styles.payItemVariant}>{item.variant}</div>}
                      </div>
                      <div className={styles.payItemQty}>x{item.quantity}</div>
                      <div className={styles.payItemPrice}>{'\u20B1'}{itemTotal.toFixed(2)}</div>
                      <div className={styles.payItemActions}>
                        <button
                          className={styles.itemEditBtn}
                          title="Change item"
                          onClick={(e) => { e.stopPropagation(); gateAction(() => { setSwapItemIndex(index); setSwapSearch(''); setSwapCategoryId(null); }); }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>swap_horiz</span>
                        </button>
                        <button
                          className={styles.itemRemoveBtn}
                          title="Remove item"
                          onClick={(e) => { e.stopPropagation(); gateAction(() => setRemoveItemIndex(index)); }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.paySidebar}>
                <div className={styles.paySummaryRow}>
                  <span>Subtotal</span>
                  <span>{'\u20B1'}{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className={styles.paySummaryTotal}>
                  <span>Total</span>
                  <span>{'\u20B1'}{selectedOrder.total.toFixed(2)}</span>
                </div>

                <div className={styles.paySectionLabel}>Payment Method</div>
                <div className={styles.payMethodToggle}>
                  <button
                    className={currentMethod === 'cash' ? styles.payMethodBtnActive : styles.payMethodBtn}
                    onClick={() => setPaymentMethodOverride('cash')}
                  >
                    Cash
                  </button>
                  <button
                    className={currentMethod === 'card' ? styles.payMethodBtnActive : styles.payMethodBtn}
                    onClick={() => setPaymentMethodOverride('card')}
                  >
                    Card
                  </button>
                  {gcashQrUrl && (
                    <button
                      className={currentMethod === 'gcash' ? styles.payMethodBtnActive : styles.payMethodBtn}
                      onClick={() => setPaymentMethodOverride('gcash')}
                    >
                      GCash
                    </button>
                  )}
                  {instapayQrUrl && (
                    <button
                      className={currentMethod === 'instapay' ? styles.payMethodBtnActive : styles.payMethodBtn}
                      onClick={() => setPaymentMethodOverride('instapay')}
                    >
                      Instapay
                    </button>
                  )}
                </div>

                {currentMethod === 'cash' && (
                  <>
                    <div className={styles.paySectionLabel}>Cash Tendered</div>
                    <input
                      type="number"
                      className={styles.cashInput}
                      placeholder="Enter amount..."
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      min={0}
                    />
                    <div className={styles.quickAmounts}>
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          className={styles.quickAmountBtn}
                          onClick={() => setCashTendered(String(amt))}
                        >
                          {'\u20B1'}{amt}
                        </button>
                      ))}
                    </div>
                    {cashAmount > 0 && (
                      <div className={styles.changeRow}>
                        <span>Change</span>
                        <span className={change >= 0 ? styles.changePositive : styles.changeNegative}>
                          {'\u20B1'}{Math.abs(change).toFixed(2)}
                          {change < 0 && ' (insufficient)'}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {isDigital && (
                  <>
                    <div className={styles.digitalQrSection}>
                      <div className={styles.paySectionLabel}>
                        Show this QR to customer
                      </div>
                      <img
                        src={currentMethod === 'gcash' ? gcashQrUrl : instapayQrUrl}
                        alt={`${currentMethod} QR`}
                        className={styles.digitalQrImage}
                      />
                    </div>
                    <div className={styles.paySectionLabel}>Reference Number</div>
                    <input
                      type="text"
                      className={styles.cashInput}
                      placeholder="Enter last digits of ref #..."
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </>
                )}

                <button
                  className={styles.completeBtn}
                  onClick={() => setShowPaymentConfirm(true)}
                  disabled={!canComplete}
                >
                  Complete Payment
                </button>
                <div className={styles.cancelLink} onClick={handleCancelOrder}>Cancel</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Complete Payment Confirm */}
      {showPaymentConfirm && selectedOrder && (
        <ConfirmDialog
          title="Complete Payment"
          message={`Complete payment of \u20B1${selectedOrder.total.toFixed(2)} for Order #${String(selectedOrder.orderNumber).padStart(3, '0')} via ${currentMethod === 'gcash' ? 'GCash' : currentMethod === 'instapay' ? 'Instapay' : currentMethod === 'cash' ? 'Cash' : 'Card'}${isDigital && referenceNumber.trim() ? ` (Ref: ${referenceNumber.trim()})` : ''}?`}
          confirmLabel="Yes, Complete"
          variant="success"
          onConfirm={() => { setShowPaymentConfirm(false); handleCompletePayment(); }}
          onCancel={() => setShowPaymentConfirm(false)}
        />
      )}

      {/* Mark All as Done Confirm */}
      {showMarkAllConfirm && selectedOrder && (
        <ConfirmDialog
          title="Mark All as Done"
          message={`Are you sure all ${selectedOrder.items.length} items in Order #${String(selectedOrder.orderNumber).padStart(3, '0')} are done?`}
          confirmLabel="Yes, All Done"
          variant="success"
          onConfirm={handleMarkAllDone}
          onCancel={() => setShowMarkAllConfirm(false)}
        />
      )}

      {/* Cancel Order Confirm */}
      {showCancelConfirm && selectedOrder && (
        <ConfirmDialog
          title="Cancel Order"
          message={`Are you sure you want to cancel Order #${String(selectedOrder.orderNumber).padStart(3, '0')}? This will also cancel all prep for this order.`}
          confirmLabel="Cancel Order"
          onConfirm={handleCancelEntireOrder}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      {/* Remove Item Confirm */}
      {removeItemIndex !== null && selectedOrder && (
        <ConfirmDialog
          title="Remove Item"
          message={`Are you sure you want to remove "${selectedOrder.items[removeItemIndex]?.name}" from this order?${selectedOrder.items.length === 1 ? ' This is the last item — the order will be cancelled.' : ''}`}
          confirmLabel="Remove"
          onConfirm={handleRemoveItem}
          onCancel={() => setRemoveItemIndex(null)}
        />
      )}

      {/* PIN Dialog for non-admin */}
      {pinAction && (
        <PinDialog
          onVerified={() => { pinAction(); setPinAction(null); }}
          onCancel={() => setPinAction(null)}
        />
      )}

      {/* Swap Item Modal */}
      {swapItemIndex !== null && selectedOrder && (
        <div className={styles.swapOverlay} onClick={() => { setSwapItemIndex(null); setSwapSearch(''); setSwapCategoryId(null); }}>
          <div className={styles.swapModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.swapHeader}>
              <h3 className={styles.swapTitle}>
                Change: {selectedOrder.items[swapItemIndex]?.name}
              </h3>
              <button className={styles.swapCloseBtn} onClick={() => { setSwapItemIndex(null); setSwapSearch(''); setSwapCategoryId(null); }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <input
              className={styles.swapSearchInput}
              type="text"
              placeholder="Search menu items..."
              value={swapSearch}
              onChange={(e) => setSwapSearch(e.target.value)}
              autoFocus
            />
            <div className={styles.swapCategories}>
              <button
                className={swapCategoryId === null ? styles.swapCatBtnActive : styles.swapCatBtn}
                onClick={() => setSwapCategoryId(null)}
              >
                All
              </button>
              {categories.filter((c) => c.isActive).map((cat) => (
                <button
                  key={cat.id}
                  className={swapCategoryId === cat.id ? styles.swapCatBtnActive : styles.swapCatBtn}
                  onClick={() => setSwapCategoryId(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className={styles.swapItemsList}>
              {menuItems
                .filter((mi) => mi.isAvailable)
                .filter((mi) => !swapCategoryId || mi.categoryId === swapCategoryId)
                .filter((mi) => !swapSearch || mi.name.toLowerCase().includes(swapSearch.toLowerCase()))
                .map((mi) => (
                  <div key={mi.id} className={styles.swapItem} onClick={() => handleSwapItem(mi)}>
                    <div className={styles.swapItemPhoto}>
                      {getMenuItemImage(mi.name) ? (
                        <img src={getMenuItemImage(mi.name)} alt={mi.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                      ) : '\u2615'}
                    </div>
                    <div className={styles.swapItemInfo}>
                      <div className={styles.swapItemName}>{mi.name}</div>
                      <div className={styles.swapItemPrice}>{'\u20B1'}{mi.basePrice.toFixed(0)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
