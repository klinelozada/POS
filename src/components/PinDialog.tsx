import { useState } from 'react';
import { verifyAdminPin } from '../services/adminService';
import styles from './PinDialog.module.css';

interface PinDialogProps {
  onVerified: () => void;
  onCancel: () => void;
}

export default function PinDialog({ onVerified, onCancel }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (pin.length !== 4) return;
    setVerifying(true);
    setError('');
    const valid = await verifyAdminPin(pin);
    if (valid) {
      onVerified();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
    setVerifying(false);
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Admin PIN Required</h3>
        <p className={styles.subtitle}>Enter the 4-digit admin PIN to continue.</p>
        <input
          className={styles.pinInput}
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 4);
            setPin(v);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          autoFocus
        />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.verifyBtn} onClick={handleVerify} disabled={pin.length !== 4 || verifying}>
            {verifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}
