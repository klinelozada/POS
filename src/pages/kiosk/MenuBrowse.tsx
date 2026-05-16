import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

  // Build parent-child structure
  const { topLevel, childrenMap } = useMemo(() => {
    const childMap = new Map<string, typeof activeCategories>();

    for (const cat of activeCategories) {
      if (cat.parentId) {
        const siblings = childMap.get(cat.parentId) ?? [];
        siblings.push(cat);
        childMap.set(cat.parentId, siblings);
      }
    }

    for (const [key, children] of childMap) {
      childMap.set(key, children.sort((a, b) => a.displayOrder - b.displayOrder));
    }

    const top = activeCategories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return { topLevel: top, childrenMap: childMap };
  }, [activeCategories]);

  const [searchParams, setSearchParams] = useSearchParams();

  // State: null = show category grid, string = selected parent category ID
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  // Restore category from URL param (e.g., after add-to-cart navigates back)
  useEffect(() => {
    const catParam = searchParams.get('cat');
    if (!catParam || topLevel.length === 0) return;

    // Check if it's a top-level category
    const isTopLevel = topLevel.find((c) => c.id === catParam);
    if (isTopLevel) {
      setSelectedParentId(catParam);
      setSearchParams({}, { replace: true });
      return;
    }

    // Check if it's a sub-category — find its parent
    const subCat = activeCategories.find((c) => c.id === catParam);
    if (subCat?.parentId) {
      setSelectedParentId(subCat.parentId);
      setSelectedSubId(catParam);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, topLevel, activeCategories]);

  const currentParent = selectedParentId
    ? topLevel.find((c) => c.id === selectedParentId) ?? null
    : null;

  const subCategories = currentParent ? childrenMap.get(currentParent.id) ?? [] : [];
  const hasChildren = subCategories.length > 0;

  const currentSub = hasChildren
    ? (selectedSubId ? subCategories.find((c) => c.id === selectedSubId) : subCategories[0]) ?? subCategories[0]
    : null;

  const displayCategory = currentSub ?? currentParent;

  const filteredItems = displayCategory
    ? menuItems.filter((item) => item.categoryId === displayCategory.id)
    : [];

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = total();

  const handleCategorySelect = (catId: string) => {
    setSelectedParentId(catId);
    setSelectedSubId(null);
  };

  const handleBackToGrid = () => {
    setSelectedParentId(null);
    setSelectedSubId(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  // Helper to get category card image
  const getCatCardImage = (cat: typeof topLevel[0]) => {
    if (cat.image) return cat.image;
    // Try category image map
    const mapped = getCategoryImage(cat.name);
    if (mapped) return mapped;
    return null;
  };

  const showGrid = !selectedParentId;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => showGrid ? navigate(`${base}/welcome`) : handleBackToGrid()}>
          <span className="material-symbols-rounded" style={{ fontSize: 24 }}>arrow_back</span>
        </button>
        <img src="/images/logo.png" alt="Joe Street" className={styles.headerLogo} />
        <span className={styles.orderTypeBadge}>{orderType === 'dine-in' ? 'Dine In' : 'Take Out'}</span>
        <span className={styles.headerSpacer} />
        <div className={styles.cartBtn} onClick={() => navigate(`${base}/cart`)}>
          <span className="material-symbols-rounded" style={{ fontSize: 24 }}>shopping_cart</span>
          {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
        </div>
      </div>

      {/* Mobile category bar — only visible on mobile when viewing items */}
      {!showGrid && (
        <div className={styles.mobileCategoryBar}>
          <div className={styles.mobileCategoryScroll}>
            {topLevel.map((cat) => {
              const img = getCatCardImage(cat);
              return (
                <button
                  key={cat.id}
                  className={currentParent?.id === cat.id ? styles.mobileCatBtnActive : styles.mobileCatBtn}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <div className={styles.mobileCatThumb}>
                    {img ? (
                      <img src={img} alt={cat.name} />
                    ) : (
                      renderCatIcon(cat.icon, 18)
                    )}
                  </div>
                  <span className={styles.mobileCatLabel}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={styles.body}>
        {showGrid ? (
          /* ===== CATEGORY GRID (Landing) ===== */
          <div className={styles.gridLanding}>
            <div className={styles.gridTitle}>Our Menu</div>
            <div className={styles.gridSubtitle}>What are you craving today?</div>
            <div className={styles.categoryGrid}>
              {topLevel.map((cat) => {
                const img = getCatCardImage(cat);
                return (
                  <div
                    key={cat.id}
                    className={styles.categoryCard}
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    <div className={styles.categoryCardImage}>
                      {img ? (
                        <img src={img} alt={cat.name} />
                      ) : (
                        <div className={styles.categoryCardIcon}>
                          {renderCatIcon(cat.icon, 48)}
                        </div>
                      )}
                    </div>
                    <div className={styles.categoryCardName}>{cat.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ===== ITEMS VIEW (after selecting category) ===== */
          <div className={styles.itemsLayout}>
            {/* Sidebar — tablet only */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarList}>
                {topLevel.map((cat) => (
                  <button
                    key={cat.id}
                    className={currentParent?.id === cat.id ? styles.categoryBtnActive : styles.categoryBtn}
                    onClick={() => handleCategorySelect(cat.id)}
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

            {/* Items content */}
            <div className={styles.content}>
              {displayCategory && (
                <>
                  <div className={styles.contentHeader}>
                    <button className={styles.backToGrid} onClick={handleBackToGrid}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>grid_view</span>
                      All Categories
                    </button>
                  </div>
                  <div className={styles.categoryTitle}>
                    {currentParent?.name}{currentSub ? ` \u2014 ${currentSub.name}` : ''}
                  </div>
                  {hasChildren && (
                    <div className={styles.subTabs}>
                      {subCategories.map((sub) => (
                        <button
                          key={sub.id}
                          className={displayCategory.id === sub.id ? styles.subTabActive : styles.subTab}
                          onClick={() => setSelectedSubId(sub.id)}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {displayCategory.description && (
                    <div className={styles.categoryDesc}>{displayCategory.description}</div>
                  )}
                  {filteredItems.length > 0 ? (
                    <div className={styles.grid}>
                      {filteredItems.map((item) => {
                        const catName = currentParent?.name ?? displayCategory.name;
                        return (
                          <div
                            key={item.id}
                            className={`${styles.itemCard} ${!item.isAvailable ? styles.unavailable : ''}`}
                            onClick={() => item.isAvailable && navigate(`${base}/menu/${item.id}`)}
                          >
                            <div className={styles.itemPhoto}>
                              {(item.photo || getMenuItemImage(item.name) || getCategoryImage(catName)) ? (
                                <img
                                  src={item.photo || getMenuItemImage(item.name) || getCategoryImage(catName)}
                                  alt={item.name}
                                />
                              ) : (
                                <span className="material-symbols-rounded" style={{ fontSize: 32, color: 'var(--color-foreground-muted)' }}>
                                  {displayCategory.icon || 'restaurant'}
                                </span>
                              )}
                            </div>
                            <div className={styles.itemInfo}>
                              <div className={styles.itemName}>{item.name}</div>
                              {item.description && (
                                <div className={styles.itemDesc}>{item.description}</div>
                              )}
                              <div className={styles.itemPrice}>
                                {'\u20B1'}{item.basePrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.empty}>No items in this category yet</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile floating cart bar */}
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
