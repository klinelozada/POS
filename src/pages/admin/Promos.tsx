import { useState, useEffect, useCallback, useMemo, useRef, type MouseEvent } from 'react';
import {
  getPromos,
  createPromo,
  updatePromo,
} from '../../services/adminService';
import { getMenuItems, getCategories } from '../../services/menuService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Promo, PromoType, MenuItem, Category } from '../../types';
import styles from './Promos.module.css';
import toast from 'react-hot-toast';

type TypeFilter = 'all' | PromoType;

interface PromoFormData {
  name: string;
  type: PromoType;
  description: string;
  promoPrice: string;
  mainItemId: string;
  takeItemIds: string[];
  startDate: string;
  endDate: string;
  poster: string;
  isActive: boolean;
}

const emptyForm: PromoFormData = {
  name: '',
  type: 'bogo',
  description: '',
  promoPrice: '',
  mainItemId: '',
  takeItemIds: [],
  startDate: '',
  endDate: '',
  poster: '',
  isActive: true,
};

export default function Promos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('all');
  const posterInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [data, items, cats] = await Promise.all([getPromos(), getMenuItems(), getCategories()]);
    setPromos(data);
    setMenuItems(items);
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return promos;
    return promos.filter((p) => p.type === typeFilter);
  }, [promos, typeFilter]);

  const handleToggle = async (promo: Promo, e: MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePromo(promo.id, { isActive: !promo.isActive });
      load();
    } catch {
      toast.error('Failed to update promo.');
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setItemSearch('');
    setShowModal(true);
  };

  const openEdit = (promo: Promo) => {
    setEditingId(promo.id);
    setForm({
      name: promo.name,
      type: promo.type,
      description: promo.description ?? '',
      promoPrice: promo.promoPrice?.toString() ?? '',
      mainItemId: promo.mainItemId ?? '',
      takeItemIds: promo.takeItemIds ?? promo.eligibleItems ?? [],
      startDate: promo.startDate ?? '',
      endDate: promo.endDate ?? '',
      poster: promo.poster ?? '',
      isActive: promo.isActive,
    });
    setItemSearch('');
    setShowModal(true);
  };

  const handlePosterUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, poster: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const toggleTakeItem = (itemId: string) => {
    setForm((f) => ({
      ...f,
      takeItemIds: f.takeItemIds.includes(itemId)
        ? f.takeItemIds.filter((id) => id !== itemId)
        : [...f.takeItemIds, itemId],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    if (!form.promoPrice || parseFloat(form.promoPrice) <= 0) { toast.error('Promo price is required.'); return; }
    if (!form.mainItemId) { toast.error('Select a main item.'); return; }
    if (form.takeItemIds.length === 0) { toast.error('Select at least one "Take" item.'); return; }

    setSaving(true);
    try {
      const allIds = [form.mainItemId, ...form.takeItemIds.filter((id) => id !== form.mainItemId)];
      const data: Omit<Promo, 'id'> = {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim() || undefined,
        promoPrice: parseFloat(form.promoPrice),
        mainItemId: form.mainItemId,
        takeItemIds: form.takeItemIds,
        eligibleItems: allIds,
        isActive: form.isActive,
        ...(form.poster ? { poster: form.poster } : {}),
        ...(form.startDate ? { startDate: form.startDate } : {}),
        ...(form.endDate ? { endDate: form.endDate } : {}),
      };

      if (editingId) {
        await updatePromo(editingId, data);
        toast.success('Promo updated.');
      } else {
        await createPromo(data);
        toast.success('Promo created.');
      }
      setShowModal(false);
      load();
    } catch {
      toast.error('Failed to save promo.');
    } finally {
      setSaving(false);
    }
  };

  const badgeClass = (type: PromoType) => {
    const map: Record<PromoType, string> = {
      bogo: styles.badgeBogo,
      discount: styles.badgeDiscount,
      bundle: styles.badgeBundle,
    };
    return map[type];
  };

  const getCatName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return '';
    const parent = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null;
    return parent ? `${parent.name} › ${cat.name}` : cat.name;
  };

  const getItemName = (id: string) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return id;
    const cat = getCatName(item.categoryId);
    return cat ? `${item.name} (${cat})` : item.name;
  };

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (itemCategoryFilter !== 'all') {
      items = items.filter((m) => m.categoryId === itemCategoryFilter);
    }
    if (itemSearch) {
      items = items.filter((m) => m.name.toLowerCase().includes(itemSearch.toLowerCase()));
    }
    return items;
  }, [menuItems, itemCategoryFilter, itemSearch]);

  if (loading) return <LoadingSpinner />;

  const filterOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'bogo', label: 'BOGO' },
    { value: 'discount', label: 'Discount' },
    { value: 'bundle', label: 'Bundle' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Promos</h1>
        <Button onClick={openNew}>+ Add Promo</Button>
      </div>

      <div className={styles.filters}>
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.pill} ${typeFilter === opt.value ? styles.pillActive : ''}`}
            onClick={() => setTypeFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>No promos found.</div>
        ) : (
          filtered.map((promo) => (
            <div
              key={promo.id}
              className={styles.card}
              onClick={() => openEdit(promo)}
            >
              {promo.poster && (
                <img src={promo.poster} alt={promo.name} className={styles.cardPoster} />
              )}
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>{promo.name}</span>
                <span className={`${styles.typeBadge} ${badgeClass(promo.type)}`}>
                  {promo.type}
                </span>
              </div>
              <div className={styles.cardDescription}>
                {'\u20B1'}{promo.promoPrice?.toFixed(2) ?? '0.00'}
                {promo.description ? ` — ${promo.description}` : ''}
              </div>
              <div className={styles.cardFooter}>
                <span style={{ fontSize: 13, color: 'var(--color-foreground-muted)' }}>
                  {promo.eligibleItems?.length ?? 0} items · {promo.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  className={`${styles.toggle} ${promo.isActive ? styles.toggleActive : ''}`}
                  onClick={(e) => handleToggle(promo, e)}
                >
                  <div className={styles.toggleKnob} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingId ? 'Edit Promo' : 'Add Promo'}
            </h2>

            {/* Poster */}
            <div className={styles.field}>
              <label className={styles.label}>Poster Image</label>
              {form.poster && (
                <img src={form.poster} alt="Poster" className={styles.posterPreview} />
              )}
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePosterUpload(file);
                  e.target.value = '';
                }}
              />
              <Button size="sm" variant="secondary" onClick={() => posterInputRef.current?.click()}>
                {form.poster ? 'Replace Poster' : 'Upload Poster'}
              </Button>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mango Cloud B1T1"
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Type</label>
                <select
                  className={styles.select}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as PromoType })}
                >
                  <option value="bogo">BOGO (Buy 1 Take 1)</option>
                  <option value="discount">Discount</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Promo Price *</label>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  value={form.promoPrice}
                  onChange={(e) => setForm({ ...form, promoPrice: e.target.value })}
                  placeholder="69"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Promo description..."
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Start Date</label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>End Date</label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Main Item (Buy 1) */}
            <div className={styles.field}>
              <label className={styles.label}>Main Item (Buy 1) *</label>
              <select
                className={styles.select}
                value={form.mainItemId}
                onChange={(e) => setForm({ ...form, mainItemId: e.target.value })}
              >
                <option value="">— Select main item —</option>
                {categories
                  .filter((cat) => menuItems.some((m) => m.categoryId === cat.id))
                  .map((cat) => (
                    <optgroup key={cat.id} label={getCatName(cat.id)}>
                      {menuItems
                        .filter((m) => m.categoryId === cat.id)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} — {'\u20B1'}{item.basePrice}
                          </option>
                        ))}
                    </optgroup>
                  ))}
              </select>
              {form.mainItemId && (
                <div className={styles.selectedHint}>
                  Selected: {getItemName(form.mainItemId)}
                </div>
              )}
            </div>

            {/* Take Items (Take 1) */}
            <div className={styles.field}>
              <label className={styles.label}>Take Items (Take 1) *</label>
              {form.takeItemIds.length > 0 && (
                <div className={styles.selectedItems}>
                  {form.takeItemIds.map((id) => (
                    <span key={id} className={styles.selectedChip} onClick={() => toggleTakeItem(id)}>
                      {getItemName(id)} ×
                    </span>
                  ))}
                </div>
              )}
              <div className={styles.fieldRow}>
                <select
                  className={styles.select}
                  value={itemCategoryFilter}
                  onChange={(e) => setItemCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCatName(cat.id)}
                    </option>
                  ))}
                </select>
                <input
                  className={styles.input}
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search items..."
                />
              </div>
              <div className={styles.itemList}>
                {filteredItems.slice(0, 30).map((item) => (
                  <label key={item.id} className={styles.itemOption}>
                    <input
                      type="checkbox"
                      checked={form.takeItemIds.includes(item.id)}
                      onChange={() => toggleTakeItem(item.id)}
                    />
                    <span>{item.name}</span>
                    <span className={styles.itemCat}>{getCatName(item.categoryId)}</span>
                    <span className={styles.itemPrice}>{'\u20B1'}{item.basePrice}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.toggleRow}>
              <button
                className={`${styles.toggle} ${form.isActive ? styles.toggleActive : ''}`}
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                type="button"
              >
                <div className={styles.toggleKnob} />
              </button>
              <span className={styles.toggleLabel}>Active</span>
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
