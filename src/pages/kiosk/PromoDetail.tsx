import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMenu } from '../../hooks/useMenu';
import { useCartStore } from '../../stores/cartStore';
import { useBasePath } from '../../hooks/useBasePath';
import { getPromos } from '../../services/adminService';
import { getMenuItemImage } from '../../utils/menuImages';
import type { Promo } from '../../types';
import styles from './PromoDetail.module.css';

export default function PromoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const base = useBasePath();
  const { menuItems } = useMenu();
  const addPromoItems = useCartStore((s) => s.addPromoItems);

  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getPromos().then((promos) => {
      const found = promos.find((p) => p.id === id);
      setPromo(found ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return null;
  if (!promo) {
    navigate(`${base}/menu`, { replace: true });
    return null;
  }

  const eligibleItems = menuItems.filter(
    (m) => promo.eligibleItems.includes(m.id) && m.isAvailable
  );

  const selectedItem = selectedItemId ? eligibleItems.find((m) => m.id === selectedItemId) : null;

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const promoGroupId = `${promo.id}_${Date.now()}`;

    // For BOGO: add 2 of the same item — first at promo price, second free
    addPromoItems([
      {
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        variant: '',
        quantity: 1,
        price: promo.promoPrice,
        addOns: [],
        station: selectedItem.station,
        promoId: promoGroupId,
        promoName: promo.name,
      },
      {
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        variant: '',
        quantity: 1,
        price: 0,
        addOns: [],
        station: selectedItem.station,
        promoId: promoGroupId,
        promoName: promo.name,
        isFreeItem: true,
      },
    ]);

    setAdded(true);
    setTimeout(() => {
      navigate(`${base}/menu?cat=__promos`, { replace: true });
    }, 1000);
  };

  if (added) {
    return (
      <div className={styles.container}>
        <div className={styles.addedCheck}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#4CAF50' }}>check_circle</span>
        </div>
        <div className={styles.addedText}>Added to cart!</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-symbols-rounded" style={{ fontSize: 24 }}>arrow_back</span>
        </button>
        <span className={styles.headerTitle}>{promo.name}</span>
      </div>

      {/* Poster */}
      {promo.poster && (
        <img src={promo.poster} alt={promo.name} className={styles.poster} />
      )}

      {/* Info */}
      <div className={styles.promoInfo}>
        <div className={styles.promoName}>{promo.name}</div>
        <div className={styles.promoPrice}>{'\u20B1'}{promo.promoPrice.toFixed(2)}</div>
        {promo.description && (
          <div className={styles.promoDesc}>{promo.description}</div>
        )}
        {promo.type === 'bogo' && (
          <div className={styles.promoBadge}>Buy 1 Take 1</div>
        )}
      </div>

      {/* Select item */}
      <div className={styles.selectSection}>
        <div className={styles.selectLabel}>Choose your item:</div>
        <div className={styles.itemGrid}>
          {eligibleItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.itemCard} ${selectedItemId === item.id ? styles.itemCardSelected : ''}`}
              onClick={() => setSelectedItemId(item.id)}
            >
              <div className={styles.itemPhoto}>
                {(item.photo || getMenuItemImage(item.name)) ? (
                  <img src={item.photo || getMenuItemImage(item.name)} alt={item.name} />
                ) : (
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: 'var(--color-foreground-muted)' }}>
                    local_cafe
                  </span>
                )}
              </div>
              <div className={styles.itemName}>{item.name}</div>
              {selectedItemId === item.id && (
                <span className={styles.checkMark}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>check</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add to cart */}
      <div className={styles.footer}>
        <button
          className={styles.addBtn}
          disabled={!selectedItem}
          onClick={handleAddToCart}
        >
          Add to Cart — {'\u20B1'}{promo.promoPrice.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
