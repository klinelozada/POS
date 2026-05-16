import { useState, type MouseEvent } from 'react';
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

  if (loading) return <LoadingSpinner />;

  const filteredItems = selectedCatId
    ? menuItems.filter((item) => item.categoryId === selectedCatId)
    : menuItems;

  const getCategoryName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name ?? 'Unknown';

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
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.catItem} ${selectedCatId === cat.id ? styles.catItemActive : ''}`}
              onClick={() => setSelectedCatId(cat.id)}
            >
              {cat.icon && (
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
