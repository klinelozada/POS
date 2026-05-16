import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';

export default function PosLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-resume: if already authenticated (e.g., app restart), go to last route
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const lastRoute = localStorage.getItem('posLastRoute');
      navigate(lastRoute || '/pos/mode', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      const target = sessionStorage.getItem('posLoginRedirect') ?? localStorage.getItem('posLastRoute') ?? '/pos/mode';
      sessionStorage.removeItem('posLoginRedirect');
      navigate(target);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.leftLogo} />
      </div>
      <div className={styles.right}>
        <div className={styles.formTitle}>POS Station Login</div>
        <div className={styles.formSubtitle}>Sign in to access the point of sale</div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <div className={styles.fieldLabel}>Email</div>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
          <div>
            <div className={styles.fieldLabel}>Password</div>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitBtn} disabled={loading || !email || !password}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button
          className={styles.clearCacheBtn}
          onClick={async () => {
            try {
              if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
              }
              if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map((r) => r.unregister()));
              }
              sessionStorage.clear();
              localStorage.removeItem('posLastRoute');
            } catch { /* ignore */ }
            window.location.reload();
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>refresh</span>
          Clear Cache & Reload
        </button>
      </div>
    </div>
  );
}
