import styles from './OutOfRange.module.css';

interface Props {
  distance: number;
  onRetry: () => void;
}

export default function OutOfRange({ distance, onRetry }: Props) {
  return (
    <div className={styles.container}>
      <span className="material-symbols-rounded" style={{ fontSize: 64, color: 'var(--color-accent-primary)' }}>
        location_off
      </span>
      <div className={styles.title}>You're Too Far Away</div>
      <div className={styles.subtitle}>
        Online ordering is only available when you're at Joe Street Cafe.
      </div>
      <div className={styles.distance}>
        You are approximately <strong>{distance}m</strong> away from the cafe.
      </div>
      <div className={styles.hint}>
        Please visit us at Sitio Malinong East, Brgy. Layog, Maasin, Iloilo to place your order.
      </div>
      <button className={styles.retryBtn} onClick={onRetry}>
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>refresh</span>
        Check Again
      </button>
    </div>
  );
}
