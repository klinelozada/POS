import { useState, useEffect } from 'react';
import { getSettings, updateSettings, setPin, type PinType } from '../../services/adminService';
import { getCategories } from '../../services/menuService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Category, StationType } from '../../types';
import styles from './Settings.module.css';
import toast from 'react-hot-toast';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // General
  const [cafeName, setCafeName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [mobileOrderUrl, setMobileOrderUrl] = useState('');

  // Order settings
  const [orderNumber, setOrderNumber] = useState('0');

  // Station routing
  const [routing, setRouting] = useState<Record<string, StationType>>({});

  // Station PINs
  const [pins, setPins] = useState<Record<PinType, string>>({
    adminPin: '',
    kioskPin: '',
    prepPin: '',
    kitchenPin: '',
  });
  const [savingPinType, setSavingPinType] = useState<PinType | null>(null);

  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingRouting, setSavingRouting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [settings, cats] = await Promise.all([
        getSettings(),
        getCategories(),
      ]);
      setCategories(cats);

      if (settings) {
        setCafeName(settings.cafeInfo?.name ?? '');
        setAddress(settings.cafeInfo?.address ?? '');
        setPhone(settings.cafeInfo?.phone ?? '');
        setMobileOrderUrl(settings.mobileOrderUrl ?? '');
        setOrderNumber((settings.currentOrderNumber ?? 0).toString());
        setRouting(settings.stationRouting ?? {});
        setPins({
          adminPin: settings.adminPin ?? '',
          kioskPin: settings.kioskPin ?? '',
          prepPin: settings.prepPin ?? '',
          kitchenPin: settings.kitchenPin ?? '',
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      await updateSettings({
        cafeInfo: {
          name: cafeName.trim(),
          address: address.trim(),
          phone: phone.trim(),
        },
        ...(mobileOrderUrl.trim() ? { mobileOrderUrl: mobileOrderUrl.trim() } : {}),
      });
      toast.success('General settings saved.');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      await updateSettings({
        currentOrderNumber: parseInt(orderNumber) || 0,
      });
      toast.success('Order settings saved.');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleRoutingChange = (catId: string, station: StationType) => {
    setRouting({ ...routing, [catId]: station });
  };

  const handleSaveRouting = async () => {
    setSavingRouting(true);
    try {
      await updateSettings({ stationRouting: routing });
      toast.success('Station routing saved.');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSavingRouting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      {/* General */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>General</h2>
        <div className={styles.field}>
          <label className={styles.label}>Cafe Name</label>
          <input
            className={styles.input}
            value={cafeName}
            onChange={(e) => setCafeName(e.target.value)}
            placeholder="Joe Street Cafe"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Address</label>
          <input
            className={styles.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Phone</label>
          <input
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Mobile Order URL</label>
          <input
            className={styles.input}
            value={mobileOrderUrl}
            onChange={(e) => setMobileOrderUrl(e.target.value)}
            placeholder="https://brandserps-demo.web.app/m"
          />
          <span className={styles.pinDesc}>QR code URL for customer mobile ordering. Leave empty to use current domain.</span>
        </div>
        <div className={styles.saveRow}>
          <Button size="sm" onClick={handleSaveGeneral} disabled={savingGeneral}>
            {savingGeneral ? 'Saving...' : 'Save General'}
          </Button>
        </div>
      </div>

      {/* Order Settings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Order Settings</h2>
        <div className={styles.field}>
          <label className={styles.label}>Current Order Number Counter</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>
        <div className={styles.saveRow}>
          <Button size="sm" onClick={handleSaveOrder} disabled={savingOrder}>
            {savingOrder ? 'Saving...' : 'Save Order Settings'}
          </Button>
        </div>
      </div>

      {/* Station Routing */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Station Routing</h2>
        {categories.length === 0 ? (
          <div className={styles.placeholder}>
            No categories to configure routing for.
          </div>
        ) : (
          <table className={styles.routingTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Station</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>
                    <select
                      className={styles.routingSelect}
                      value={routing[cat.id] ?? cat.defaultStation}
                      onChange={(e) =>
                        handleRoutingChange(cat.id, e.target.value as StationType)
                      }
                    >
                      <option value="prep">Prep</option>
                      <option value="kitchen">Kitchen</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className={styles.saveRow}>
          <Button size="sm" onClick={handleSaveRouting} disabled={savingRouting}>
            {savingRouting ? 'Saving...' : 'Save Routing'}
          </Button>
        </div>
      </div>

      {/* Station PINs */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Station PINs</h2>
        <p className={styles.sectionDesc}>
          4-digit PINs for securing access to each station. Admin PIN is used for order modifications by non-admin staff.
        </p>
        {([
          { type: 'adminPin' as PinType, label: 'Admin PIN', desc: 'Required for non-admin staff to cancel/edit orders' },
          { type: 'kioskPin' as PinType, label: 'Kiosk PIN', desc: 'Unlock in-store kiosk tablets' },
          { type: 'prepPin' as PinType, label: 'Prep Station PIN', desc: 'Access prep counter display' },
          { type: 'kitchenPin' as PinType, label: 'Kitchen Station PIN', desc: 'Access kitchen counter display' },
        ]).map(({ type, label, desc }) => (
          <div key={type} className={styles.pinRow}>
            <div className={styles.pinInfo}>
              <label className={styles.label}>{label}</label>
              <span className={styles.pinDesc}>{desc}</span>
            </div>
            <div className={styles.pinInputGroup}>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pins[type]}
                onChange={(e) => setPins({ ...pins, [type]: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="1234"
                style={{ maxWidth: 140, letterSpacing: 8, textAlign: 'center', fontSize: 18, fontWeight: 700 }}
              />
              <Button size="sm" onClick={async () => {
                if (pins[type].length !== 4) { toast.error('PIN must be 4 digits'); return; }
                setSavingPinType(type);
                try {
                  await setPin(type, pins[type]);
                  toast.success(`${label} saved.`);
                } catch { toast.error('Failed to save.'); }
                finally { setSavingPinType(null); }
              }} disabled={savingPinType === type || pins[type].length !== 4}>
                {savingPinType === type ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* System */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>System</h2>
        <p className={styles.sectionDesc}>
          Use this to force the app to load the latest version. Clears all cached data and reloads.
        </p>
        <div className={styles.saveRow}>
          <Button size="sm" variant="secondary" onClick={async () => {
            try {
              // Clear service worker caches
              if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
              }
              // Unregister service workers
              if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map((r) => r.unregister()));
              }
              // Clear session storage
              sessionStorage.clear();
              // Clear POS session route
              localStorage.removeItem('posLastRoute');
              toast.success('Cache cleared. Reloading...');
              setTimeout(() => window.location.reload(), 500);
            } catch {
              window.location.reload();
            }
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>delete_sweep</span>
            Clear Cache & Reload
          </Button>
        </div>
      </div>

      {/* Printer & Payment */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Printer & Payment</h2>
        <div className={styles.placeholder}>
          Printer and payment configuration coming soon.
        </div>
      </div>
    </div>
  );
}
