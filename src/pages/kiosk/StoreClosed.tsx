import styles from './StoreClosed.module.css';

export default function StoreClosed() {
  return (
    <div className={styles.container}>
      <img src="/images/logo.png" alt="Joe Street Cafe" className={styles.logo} />

      <div className={styles.iconCircle}>
        <span className="material-symbols-rounded" style={{ fontSize: 56, color: 'var(--color-accent-primary)' }}>schedule</span>
      </div>

      <div className={styles.textGroup}>
        <h1 className={styles.title}>We're Currently Closed</h1>
        <p className={styles.subtitle}>
          Thank you for visiting Joe Street Cafe!
          <br />
          We'll be back soon to serve you.
        </p>
      </div>

      <div className={styles.hoursCard}>
        <div className={styles.hoursHeader}>
          <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'var(--color-accent-primary)' }}>storefront</span>
          <span className={styles.hoursTitle}>Store Hours</span>
        </div>
        <div className={styles.hoursDivider} />
        <div className={styles.hoursRow}>
          <span>Monday – Saturday</span>
          <span className={styles.hoursTime}>8:00 AM – 9:00 PM</span>
        </div>
        <div className={styles.hoursRow}>
          <span>Sunday</span>
          <span className={styles.hoursTime}>9:00 AM – 6:00 PM</span>
        </div>
      </div>

      <p className={styles.footer}>Sitio Malinong East, Brgy. Layog, Maasin, Iloilo</p>
    </div>
  );
}
