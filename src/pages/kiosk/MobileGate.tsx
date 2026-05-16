import { useState, useEffect, useCallback } from 'react';
import { getCurrentPosition, isWithinCafe } from '../../utils/geolocation';
import { isBanned, getBanExpiry, recordFailedAttempt, getRemainingAttempts, resetAttempts } from '../../utils/rateLimiter';
import styles from './MobileGate.module.css';

type Step = 'welcome' | 'checking' | 'approved' | 'denied' | 'error' | 'banned';

interface Props {
  children: React.ReactNode;
}

export default function MobileGate({ children }: Props) {
  const [step, setStep] = useState<Step>(() => isBanned() ? 'banned' : 'welcome');
  const [distance, setDistance] = useState(0);
  const [remaining, setRemaining] = useState(() => getRemainingAttempts());
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [passed, setPassed] = useState(false);
  const [banExpiry, setBanExpiry] = useState<Date | null>(() => getBanExpiry());

  const checkLocation = useCallback(async () => {
    setStep('checking');
    try {
      const position = await getCurrentPosition();
      const result = isWithinCafe(position.coords.latitude, position.coords.longitude);
      setDistance(result.distance);

      if (result.allowed) {
        resetAttempts();
        setStep('approved');
      } else {
        const attempt = recordFailedAttempt();
        setRemaining(attempt.remaining);
        if (attempt.banned) {
          setBanExpiry(getBanExpiry());
          setStep('banned');
        } else {
          setStep('denied');
        }
      }
    } catch (err) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr.code === 1) {
        setErrorMsg('Location permission denied. Please allow location access to order.');
      } else if (geoErr.code === 2) {
        setErrorMsg('Unable to determine your location.');
      } else {
        setErrorMsg('Location check timed out. Please try again.');
      }
      setStep('error');
    }
  }, []);

  // Auto-redirect countdown after approved
  useEffect(() => {
    if (step !== 'approved') return;
    if (countdown <= 0) {
      setPassed(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (passed) return <>{children}</>;

  if (step === 'welcome') {
    return (
      <div className={styles.container}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <div className={styles.tagline}>CAFE & STUDY LOUNGE</div>
        <div className={styles.divider} />
        <div className={styles.greeting}>Welcome!</div>
        <div className={styles.subtitle}>
          We're glad you're here.{'\n'}Let's get your order started.
        </div>
        <div style={{ height: 32 }} />
        <button className={styles.primaryBtn} onClick={checkLocation}>
          Start Ordering
        </button>
        <div className={styles.disclaimer}>
          By continuing, we'll check your location{'\n'}to verify you're at the cafe.
        </div>
      </div>
    );
  }

  if (step === 'checking') {
    return (
      <div className={styles.container}>
        <div className={styles.pulseOuter}>
          <div className={styles.pulseInner}>
            <span className="material-symbols-rounded" style={{ fontSize: 36, color: 'var(--color-accent-primary)' }}>
              my_location
            </span>
          </div>
        </div>
        <div className={styles.checkTitle}>Checking Your Location</div>
        <div className={styles.subtitle}>
          We're verifying that you're at{'\n'}Joe Street Cafe right now.
        </div>
        <div className={styles.dots}>
          <span className={styles.dot1} />
          <span className={styles.dot2} />
          <span className={styles.dot3} />
        </div>
        <div className={styles.hint}>
          This helps us prevent fake orders{'\n'}and keep the experience great for everyone.
        </div>
      </div>
    );
  }

  if (step === 'approved') {
    return (
      <div className={styles.container}>
        <div className={styles.checkCircle}>
          <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#fff' }}>check</span>
        </div>
        <div className={styles.approvedTitle}>You're All Set!</div>
        <div className={styles.subtitle}>
          Welcome to Joe Street Cafe.{'\n'}You're verified and ready to order.
        </div>
        <img src="/images/logo.png" alt="Joe Street" className={styles.smallLogo} />
        <div style={{ height: 16 }} />
        <button className={styles.primaryBtn} onClick={() => setPassed(true)}>
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>menu_book</span>
          Browse Menu
        </button>
        <div className={styles.autoRedirect}>
          You'll be redirected automatically in {countdown}s...
        </div>
      </div>
    );
  }

  if (step === 'denied') {
    return (
      <div className={styles.container}>
        <span className="material-symbols-rounded" style={{ fontSize: 56, color: 'var(--color-accent-primary)' }}>
          location_off
        </span>
        <div className={styles.deniedTitle}>You're Too Far Away</div>
        <div className={styles.subtitle}>
          Online ordering is only available{'\n'}when you're at Joe Street Cafe.
        </div>
        <div className={styles.distBadge}>
          You are ~{distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance}m`} away
        </div>
        <div className={styles.hint}>
          Please visit us at{'\n'}Sitio Malinong East, Brgy. Layog,{'\n'}Maasin, Iloilo
        </div>
        <button className={styles.primaryBtn} onClick={checkLocation}>
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>refresh</span>
          Check Again
        </button>
        <div className={styles.attempts}>
          {remaining} of {3} attempts remaining
        </div>
      </div>
    );
  }

  if (step === 'banned') {
    return (
      <div className={styles.container}>
        <span className="material-symbols-rounded" style={{ fontSize: 56, color: 'var(--color-error)' }}>
          block
        </span>
        <div className={styles.deniedTitle}>Access Temporarily Blocked</div>
        <div className={styles.subtitle}>
          Too many failed location checks.{'\n'}Please try again later.
        </div>
        {banExpiry && (
          <div className={styles.distBadge}>
            Access restores at {banExpiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        <div className={styles.hint}>
          Visit Joe Street Cafe in person{'\n'}to place your order.
        </div>
      </div>
    );
  }

  // error
  return (
    <div className={styles.container}>
      <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'var(--color-error)' }}>
        error
      </span>
      <div className={styles.deniedTitle}>Location Required</div>
      <div className={styles.subtitle}>{errorMsg}</div>
      <button className={styles.primaryBtn} onClick={checkLocation}>
        Try Again
      </button>
    </div>
  );
}
