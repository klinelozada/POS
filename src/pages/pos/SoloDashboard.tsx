import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import styles from './SoloDashboard.module.css';

const menuSlides = [
  ['/images/menu-pages/menu_page_1.png', '/images/menu-pages/menu_page_2.png'],
  ['/images/menu-pages/menu_page_3.png', '/images/menu-pages/menu_page_4.png'],
  ['/images/menu-pages/menu_page_5.png', '/images/menu-pages/menu_page_6.png'],
  ['/images/menu-pages/menu_page_7.png', '/images/menu-pages/menu_page_8.png'],
  ['/images/menu-pages/menu_page_9.png'],
];

export default function SoloDashboard() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [slideIndex, setSlideIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const activeOrders = orders.filter((o) => o.status === 'new' || o.status === 'preparing');

  useEffect(() => {
    if (activeOrders.length > 0) {
      navigate('/pos/solo/counter', { replace: true });
    }
  }, [activeOrders, navigate]);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % menuSlides.length);
        setFadeIn(true);
      }, 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = menuSlides[slideIndex];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <span className={styles.badge}>SOLO</span>
        <span className={styles.spacer} />
        <button className={styles.switchBtn} onClick={() => navigate('/pos/qr')}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>qr_code</span>
          QR Code
        </button>
        <button className={styles.switchBtn} onClick={() => {
          sessionStorage.setItem('soloMode', 'true');
          navigate('/kiosk/welcome');
        }}>
          Switch to Kiosk
        </button>
        <button className={styles.closeBtn} onClick={() => navigate('/pos/close')}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>power_settings_new</span>
          Close Store
        </button>
      </div>
      <div className={styles.body}>
        <div className={`${styles.slider} ${fadeIn ? styles.sliderVisible : styles.sliderHidden}`}>
          {currentSlide.map((src, i) => (
            <img key={`${slideIndex}-${i}`} src={src} alt={`Menu page`} className={styles.slideImg} />
          ))}
        </div>
        <div className={styles.sliderDots}>
          {menuSlides.map((_, i) => (
            <span
              key={i}
              className={i === slideIndex ? styles.sliderDotActive : styles.sliderDot}
              onClick={() => { setFadeIn(false); setTimeout(() => { setSlideIndex(i); setFadeIn(true); }, 300); }}
            />
          ))}
        </div>
        <div className={styles.overlay}>
          <div className={styles.noOrdersText}>No Active Orders</div>
          <div className={styles.dots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>
    </div>
  );
}
