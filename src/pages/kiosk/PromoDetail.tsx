import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMenu } from '../../hooks/useMenu';
import { useCartStore } from '../../stores/cartStore';
import { useBasePath } from '../../hooks/useBasePath';
import { getPromos } from '../../services/adminService';
import { getMenuItemImage } from '../../utils/menuImages';
import type { Promo, MenuItem } from '../../types';
import styles from './PromoDetail.module.css';

export default function PromoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const base = useBasePath();
  const { menuItems } = useMenu();
  const addPromoItems = useCartStore((s) => s.addPromoItems);

  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTakeId, setSelectedTakeId] = useState<string | null>(null);
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

  const mainItem = menuItems.find((m) => m.id === promo.mainItemId);
  const takeItems = menuItems.filter(
    (m) => promo.takeItemIds.includes(m.id) && m.isAvailable
  );

  const selectedTakeItem = selectedTakeId ? takeItems.find((m) => m.id === selectedTakeId) : null;

  const getItemImage = (item: MenuItem) => item.photo || getMenuItemImage(item.name);

  const handleAddToCart = () => {
    if (!mainItem || !selectedTakeItem) return;

    const promoGroupId = `${promo.id}_${Date.now()}`;

    addPromoItems([
      {
        menuItemId: mainItem.id,
        name: mainItem.name,
        variant: '',
        quantity: 1,
        price: promo.promoPrice,
        addOns: [],
        station: mainItem.station,
        promoId: promoGroupId,
        promoName: promo.name,
      },
      {
        menuItemId: selectedTakeItem.id,
        name: selectedTakeItem.name,
        variant: '',
        quantity: 1,
        price: 0,
        addOns: [],
        station: selectedTakeItem.station,
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
        <div className={styles.promoPrice}>{'\u20B1'}{promo.promoPrice.toFixed(2)}</div>
        {promo.description && (
          <div className={styles.promoDesc}>{promo.description}</div>
        )}
        {promo.type === 'bogo' && (
          <div className={styles.promoBadge}>Buy 1 Take 1</div>
        )}
      </div>

      {/* Main Item (fixed) */}
      {mainItem && (
        <div className={styles.mainItemSection}>
          <div className={styles.sectionLabel}>Buy 1</div>
          <div className={styles.mainItemCard}>
            <div className={styles.itemPhoto}>
              {getItemImage(mainItem) ? (
                <img src={getItemImage(mainItem)} alt={mainItem.name} />
              ) : (
                <span className="material-symbols-rounded" style={{ fontSize: 28, color: 'var(--color-foreground-muted)' }}>
                  local_cafe
                </span>
              )}
            </div>
            <div className={styles.mainItemInfo}>
              <div className={styles.mainItemName}>{mainItem.name}</div>
              <div className={styles.mainItemPrice}>{'\u20B1'}{promo.promoPrice.toFixed(2)}</div>
            </div>
            <span className={styles.checkMark}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>check</span>
            </span>
          </div>
        </div>
      )}

      {/* Take Items (selectable grid) */}
      <div className={styles.selectSection}>
        <div className={styles.selectLabel}>Take 1 — Choose your free item:</div>
        <div className={styles.itemGrid}>
          {takeItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.itemCard} ${selectedTakeId === item.id ? styles.itemCardSelected : ''}`}
              onClick={() => setSelectedTakeId(item.id)}
            >
              <div className={styles.itemPhoto}>
                {getItemImage(item) ? (
                  <img src={getItemImage(item)} alt={item.name} />
                ) : (
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: 'var(--color-foreground-muted)' }}>
                    local_cafe
                  </span>
                )}
              </div>
              <div className={styles.itemName}>{item.name}</div>
              {selectedTakeId === item.id && (
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
          disabled={!selectedTakeItem}
          onClick={handleAddToCart}
        >
          Add to Cart — {'\u20B1'}{promo.promoPrice.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
