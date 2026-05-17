import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMenuItem, getAddOnGroups, getCategories } from '../../services/menuService';
import { useCartStore } from '../../stores/cartStore';
import { useBasePath } from '../../hooks/useBasePath';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { MenuItem, AddOnGroup, OrderItemAddOn } from '../../types';
import { getMenuItemImage, getCategoryImage } from '../../utils/menuImages';
import styles from './ItemDetail.module.css';

export default function ItemDetail() {
  const navigate = useNavigate();
  const base = useBasePath();
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const [item, setItem] = useState<MenuItem | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [addOnGroups, setAddOnGroups] = useState<AddOnGroup[]>([]);
  const [loading, setLoading] = useState(true);
  // Single-variant mode
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  // Multi-group variant mode
  const [groupSelections, setGroupSelections] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<OrderItemAddOn[]>([]);

  const hasVariantGroups = !!(item?.variantGroups && item.variantGroups.length > 0 && item.priceMatrix);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const [menuItem, groups, cats] = await Promise.all([
        getMenuItem(id),
        getAddOnGroups(),
        getCategories(),
      ]);
      setItem(menuItem);
      if (menuItem) {
        const cat = cats.find((c) => c.id === menuItem.categoryId);
        setCategoryName(cat?.name ?? '');

        // Initialize variant selections
        if (menuItem.variantGroups && menuItem.variantGroups.length > 0 && menuItem.priceMatrix) {
          // Multi-group: default to first option of each group
          const defaults: Record<string, string> = {};
          menuItem.variantGroups.forEach((g) => {
            defaults[g.label] = g.options[0];
          });
          setGroupSelections(defaults);
        } else if (menuItem.variants && menuItem.variants.length > 0) {
          setSelectedVariant(menuItem.variants[0].name);
        }
      }
      setAddOnGroups(groups);
      setLoading(false);
    }
    load();
  }, [id]);

  // Compute price based on variant mode
  const unitPrice = useMemo(() => {
    if (!item) return 0;
    if (hasVariantGroups && item.priceMatrix) {
      const key = item.variantGroups!.map((g) => groupSelections[g.label] ?? g.options[0]).join('|');
      return item.priceMatrix[key] ?? item.basePrice;
    }
    const variantAdd = item.variants.find((v) => v.name === selectedVariant)?.priceAdd ?? 0;
    return item.basePrice + variantAdd;
  }, [item, hasVariantGroups, groupSelections, selectedVariant]);

  // Compute variant string for cart
  const variantString = useMemo(() => {
    if (!item) return '';
    if (hasVariantGroups) {
      return item.variantGroups!.map((g) => groupSelections[g.label] ?? g.options[0]).join(', ');
    }
    return selectedVariant;
  }, [item, hasVariantGroups, groupSelections, selectedVariant]);

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.container}>
        <button className={styles.closeBtn} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--color-foreground-muted)' }}>
          Item not found
        </div>
      </div>
    );
  }

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = (unitPrice + addOnsTotal) * quantity;

  // Filter add-on groups applicable to this item's category
  const applicableAddOns = addOnGroups.filter((g) =>
    g.applicableCategories.includes(item.categoryId)
  );

  const toggleAddOn = (name: string, price: number) => {
    setSelectedAddOns((prev) => {
      const existing = prev.find((a) => a.name === name);
      if (existing) {
        return prev.filter((a) => a.name !== name);
      }
      return [...prev, { name, price }];
    });
  };

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      variant: variantString,
      quantity,
      price: unitPrice,
      addOns: selectedAddOns,
      station: item.station,
    });
    navigate(`${base}/menu?cat=${item.categoryId}`);
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeBtn} onClick={() => navigate(`${base}/menu`)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className={styles.imageSection}>
        {(item.photo || getMenuItemImage(item.name) || getCategoryImage(categoryName)) ? (
          <img src={item.photo || getMenuItemImage(item.name) || getCategoryImage(categoryName)} alt={item.name} />
        ) : (
          '\u2615'
        )}
      </div>

      <div className={styles.detailSection}>
        <div className={styles.itemName}>{item.name}</div>
        <div className={styles.itemDesc}>{item.description ?? ''}</div>
        <div className={styles.itemPrice}>{'\u20B1'}{unitPrice.toFixed(2)}</div>

        {/* Multi-group variant selectors (e.g., Size + Flavor) */}
        {hasVariantGroups && item.variantGroups!.map((group) => (
          <div key={group.label}>
            <div className={styles.sectionLabel}>{group.label}</div>
            <div className={styles.variantGroup}>
              {group.options.map((opt) => (
                <button
                  key={opt}
                  className={groupSelections[group.label] === opt ? styles.variantBtnActive : styles.variantBtn}
                  onClick={() => setGroupSelections((prev) => ({ ...prev, [group.label]: opt }))}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Single-variant selector (legacy) */}
        {!hasVariantGroups && item.variants.length > 0 && (
          <>
            <div className={styles.sectionLabel}>Size</div>
            <div className={styles.variantGroup}>
              {item.variants.map((v) => (
                <button
                  key={v.name}
                  className={selectedVariant === v.name ? styles.variantBtnActive : styles.variantBtn}
                  onClick={() => setSelectedVariant(v.name)}
                >
                  {v.name}
                  {v.priceAdd > 0 && ` (+${'\u20B1'}${v.priceAdd.toFixed(0)})`}
                </button>
              ))}
            </div>
          </>
        )}

        {applicableAddOns.map((group) => (
          <div key={group.id} className={styles.addOnGroup}>
            <div className={styles.sectionLabel}>{group.name}</div>
            {group.items.map((addon) => (
              <label key={addon.name} className={styles.addOnItem}>
                <input
                  type="checkbox"
                  className={styles.addOnCheckbox}
                  checked={selectedAddOns.some((a) => a.name === addon.name)}
                  onChange={() => toggleAddOn(addon.name, addon.price)}
                />
                <span className={styles.addOnLabel}>{addon.name}</span>
                <span className={styles.addOnPrice}>+{'\u20B1'}{addon.price.toFixed(0)}</span>
              </label>
            ))}
          </div>
        ))}

        <div className={styles.sectionLabel}>Quantity</div>
        <div className={styles.quantityRow}>
          <button
            className={styles.qtyBtn}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className={styles.qtyValue}>{quantity}</span>
          <button
            className={styles.qtyBtn}
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>

        <div className={styles.spacer} />

        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
          Add to Cart &mdash; {'\u20B1'}{totalPrice.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
