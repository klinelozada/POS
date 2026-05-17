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
import { RichTextEditor } from '../../components/RichTextEditor';
import type { Category, MenuItemVariant, VariantGroup, StationType } from '../../types';
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
  const [useVariantGroups, setUseVariantGroups] = useState(false);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [priceMatrix, setPriceMatrix] = useState<Record<string, number>>({});
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
          if (item.variantGroups && item.variantGroups.length > 0 && item.priceMatrix) {
            setUseVariantGroups(true);
            setVariantGroups(item.variantGroups);
            setPriceMatrix(item.priceMatrix);
          }
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itemData: any = {
        name: name.trim(),
        categoryId,
        basePrice: parseFloat(basePrice),
        variants: useVariantGroups ? [] : variants,
        station,
        isAvailable,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(prepInstructions.trim() ? { prepInstructions: prepInstructions.trim() } : {}),
        ...(photo ? { photo } : {}),
        ...(useVariantGroups && variantGroups.length > 0
          ? { variantGroups, priceMatrix }
          : {}),
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
              {categories
                .filter((c) => !c.parentId)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((parent) => {
                  const children = categories
                    .filter((c) => c.parentId === parent.id)
                    .sort((a, b) => a.displayOrder - b.displayOrder);
                  if (children.length === 0) {
                    return (
                      <option key={parent.id} value={parent.id}>
                        {parent.name}
                      </option>
                    );
                  }
                  return (
                    <optgroup key={parent.id} label={parent.name}>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Variants</h3>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useVariantGroups}
                onChange={(e) => {
                  setUseVariantGroups(e.target.checked);
                  if (e.target.checked && variantGroups.length === 0) {
                    setVariantGroups([{ label: 'Size', options: [''] }]);
                  }
                }}
              />
              Multi-dimensional
            </label>
          </div>

          {!useVariantGroups && (
            <>
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
            </>
          )}

          {useVariantGroups && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {variantGroups.map((group, gi) => (
                <div key={gi} style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input
                      className={styles.input}
                      value={group.label}
                      onChange={(e) => {
                        const updated = [...variantGroups];
                        updated[gi] = { ...updated[gi], label: e.target.value };
                        setVariantGroups(updated);
                      }}
                      placeholder="Group label (e.g. Size)"
                      style={{ flex: 1 }}
                    />
                    <button
                      className={styles.removeBtn}
                      onClick={() => setVariantGroups(variantGroups.filter((_, i) => i !== gi))}
                    >
                      <span className="material-symbols-rounded">close</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {group.options.map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          className={styles.input}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...variantGroups];
                            const opts = [...updated[gi].options];
                            opts[oi] = e.target.value;
                            updated[gi] = { ...updated[gi], options: opts };
                            setVariantGroups(updated);
                          }}
                          placeholder="Option"
                          style={{ width: 100 }}
                        />
                        <button
                          className={styles.removeBtn}
                          onClick={() => {
                            const updated = [...variantGroups];
                            updated[gi] = { ...updated[gi], options: updated[gi].options.filter((_, i) => i !== oi) };
                            setVariantGroups(updated);
                          }}
                          style={{ padding: 2 }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
                        </button>
                      </div>
                    ))}
                    <button
                      className={styles.addBtn}
                      onClick={() => {
                        const updated = [...variantGroups];
                        updated[gi] = { ...updated[gi], options: [...updated[gi].options, ''] };
                        setVariantGroups(updated);
                      }}
                      style={{ fontSize: 12, padding: '2px 8px' }}
                    >
                      + Option
                    </button>
                  </div>
                </div>
              ))}
              <button
                className={styles.addBtn}
                onClick={() => setVariantGroups([...variantGroups, { label: '', options: [''] }])}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
                Add Variant Group
              </button>

              {/* Price Matrix */}
              {variantGroups.length > 0 && variantGroups.every(g => g.options.some(o => o.trim())) && (
                <div style={{ marginTop: 8 }}>
                  <h4 className={styles.sectionTitle} style={{ fontSize: 14, marginBottom: 8 }}>Price Matrix</h4>
                  {(() => {
                    // Generate all combinations
                    const combos: string[][] = variantGroups.reduce<string[][]>(
                      (acc, group) => {
                        const validOpts = group.options.filter(o => o.trim());
                        if (acc.length === 0) return validOpts.map(o => [o]);
                        return acc.flatMap(combo => validOpts.map(o => [...combo, o]));
                      },
                      []
                    );
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {combos.map((combo) => {
                          const key = combo.join('|');
                          return (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ flex: 1, fontSize: 13 }}>{combo.join(' / ')}</span>
                              <input
                                className={styles.input}
                                type="number"
                                step="1"
                                min="0"
                                value={priceMatrix[key] ?? ''}
                                onChange={(e) => {
                                  setPriceMatrix(prev => ({
                                    ...prev,
                                    [key]: parseFloat(e.target.value) || 0,
                                  }));
                                }}
                                placeholder="Price"
                                style={{ width: 100 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Prep Instructions</label>
          <RichTextEditor
            content={prepInstructions}
            onChange={setPrepInstructions}
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
