import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import styles from './QRGenerator.module.css';

const MOBILE_URL = `${window.location.origin}/m`;

export default function QRGenerator() {
  const navigate = useNavigate();
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MOBILE_URL);
      toast.success('URL copied!');
    } catch {
      toast.error('Failed to copy');
    }
  }, []);

  const handleDownload = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      const link = document.createElement('a');
      link.download = 'joe-street-kiosk-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="/images/logo.png" alt="Joe Street" className={styles.logo} />
        <span className={styles.headerTitle}>QR Code Generator</span>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </button>
      </header>

      <div className={styles.body}>
        <div className={styles.leftSide}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Customer Mobile Order QR Code</h1>
            <p className={styles.subtitle}>
              Print this QR code and place it on your counter or tables.
              Customers scan it to order from their phone (location-verified).
            </p>
          </div>

          <div className={styles.urlCard}>
            <label className={styles.urlLabel}>Mobile Order URL</label>
            <div className={styles.urlRow}>
              <div className={styles.urlInput}>
                <span className={styles.urlText}>{MOBILE_URL}</span>
              </div>
              <button className={styles.copyBtn} onClick={handleCopy}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>content_copy</span>
                Copy
              </button>
            </div>
          </div>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'var(--color-success)' }}>check_circle</span>
              <span>One-time generation — same QR code every day</span>
            </div>
            <div className={styles.infoItem}>
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'var(--color-success)' }}>check_circle</span>
              <span>Location-verified — only works within 100m of the cafe</span>
            </div>
            <div className={styles.infoItem}>
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'var(--color-success)' }}>check_circle</span>
              <span>Store-aware — shows "closed" screen when POS is off</span>
            </div>
          </div>
        </div>

        <div className={styles.rightSide}>
          <div className={styles.qrCard}>
            <div className={styles.qrFrame} ref={qrRef}>
              <QRCodeSVG value={MOBILE_URL} size={240} level="H" />
            </div>
            <span className={styles.qrLabel}>Joe Street Cafe</span>
            <span className={styles.qrSubLabel}>Scan to order</span>
          </div>

          <div className={styles.btnGroup}>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>download</span>
              Download QR Image
            </button>
            <button className={styles.printBtn} onClick={handlePrint}>
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>print</span>
              Print QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
