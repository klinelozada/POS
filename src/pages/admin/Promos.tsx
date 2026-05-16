import { useState, useEffect, useCallback, useMemo, type MouseEvent } from 'react';
import {
  getPromos,
  createPromo,
  updatePromo,
} from '../../services/adminService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Promo, PromoType } from '../../types';
import styles from './Promos.module.css';
import toast from 'react-hot-toast';

type TypeFilter = 'all' | PromoType;

interface PromoFormData {
  name: string;
  type: PromoType;
  description: string;
  isActive: boolean;
}

const emptyForm: PromoFormData = {
  name: '',
  type: 'discount',
  description: '',
  isActive: true,
};

export default function Promos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getPromos();
    setPromos(data);
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
    setShowModal(true);
  };

  const openEdit = (promo: Promo) => {
    setEditingId(promo.id);
    setForm({
      name: promo.name,
      type: promo.type,
      description: (promo.conditions as { description?: string })?.description ?? '',
      isActive: promo.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        type: form.type,
        conditions: { description: form.description.trim() },
        isActive: form.isActive,
        categories: [],
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
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>{promo.name}</span>
                <span className={`${styles.typeBadge} ${badgeClass(promo.type)}`}>
                  {promo.type}
                </span>
              </div>
              <div className={styles.cardDescription}>
                {(promo.conditions as { description?: string })?.description ||
                  'No description'}
              </div>
              <div className={styles.cardFooter}>
                <span style={{ fontSize: 13, color: 'var(--color-foreground-muted)' }}>
                  {promo.isActive ? 'Active' : 'Inactive'}
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

            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Promo name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Type</label>
              <select
                className={styles.select}
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as PromoType })
                }
              >
                <option value="bogo">BOGO</option>
                <option value="discount">Discount</option>
                <option value="bundle">Bundle</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Promo description..."
              />
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
