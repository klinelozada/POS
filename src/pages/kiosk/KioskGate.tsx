import { useState, type ReactNode } from 'react';
import { verifyPin } from '../../services/adminService';
import styles from './KioskGate.module.css';

interface Props {
  children: ReactNode;
}

export default function KioskGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('kioskUnlocked') === 'true');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  if (unlocked) return <>{children}</>;

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    setChecking(true);
    setError('');
    const valid = await verifyPin('kioskPin', pin);
    if (valid) {
      sessionStorage.setItem('kioskUnlocked', 'true');
      setUnlocked(true);
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
    setChecking(false);
  };

  return (
    <div className={styles.container}>
      <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
      <div className={styles.title}>Kiosk Access</div>
      <div className={styles.subtitle}>Enter the kiosk PIN to unlock this tablet.</div>
      <input
        className={styles.pinInput}
        type="tel"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="----"
        autoFocus
      />
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.unlockBtn} onClick={handleSubmit} disabled={pin.length !== 4 || checking}>
        {checking ? 'Checking...' : 'Unlock'}
      </button>
    </div>
  );
}
