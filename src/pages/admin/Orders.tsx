import { useState, useMemo, Fragment } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { updateOrder } from '../../services/orderService';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Order, OrderStatus, PaymentMethod } from '../../types';
import styles from './Orders.module.css';
import toast from 'react-hot-toast';

type StatusFilter = 'all' | OrderStatus;
type PaymentFilter = 'all' | PaymentMethod;
type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

const PAGE_SIZE = 25;

function getDateRange(preset: DatePreset, customFrom: string, customTo: string): { from: Date; to: Date } {
  const now = new Date();
  const startOfDay = (d: Date) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; };
  const endOfDay = (d: Date) => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r; };

  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case 'week': {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      return { from: startOfDay(w), to: endOfDay(now) };
    }
    case 'month': {
      const m = new Date(now);
      m.setMonth(m.getMonth() - 1);
      return { from: startOfDay(m), to: endOfDay(now) };
    }
    case 'year': {
      const yr = new Date(now);
      yr.setFullYear(yr.getFullYear() - 1);
      return { from: startOfDay(yr), to: endOfDay(now) };
    }
    case 'custom':
      return {
        from: customFrom ? startOfDay(new Date(customFrom)) : startOfDay(now),
        to: customTo ? endOfDay(new Date(customTo)) : endOfDay(now),
      };
  }
}

function formatDateKey(d: Date): string {
  return d.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Orders() {
  const { orders, loading } = useOrders();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filteredOrders = useMemo(() => {
    const { from, to } = getDateRange(datePreset, customFrom, customTo);
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && order.paymentMethod !== paymentFilter) return false;
      const orderDate = order.createdAt?.toDate?.();
      if (!orderDate) return false;
      if (orderDate < from || orderDate > to) return false;
      return true;
    });
  }, [orders, statusFilter, paymentFilter, datePreset, customFrom, customTo]);

  // Pagination on flat list
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pagedOrders = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  // Group paged orders by date
  const pagedGroups = useMemo(() => {
    const groups: { date: string; orders: Order[] }[] = [];
    const map = new Map<string, Order[]>();
    for (const order of pagedOrders) {
      const d = order.createdAt?.toDate?.();
      if (!d) continue;
      const key = formatDateKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(order);
    }
    for (const [date, ords] of map) {
      groups.push({ date, orders: ords });
    }
    return groups;
  }, [pagedOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      toast.success('Order status updated.');
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const formatTime = (timestamp: { toDate?: () => Date }) => {
    if (!timestamp?.toDate) return '--';
    const d = timestamp.toDate();
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const stationLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      done: 'Done',
    };
    return labels[status] ?? status;
  };

  if (loading) return <LoadingSpinner />;

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentOptions: { value: PaymentFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
  ];

  const dateOptions: { value: DatePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Orders</h1>
        <span className={styles.orderCount}>{filteredOrders.length} orders</span>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Date</span>
          {dateOptions.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.pill} ${datePreset === opt.value ? styles.pillActive : ''}`}
              onClick={() => { setDatePreset(opt.value); setPage(0); }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {datePreset === 'custom' && (
          <div className={styles.customDateRow}>
            <input
              type="date"
              className={styles.dateInput}
              value={customFrom}
              onChange={(e) => { setCustomFrom(e.target.value); setPage(0); }}
            />
            <span className={styles.dateSep}>to</span>
            <input
              type="date"
              className={styles.dateInput}
              value={customTo}
              onChange={(e) => { setCustomTo(e.target.value); setPage(0); }}
            />
          </div>
        )}

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status</span>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.pill} ${statusFilter === opt.value ? styles.pillActive : ''}`}
                onClick={() => { setStatusFilter(opt.value); setPage(0); }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Payment</span>
            {paymentOptions.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.pill} ${paymentFilter === opt.value ? styles.pillActive : ''}`}
                onClick={() => { setPaymentFilter(opt.value); setPage(0); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>No orders match the filters.</div>
      ) : (
        <>
          {pagedGroups.map((group) => (
            <div key={group.date}>
              <div className={styles.dateHeader}>{group.date}</div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Type</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Prep</th>
                    <th>Kitchen</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {group.orders.map((order) => (
                    <Fragment key={order.id}>
                      <tr
                        onClick={() =>
                          setExpandedId(expandedId === order.id ? null : order.id)
                        }
                      >
                        <td>#{order.orderNumber}</td>
                        <td>{order.type}</td>
                        <td>{order.items?.length ?? 0}</td>
                        <td>{'\u20B1'}{order.total?.toFixed(2)}</td>
                        <td>{order.paymentMethod ?? '--'}</td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td>{stationLabel(order.prepStatus)}</td>
                        <td>{stationLabel(order.kitchenStatus)}</td>
                        <td>{formatTime(order.createdAt)}</td>
                      </tr>
                      {expandedId === order.id && (
                        <tr className={styles.expandedRow}>
                          <td colSpan={9}>
                            <div className={styles.expandedContent}>
                              <div className={styles.expandedTitle}>Order Details</div>
                              <div className={styles.orderItems}>
                                {order.items?.map((item, i) => (
                                  <div key={i} className={styles.orderItem}>
                                    <span>
                                      {item.quantity}x {item.name}
                                      {item.variant ? ` (${item.variant})` : ''}
                                    </span>
                                    <span>{'\u20B1'}{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <span className={styles.filterLabel}>Override Status: </span>
                                <select
                                  className={styles.statusSelect}
                                  value={order.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      order.id,
                                      e.target.value as OrderStatus
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="new">New</option>
                                  <option value="preparing">Preparing</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>chevron_left</span>
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
