import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyPin } from '../../services/authService';
import styles from './PinLogin.module.css';

interface PinLoginProps {
  stationName: string;
  redirectTo: string;
}

export default function PinLogin({ stationName, redirectTo }: PinLoginProps) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDigit = useCallback((digit: string) => {
    setError('');
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const newPin = prev + digit;
      if (newPin.length === 4) {
        // Auto-submit
        setLoading(true);
        verifyPin(newPin).then((user) => {
          if (user) {
            sessionStorage.setItem('stationUser', JSON.stringify(user));
            navigate(redirectTo);
          } else {
            setError('Invalid PIN. Please try again.');
            setPin('');
          }
          setLoading(false);
        });
      }
      return newPin;
    });
  }, [navigate, redirectTo]);

  const handleBackspace = () => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError('');
    setPin('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.leftLogo} />
        <div className={styles.leftStation}>{stationName}</div>
      </div>
      <div className={styles.right}>
        <div className={styles.title}>Enter your PIN</div>
        <div className={styles.pinDisplay}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={i < pin.length ? styles.pinDotFilled : styles.pinDot}
            />
          ))}
        </div>
        <div className={styles.numpad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              className={styles.numBtn}
              onClick={() => handleDigit(d)}
              disabled={loading}
            >
              {d}
            </button>
          ))}
          <button className={styles.numBtnIcon} onClick={handleClear} disabled={loading}>
            C
          </button>
          <button
            className={styles.numBtn}
            onClick={() => handleDigit('0')}
            disabled={loading}
          >
            0
          </button>
          <button className={styles.numBtnIcon} onClick={handleBackspace} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {loading && <div className={styles.loading}>Verifying...</div>}
      </div>
    </div>
  );
}
