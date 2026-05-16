import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useBasePath } from '../../hooks/useBasePath';
import { getCustomerOrderIds } from '../../utils/customerSession';
import { getSettings } from '../../services/adminService';
import styles from './Intro.module.css';

const menuSlides = [
  '/images/menu-pages/Joe Street Coffee Menu.jpg',
  '/images/menu-pages/Joe Street Chocolate Menu.jpg',
  '/images/menu-pages/Joe Street Milk Tea Menu.jpg',
  '/images/menu-pages/Joe Street Milk Tea Menu (2).jpg',
  '/images/menu-pages/Joe Street Milk Tea Menu (3).jpg',
  '/images/menu-pages/6.jpg',
  '/images/menu-pages/7.jpg',
  '/images/menu-pages/8.jpg',
  '/images/menu-pages/9.jpg',
];

const DEFAULT_URL = `${window.location.origin}/m`;

export default function Intro() {
  const navigate = useNavigate();
  const base = useBasePath();
  const [slideIndex, setSlideIndex] = useState(0);
  const [mobileUrl, setMobileUrl] = useState(DEFAULT_URL);
  const hasOrders = getCustomerOrderIds().length > 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % menuSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getSettings().then((s) => {
      if (s?.mobileOrderUrl) setMobileUrl(s.mobileOrderUrl);
    });
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={styles.slideBg}
        style={{ backgroundImage: `url(${menuSlides[slideIndex]})` }}
      />
      <div className={styles.overlay} />

      <div className={styles.twoCol}>
        {/* Left: Welcome + tap to order */}
        <div className={styles.leftCol} onClick={() => navigate(`${base}/welcome`)}>
          <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
          <div className={styles.tagline}>CAFE &amp; STUDY LOUNGE</div>
          <div className={styles.divider} />
          <div className={styles.prompt}>Tap here to start ordering</div>
          {hasOrders && (
            <button
              className={styles.myOrdersBtn}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${base}/my-orders`);
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>receipt_long</span>
              My Orders
            </button>
          )}
        </div>

        {/* Divider line */}
        <div className={styles.colDivider} />

        {/* Right: QR code for phone ordering */}
        <div className={styles.rightCol}>
          <div className={styles.qrTitle}>Order from your phone</div>
          <div className={styles.qrSubtitle}>
            Scan this QR code to browse the menu and place your order directly from your device.
          </div>
          <div className={styles.qrFrame}>
            <QRCodeSVG value={mobileUrl} size={200} level="H" />
          </div>
          <div className={styles.qrHint}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>smartphone</span>
            Point your camera at the code
          </div>
        </div>
      </div>
    </div>
  );
}
