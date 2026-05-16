import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openStore } from '../../services/storeService';
import toast from 'react-hot-toast';
import styles from './OpenStore.module.css';

const quickAmounts = [500, 1000, 2000, 5000];

export default function OpenStore() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;

  const handleOpen = async () => {
    if (parsedAmount <= 0) {
      toast.error('Enter an opening cash amount');
      return;
    }
    setLoading(true);
    try {
      await openStore(parsedAmount);
      toast.success('Store opened!');
      const mode = localStorage.getItem('posStationMode');
      navigate(mode === 'solo' ? '/pos/solo' : '/pos/dashboard', { replace: true });
    } catch {
      toast.error('Failed to open store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <div className={styles.headerRight}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Store Closed</span>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.iconCircle}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#fff' }}>storefront</span>
        </div>

        <h1 className={styles.title}>Open Store</h1>
        <p className={styles.subtitle}>Enter the opening cash to start today's session.</p>

        <div className={styles.formCard}>
          <label className={styles.fieldLabel}>Opening Cash Amount</label>
          <div className={styles.inputFrame}>
            <span className={styles.pesoSign}>₱</span>
            <input
              type="number"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>
          <div className={styles.quickAmounts}>
            {quickAmounts.map((qa) => (
              <button key={qa} className={styles.quickBtn} onClick={() => setAmount(String(qa))}>
                ₱{qa.toLocaleString()}
              </button>
            ))}
          </div>
          <button className={styles.openBtn} onClick={handleOpen} disabled={loading || parsedAmount <= 0}>
            {loading ? 'Opening...' : 'Open Store'}
          </button>
        </div>

        <p className={styles.dateInfo}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' \u2022 '}
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
