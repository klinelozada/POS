import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';

export default function PosLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Check if there's a redirect target
      const target = sessionStorage.getItem('posLoginRedirect') ?? '/pos/mode';
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
      </div>
    </div>
  );
}
