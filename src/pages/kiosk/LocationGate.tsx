import { useState, useEffect, useCallback } from 'react';
import { getCurrentPosition, isWithinCafe } from '../../utils/geolocation';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import OutOfRange from './OutOfRange';

type Status = 'checking' | 'allowed' | 'denied' | 'error';

interface Props {
  children: React.ReactNode;
}

export default function LocationGate({ children }: Props) {
  const [status, setStatus] = useState<Status>('checking');
  const [distance, setDistance] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const checkLocation = useCallback(async () => {
    setStatus('checking');
    try {
      const position = await getCurrentPosition();
      const result = isWithinCafe(position.coords.latitude, position.coords.longitude);
      setDistance(result.distance);
      setStatus(result.allowed ? 'allowed' : 'denied');
    } catch (err) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr.code === 1) {
        setErrorMsg('Location permission denied. Please allow location access to order.');
      } else if (geoErr.code === 2) {
        setErrorMsg('Unable to determine your location. Please check your device settings.');
      } else {
        setErrorMsg('Location check timed out. Please try again.');
      }
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    checkLocation();
  }, [checkLocation]);

  if (status === 'checking') {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--color-warm-cream)',
      }}>
        <LoadingSpinner />
        <div style={{ fontSize: 14, color: 'var(--color-foreground-secondary)' }}>
          Checking your location...
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 32,
        background: 'var(--color-warm-cream)',
        textAlign: 'center',
      }}>
        <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'var(--color-error)' }}>
          error
        </span>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-foreground-primary)' }}>
          Location Required
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-foreground-secondary)', maxWidth: 360 }}>
          {errorMsg}
        </div>
        <button
          onClick={checkLocation}
          style={{
            marginTop: 8,
            padding: '12px 32px',
            background: 'var(--color-accent-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 9999,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (status === 'denied') {
    return <OutOfRange distance={distance} onRetry={checkLocation} />;
  }

  return <>{children}</>;
}
