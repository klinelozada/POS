import { useState, useMemo, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../../hooks/useMenu';
import { updateMenuItem } from '../../services/menuService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getMenuItemImage } from '../../utils/menuImages';
import type { MenuItem } from '../../types';
import styles from './MenuManagement.module.css';

export default function MenuManagement() {
  const { categories, menuItems, loading, refresh } = useMenu();
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const navigate = useNavigate();

  // Build parent-child sidebar structure
  const { sidebarItems } = useMemo(() => {
    const childrenMap = new Map<string, typeof categories>();
    for (const cat of categories) {
      if (cat.parentId) {
        const siblings = childrenMap.get(cat.parentId) ?? [];
        siblings.push(cat);
        childrenMap.set(cat.parentId, siblings);
      }
    }
    for (const [key, children] of childrenMap) {
      childrenMap.set(key, children.sort((a, b) => a.displayOrder - b.displayOrder));
    }

    const topLevel = categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const items: { cat: typeof categories[0]; depth: number }[] = [];
    for (const parent of topLevel) {
      items.push({ cat: parent, depth: 0 });
      const children = childrenMap.get(parent.id) ?? [];
      for (const child of children) {
        items.push({ cat: child, depth: 1 });
      }
    }

    return { sidebarItems: items };
  }, [categories]);

  if (loading) return <LoadingSpinner />;

  // When a parent with children is selected, show items from all its children
  const getFilteredItems = () => {
    if (!selectedCatId) return menuItems;
    const childIds = categories
      .filter((c) => c.parentId === selectedCatId)
      .map((c) => c.id);
    if (childIds.length > 0) {
      return menuItems.filter((item) => childIds.includes(item.categoryId));
    }
    return menuItems.filter((item) => item.categoryId === selectedCatId);
  };

  const filteredItems = getFilteredItems();

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return 'Unknown';
    if (cat.parentId) {
      const parent = categories.find((c) => c.id === cat.parentId);
      return parent ? `${parent.name} → ${cat.name}` : cat.name;
    }
    return cat.name;
  };

  const handleToggle = async (item: MenuItem, e: MouseEvent) => {
    e.stopPropagation();
    await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    refresh();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Menu Management</h1>
        <Button onClick={() => navigate('/admin/menu/new')}>+ Add Item</Button>
      </div>

      <div className={styles.content}>
        <div className={styles.categorySidebar}>
          <button
            className={`${styles.catItem} ${selectedCatId === null ? styles.catItemActive : ''}`}
            onClick={() => setSelectedCatId(null)}
          >
            <span className={`material-symbols-rounded ${styles.catIcon}`}>apps</span>
            All
          </button>
          {sidebarItems.map(({ cat, depth }) => (
            <button
              key={cat.id}
              className={`${styles.catItem} ${selectedCatId === cat.id ? styles.catItemActive : ''} ${depth > 0 ? styles.catItemChild : ''}`}
              onClick={() => setSelectedCatId(cat.id)}
            >
              {depth > 0 ? (
                <span className={styles.catChildIndent}>└</span>
              ) : cat.icon && (
                cat.icon.startsWith('fa-') ? (
                  <i className={`fa-solid ${cat.icon} ${styles.catIcon}`} />
                ) : (
                  <span className={`material-symbols-rounded ${styles.catIcon}`}>{cat.icon}</span>
                )
              )}
              {cat.name}
            </button>
          ))}
        </div>

        <div className={styles.itemGrid}>
          {filteredItems.length === 0 ? (
            <div className={styles.emptyState}>No menu items found.</div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.itemCard} ${selectedItem?.id === item.id ? styles.itemCardSelected : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className={styles.photoPlaceholder}>
                  {(item.photo || getMenuItemImage(item.name)) ? (
                    <img
                      src={item.photo || getMenuItemImage(item.name)}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  ) : (
                    <span className="material-symbols-rounded" style={{ fontSize: 32 }}>restaurant</span>
                  )}
                </div>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemFooter}>
                  <span className={styles.itemPrice}>{'\u20B1'}{item.basePrice.toFixed(2)}</span>
                  <button
                    className={`${styles.toggle} ${item.isAvailable ? styles.toggleActive : ''}`}
                    onClick={(e) => handleToggle(item, e)}
                  >
                    <div className={styles.toggleKnob} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.detailPanel}>
          {selectedItem ? (
            <>
              <h2 className={styles.detailTitle}>{selectedItem.name}</h2>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>
                  {getCategoryName(selectedItem.categoryId)}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Base Price</span>
                <span className={styles.detailValue}>
                  ${selectedItem.basePrice.toFixed(2)}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Station</span>
                <span className={styles.detailValue}>{selectedItem.station}</span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Available</span>
                <span className={styles.detailValue}>
                  {selectedItem.isAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              {selectedItem.description && (
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Description</span>
                  <span className={styles.detailValue}>
                    {selectedItem.description}
                  </span>
                </div>
              )}
              {selectedItem.variants.length > 0 && (
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Variants</span>
                  {selectedItem.variants.map((v, i) => (
                    <span key={i} className={styles.detailValue}>
                      {v.name} (+${v.priceAdd.toFixed(2)})
                    </span>
                  ))}
                </div>
              )}
              <div className={styles.detailActions}>
                <Button
                  size="sm"
                  onClick={() => navigate(`/admin/menu/${selectedItem.id}`)}
                >
                  Edit
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              Select an item to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
