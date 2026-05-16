import { useState, useCallback, useMemo, useEffect } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useMenu } from '../../hooks/useMenu';
import { updateOrderItemStatus } from '../../services/orderService';
import { getMenuItemImage } from '../../utils/menuImages';
import type { StationType } from '../../types';
import styles from './StationCounter.module.css';

interface StationCounterProps {
  station: StationType;
  stationLabel: string;
}

function formatTime(timestamp: { toDate?: () => Date } | null | undefined): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '--:--';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function StationCounter({ station, stationLabel }: StationCounterProps) {
  const { orders: allOrders } = useOrders();
  const { menuItems } = useMenu();
  const orders = useMemo(() => allOrders.filter((o) => o.status === 'new' || o.status === 'preparing'), [allOrders]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Filter orders that have items for this station
  const stationOrders = useMemo(() => {
    return orders.filter((order) =>
      order.items.some((item) => item.station === station && !item.isDone)
    );
  }, [orders, station]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  // Items for this station in selected order
  const stationItems = useMemo(() => {
    if (!selectedOrder) return [];
    return selectedOrder.items
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => item.station === station);
  }, [selectedOrder, station]);

  const selectedItem = selectedItemIndex !== null ? stationItems.find((i) => i.originalIndex === selectedItemIndex) : null;

  // Auto-deselect when selected order has no more pending items for this station
  useEffect(() => {
    if (selectedOrderId && selectedOrder) {
      const pendingItems = selectedOrder.items.filter((item) => item.station === station && !item.isDone);
      if (pendingItems.length === 0) {
        setSelectedOrderId(null);
        setSelectedItemIndex(null);
      }
    }
  }, [selectedOrder, selectedOrderId, station]);

  const handleItemDone = useCallback(async (orderId: string, itemIndex: number, isDone: boolean) => {
    try {
      await updateOrderItemStatus(orderId, itemIndex, isDone);
    } catch (error) {
      console.error('Failed to update item status:', error);
    }
  }, []);

  const handleMarkSelectedDone = () => {
    if (selectedOrder && selectedItemIndex !== null) {
      handleItemDone(selectedOrder.id, selectedItemIndex, true);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Column - Orders Queue */}
      <div className={styles.leftCol}>
        <div className={styles.leftHeader}>
          <span className={styles.stationTitle}>{stationLabel}</span>
          <span className={styles.stationBadge}>{station}</span>
        </div>
        <div className={styles.ordersList}>
          {stationOrders.length > 0 ? (
            stationOrders.map((order) => {
              const items = order.items.filter((i) => i.station === station);
              const doneCount = items.filter((i) => i.isDone).length;
              const totalCount = items.length;
              const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

              return (
                <div
                  key={order.id}
                  className={selectedOrderId === order.id ? styles.orderCardSelected : styles.orderCard}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setSelectedItemIndex(null);
                  }}
                >
                  <div className={styles.orderNum}>
                    #{String(order.orderNumber).padStart(3, '0')}
                  </div>
                  <div className={styles.orderMeta}>
                    <span>{formatTime(order.createdAt)}</span>
                    <span>{doneCount}/{totalCount} done</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>{'\u2615'}</div>
              <div>No orders to {station}</div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Column - Selected Order Items */}
      <div className={styles.midCol}>
        {selectedOrder ? (
          <>
            <div className={styles.photoPlaceholder}>
              {selectedItem && getMenuItemImage(selectedItem.name) ? (
                <img src={getMenuItemImage(selectedItem.name)} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
              ) : '\u2615'}
            </div>
            <div className={styles.orderItemsList}>
              {stationItems.map((item) => (
                <div
                  key={item.originalIndex}
                  className={selectedItemIndex === item.originalIndex ? styles.orderItemSelected : styles.orderItem}
                  onClick={() => setSelectedItemIndex(item.originalIndex)}
                >
                  <input
                    type="checkbox"
                    className={styles.itemCheckbox}
                    checked={item.isDone}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleItemDone(selectedOrder.id, item.originalIndex, e.target.checked);
                    }}
                  />
                  <div className={styles.itemInfo}>
                    <div className={`${styles.itemName} ${item.isDone ? styles.itemDone : ''}`}>
                      {item.name}
                    </div>
                    {item.variant && (
                      <div className={styles.itemVariant}>{item.variant}</div>
                    )}
                  </div>
                  <div className={styles.itemQty}>x{item.quantity}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{'\uD83D\uDC48'}</div>
            <div>Select an order to view items</div>
          </div>
        )}
      </div>

      {/* Right Column - Instructions */}
      <div className={styles.rightCol}>
        <div className={styles.instrHeader}>
          {station === 'prep' ? 'Prep Instructions' : 'Cooking Instructions'}
        </div>
        {selectedItem && !selectedItem.isDone ? (
          (() => {
            const menuItem = menuItems.find((mi) => mi.id === selectedItem.menuItemId);
            const recipe = menuItem?.prepInstructions;
            return (
              <>
                <div className={styles.instrItemName}>{selectedItem.name}</div>
                <div className={styles.instrDesc}>
                  {selectedItem.variant ? `Variant: ${selectedItem.variant}` : 'Standard preparation'}
                  {selectedItem.quantity > 1 ? ` | Quantity: ${selectedItem.quantity}` : ''}
                </div>
                {recipe ? (
                  <div className={styles.instrRecipe} dangerouslySetInnerHTML={{ __html: recipe }} />
                ) : (
                  <ol className={styles.instrSteps}>
                    <li className={styles.instrStep}>Gather ingredients for {selectedItem.name}</li>
                    <li className={styles.instrStep}>
                      {station === 'prep' ? 'Prepare according to recipe' : 'Cook according to recipe'}
                    </li>
                    <li className={styles.instrStep}>
                      {station === 'prep' ? 'Plate and present' : 'Check doneness and plate'}
                    </li>
                    <li className={styles.instrStep}>Quality check before serving</li>
                  </ol>
                )}
                <button className={styles.markDoneBtn} onClick={handleMarkSelectedDone}>
                  Mark Item Done
                </button>
              </>
            );
          })()
        ) : selectedItem && selectedItem.isDone ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: 32, color: 'var(--color-success)' }}>{'\u2713'}</div>
            <div>This item is completed</div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{'\uD83D\uDCCB'}</div>
            <div>Select an item to view instructions</div>
          </div>
        )}
      </div>
    </div>
  );
}
