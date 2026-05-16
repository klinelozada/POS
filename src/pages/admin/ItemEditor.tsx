import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  getCategories,
} from '../../services/menuService';
import { uploadMenuItemImage } from '../../services/storageService';
import { getMenuItemImage } from '../../utils/menuImages';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Category, MenuItemVariant, StationType } from '../../types';
import styles from './ItemEditor.module.css';
import toast from 'react-hot-toast';

export default function ItemEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(!isNew);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<MenuItemVariant[]>([]);
  const [prepInstructions, setPrepInstructions] = useState('');
  const [station, setStation] = useState<StationType>('prep');
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const cats = await getCategories();
      setCategories(cats);

      if (!isNew && id) {
        const item = await getMenuItem(id);
        if (item) {
          setName(item.name);
          setCategoryId(item.categoryId);
          setBasePrice(item.basePrice.toString());
          setDescription(item.description ?? '');
          setPhoto(item.photo ?? '');
          setVariants(item.variants);
          setPrepInstructions(item.prepInstructions ?? '');
          setStation(item.station);
          setIsAvailable(item.isAvailable);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, isNew]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', priceAdd: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: keyof MenuItemVariant,
    value: string
  ) => {
    const updated = [...variants];
    if (field === 'name') {
      updated[index] = { ...updated[index], name: value };
    } else {
      updated[index] = { ...updated[index], priceAdd: parseFloat(value) || 0 };
    }
    setVariants(updated);
  };

  const handleSave = async () => {
    if (!name.trim() || !categoryId || !basePrice) {
      toast.error('Please fill in required fields.');
      return;
    }

    setSaving(true);
    try {
      let itemId = id;

      const itemData = {
        name: name.trim(),
        categoryId,
        basePrice: parseFloat(basePrice),
        variants,
        station,
        isAvailable,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(prepInstructions.trim() ? { prepInstructions: prepInstructions.trim() } : {}),
        ...(photo ? { photo } : {}),
      };

      if (isNew) {
        itemId = await createMenuItem(itemData);
      }

      // Upload photo if selected
      let finalPhotoUrl = photo;
      if (photoFile && itemId) {
        finalPhotoUrl = await uploadMenuItemImage(itemId, photoFile);
      }

      if (!isNew && itemId) {
        await updateMenuItem(itemId, { ...itemData, ...(finalPhotoUrl ? { photo: finalPhotoUrl } : {}) });
      } else if (isNew && finalPhotoUrl && itemId) {
        await updateMenuItem(itemId, { photo: finalPhotoUrl });
      }

      toast.success(isNew ? 'Item created.' : 'Item updated.');
      navigate('/admin/menu');
    } catch {
      toast.error('Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Show preview > uploaded photo > local mapped image
  const displayPhoto = photoPreview || photo || getMenuItemImage(name) || '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isNew ? 'Add Menu Item' : 'Edit Menu Item'}</h1>
      </div>

      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Category *</label>
            <select
              className={styles.select}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Base Price *</label>
            <input
              className={styles.input}
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Station</label>
            <select
              className={styles.select}
              value={station}
              onChange={(e) => setStation(e.target.value as StationType)}
            >
              <option value="prep">Prep</option>
              <option value="kitchen">Kitchen</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Item description..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Photo</label>
          <div className={styles.imageUploadRow}>
            <div
              className={styles.photoArea}
              onClick={() => fileInputRef.current?.click()}
            >
              {displayPhoto ? (
                <img src={displayPhoto} alt={name} className={styles.photoImg} />
              ) : (
                <>
                  <span className="material-symbols-rounded" style={{ fontSize: 32, color: 'var(--color-foreground-muted)' }}>
                    add_photo_alternate
                  </span>
                  <span className={styles.photoText}>Click to upload</span>
                </>
              )}
            </div>
            <div className={styles.imageActions}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                {displayPhoto ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {(photo || photoFile) && (
                <button
                  className={styles.removePhotoBtn}
                  onClick={() => { setPhoto(''); setPhotoFile(null); setPhotoPreview(null); }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Variants</h3>
          {variants.map((variant, i) => (
            <div key={i} className={styles.variantRow}>
              <input
                className={styles.input}
                value={variant.name}
                onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                placeholder="Variant name (e.g. Large)"
              />
              <input
                className={styles.input}
                type="number"
                step="0.01"
                min="0"
                value={variant.priceAdd}
                onChange={(e) => handleVariantChange(i, 'priceAdd', e.target.value)}
                placeholder="+0.00"
              />
              <button
                className={styles.removeBtn}
                onClick={() => handleRemoveVariant(i)}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
          ))}
          <button className={styles.addBtn} onClick={handleAddVariant}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
            Add Variant
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Prep Instructions</label>
          <textarea
            className={styles.textarea}
            value={prepInstructions}
            onChange={(e) => setPrepInstructions(e.target.value)}
            placeholder="Preparation instructions..."
          />
        </div>

        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggle} ${isAvailable ? styles.toggleActive : ''}`}
            onClick={() => setIsAvailable(!isAvailable)}
            type="button"
          >
            <div className={styles.toggleKnob} />
          </button>
          <span className={styles.toggleLabel}>Available</span>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/admin/menu')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
