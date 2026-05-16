import { useNavigate } from 'react-router-dom';
import styles from './StationSelect.module.css';

interface StationOption {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
}

const dualStations: StationOption[] = [
  { id: 'kiosk', name: 'Kiosk', description: 'Customer self-order', route: '/kiosk', icon: 'tablet' },
  { id: 'pos', name: 'POS Counter', description: 'Cashier station', route: '/pos/login', icon: 'register' },
];

const fullTeamStations: StationOption[] = [
  { id: 'kiosk', name: 'Kiosk', description: 'Customer self-order', route: '/kiosk', icon: 'tablet' },
  { id: 'cashier', name: 'POS Cashier', description: 'Take orders & payments', route: '/pos/login', icon: 'register' },
  { id: 'display', name: 'Customer Display', description: 'Order status screen', route: '/pos/customer-display', icon: 'monitor' },
  { id: 'prep', name: 'Prep Counter', description: 'Food preparation', route: '/prep/login', icon: 'prep' },
  { id: 'kitchen', name: 'Kitchen', description: 'Cooking station', route: '/kitchen/login', icon: 'kitchen' },
];

function StationIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'tablet':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'register':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'monitor':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'prep':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
        </svg>
      );
    case 'kitchen':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 018 6a4 4 0 014-4z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function StationSelect() {
  const navigate = useNavigate();
  const mode = localStorage.getItem('posStationMode') ?? 'dual';
  const stations = mode === 'full-team' ? fullTeamStations : dualStations;
  const modeLabel = mode === 'full-team' ? 'Full Team Mode' : 'Dual Mode';

  const handleSelect = (station: StationOption) => {
    // For POS Cashier, set redirect to dashboard after login
    if (station.id === 'cashier' || station.id === 'pos') {
      sessionStorage.setItem('posLoginRedirect', '/pos/dashboard');
    }
    navigate(station.route);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <span className={styles.headerSpacer} />
        <span className={styles.backLink} onClick={() => navigate('/pos/mode')}>
          Back to Mode Select
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>Select This Tablet's Station</div>
        <div className={styles.subtitle}>{modeLabel} &mdash; Choose the role for this device</div>
        <div className={styles.cards}>
          {stations.map((station) => (
            <div
              key={station.id}
              className={styles.card}
              onClick={() => handleSelect(station)}
            >
              <div className={styles.cardIcon}>
                <StationIcon icon={station.icon} />
              </div>
              <div className={styles.cardName}>{station.name}</div>
              <div className={styles.cardDesc}>{station.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
