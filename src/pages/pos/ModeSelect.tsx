import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getStoreStatus } from '../../services/storeService';
import styles from './ModeSelect.module.css';

type StationMode = 'solo' | 'dual' | 'full-team';

export default function ModeSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [storeOpen, setStoreOpen] = useState<boolean | null>(null);

  useEffect(() => {
    getStoreStatus().then((s) => setStoreOpen(s.isOpen));
  }, []);

  const handleSelect = (mode: StationMode) => {
    localStorage.setItem('posStationMode', mode);
    if (!storeOpen) {
      navigate('/pos/open');
    } else if (mode === 'solo') {
      navigate('/pos/solo');
    } else {
      navigate('/pos/station');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <span className={styles.headerSpacer} />
        <span className={styles.userName}>{user?.email ?? 'Staff'}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>Select Station Mode</div>
        <div className={styles.cards}>
          <div className={styles.cardSelected} onClick={() => handleSelect('solo')}>
            <div className={styles.cardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className={styles.cardTitle}>Solo Mode</div>
            <div className={styles.cardSubtitle}>Everything on 1 tablet. Perfect for small operations.</div>
            <div className={styles.cardBadge}>1 Tablet</div>
          </div>
          <div className={styles.card} onClick={() => handleSelect('dual')}>
            <div className={styles.cardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className={styles.cardTitle}>Dual Mode</div>
            <div className={styles.cardSubtitle}>Kiosk + POS counter on 2 tablets.</div>
            <div className={styles.cardBadge}>2 Tablets</div>
          </div>
          <div className={styles.card} onClick={() => handleSelect('full-team')}>
            <div className={styles.cardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className={styles.cardTitle}>Full Team Mode</div>
            <div className={styles.cardSubtitle}>All stations: Kiosk, POS, Display, Prep, Kitchen.</div>
            <div className={styles.cardBadge}>5 Stations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
