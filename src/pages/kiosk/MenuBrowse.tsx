import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../../hooks/useMenu';
import { useCartStore } from '../../stores/cartStore';
import { useBasePath } from '../../hooks/useBasePath';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getMenuItemImage, getCategoryImage } from '../../utils/menuImages';
import styles from './MenuBrowse.module.css';

function renderCatIcon(icon: string, size = 20) {
  if (icon.startsWith('fa-')) {
    return <i className={`fa-solid ${icon}`} style={{ fontSize: size }} />;
  }
  return <span className="material-symbols-rounded" style={{ fontSize: size }}>{icon || 'restaurant'}</span>;
}

export default function MenuBrowse() {
  const navigate = useNavigate();
  const base = useBasePath();
  const { categories, menuItems, loading } = useMenu();
  const orderType = useCartStore((s) => s.orderType);
  const cartItems = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);

  const activeCategories = categories.filter((c) => c.isActive);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const currentCategory = selectedCategoryId
    ? activeCategories.find((c) => c.id === selectedCategoryId) ?? activeCategories[0]
    : activeCategories[0];

  const filteredItems = currentCategory
    ? menuItems.filter((item) => item.categoryId === currentCategory.id)
    : [];

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = total();

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`${base}/welcome`)}>
          <span className="material-symbols-rounded" style={{ fontSize: 24 }}>arrow_back</span>
        </button>
        <img src="/images/logo.png" alt="Joe Street" className={styles.headerLogo} />
        <span className={styles.orderTypeBadge}>{orderType === 'dine-in' ? 'Dine In' : 'Take Out'}</span>
        <span className={styles.headerSpacer} />
        <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#D4871C', cursor: 'pointer' }} onClick={() => navigate(`${base}/cart`)}>shopping_cart</span>
        {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarList}>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                className={
                  currentCategory?.id === cat.id ? styles.categoryBtnActive : styles.categoryBtn
                }
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {renderCatIcon(cat.icon)}
                {cat.name}
              </button>
            ))}
          </div>
          {cartCount > 0 && (
            <button className={styles.sidebarCart} onClick={() => navigate(`${base}/cart`)}>
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>shopping_cart</span>
              Cart ({cartCount}) &nbsp; {'\u20B1'}{cartTotal.toFixed(0)}
            </button>
          )}
        </div>
        <div className={styles.content}>
          {currentCategory ? (
            <>
              <div className={styles.categoryTitle}>{currentCategory.name}</div>
              <div className={styles.categoryDesc}>
                {currentCategory.description ?? 'Browse our selection'}
              </div>
              {filteredItems.length > 0 ? (
                <div className={styles.grid}>
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.itemCard} ${!item.isAvailable ? styles.unavailable : ''}`}
                      onClick={() => item.isAvailable && navigate(`${base}/menu/${item.id}`)}
                    >
                      <div className={styles.itemPhoto}>
                        {(item.photo || getMenuItemImage(item.name) || getCategoryImage(currentCategory.name)) ? (
                          <img
                            src={item.photo || getMenuItemImage(item.name) || getCategoryImage(currentCategory.name)}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                          />
                        ) : (
                          <span className="material-symbols-rounded" style={{ fontSize: 32, color: 'var(--color-foreground-muted)' }}>
                            {currentCategory.icon || 'restaurant'}
                          </span>
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemDesc}>
                          {item.description ?? 'A delicious choice'}
                        </div>
                        <div className={styles.itemPrice}>
                          {'\u20B1'}{item.basePrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>No items in this category yet</div>
              )}
            </>
          ) : (
            <div className={styles.empty}>Select a category to browse items</div>
          )}
        </div>
      </div>
      {cartCount > 0 && (
        <div className={styles.mobileCartBar} onClick={() => navigate(`${base}/cart`)}>
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>shopping_cart</span>
          <span className={styles.mobileCartText}>View Cart ({cartCount})</span>
          <span className={styles.mobileCartTotal}>{'\u20B1'}{cartTotal.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}
