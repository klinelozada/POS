import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCategories,
  createCategory,
  updateCategory,
  getMenuItems,
  updateMenuItem,
} from '../../services/menuService';
import { uploadCategoryImage } from '../../services/storageService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { IconPicker } from '../../components/IconPicker';
import type { Category, MenuItem, StationType } from '../../types';
import styles from './CategoryEditor.module.css';
import toast from 'react-hot-toast';

export default function CategoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [catItems, setCatItems] = useState<MenuItem[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('category');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [defaultStation, setDefaultStation] = useState<StationType>('prep');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

  useEffect(() => {
    const load = async () => {
      const cats = await getCategories();
      setAllCategories(cats);

      if (!isNew && id) {
        const cat = cats.find((c) => c.id === id);
        if (cat) {
          setName(cat.name);
          setIcon(cat.icon);
          setImage(cat.image ?? '');
          setDisplayOrder(cat.displayOrder.toString());
          setDefaultStation(cat.defaultStation);
          setIsActive(cat.isActive);
          setDescription(cat.description ?? '');
          setParentId(cat.parentId ?? '');
        }

        const items = await getMenuItems(id);
        setCatItems(items);
      }
      setLoading(false);
    };
    load();
  }, [id, isNew]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }

    setSaving(true);
    try {
      let categoryId = id;

      // Create first if new (need ID for image upload path)
      if (isNew) {
        const createData: Omit<Category, 'id'> = {
          name: name.trim(),
          icon: icon.trim(),
          displayOrder: parseInt(displayOrder) || 0,
          defaultStation,
          isActive,
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(parentId ? { parentId } : {}),
        };
        categoryId = await createCategory(createData);
      }

      // Upload image if selected
      let imageUrl = image;
      if (imageFile && categoryId) {
        imageUrl = await uploadCategoryImage(categoryId, imageFile);
      }

      // Update with image URL (and other fields if editing)
      if (!isNew && categoryId) {
        const updateData: Record<string, unknown> = {
          name: name.trim(),
          icon: icon.trim(),
          displayOrder: parseInt(displayOrder) || 0,
          defaultStation,
          isActive,
        };
        if (description.trim()) updateData.description = description.trim();
        if (parentId) updateData.parentId = parentId;
        if (imageUrl) updateData.image = imageUrl;
        await updateCategory(categoryId, updateData);
      } else if (isNew && imageUrl && categoryId) {
        // Update the newly created category with the image
        await updateCategory(categoryId, { image: imageUrl });
      }

      toast.success(isNew ? 'Category created.' : 'Category updated.');
      navigate('/admin/categories');
    } catch {
      toast.error('Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const displayImage = imagePreview || image;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isNew ? 'Add Category' : 'Edit Category'}
        </h1>
      </div>

      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Icon</label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
        </div>

        {/* Category Image */}
        <div className={styles.field}>
          <label className={styles.label}>Featured Image</label>
          <div className={styles.imageUploadRow}>
            <div className={styles.imagePreview}>
              {displayImage ? (
                <img src={displayImage} alt="Category" />
              ) : (
                <span className="material-symbols-rounded" style={{ fontSize: 32, color: 'var(--color-foreground-muted)' }}>
                  add_photo_alternate
                </span>
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
                {displayImage ? 'Change Image' : 'Upload Image'}
              </Button>
              {displayImage && (
                <button
                  className={styles.removeImageBtn}
                  onClick={() => { setImage(''); setImageFile(null); setImagePreview(null); }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Display Order</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Default Station</label>
            <select
              className={styles.select}
              value={defaultStation}
              onChange={(e) => setDefaultStation(e.target.value as StationType)}
            >
              <option value="prep">Prep</option>
              <option value="kitchen">Kitchen</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Parent Category</label>
          <select
            className={styles.select}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">None (top-level)</option>
            {allCategories
              .filter((c) => !c.parentId && c.id !== id)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description..."
          />
        </div>

        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggle} ${isActive ? styles.toggleActive : ''}`}
            onClick={() => setIsActive(!isActive)}
            type="button"
          >
            <div className={styles.toggleKnob} />
          </button>
          <span className={styles.toggleLabel}>Active</span>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/categories')}
          >
            Cancel
          </Button>
        </div>
      </div>

      {!isNew && (
        <div className={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>
              Items in this Category
            </h2>
            <Button
              size="sm"
              onClick={() => navigate('/admin/menu/new')}
            >
              + Add Item
            </Button>
          </div>

          {catItems.length === 0 ? (
            <div className={styles.emptyItems}>
              No items in this category yet.
            </div>
          ) : (
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Visible</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {catItems.map((item) => (
                  <tr key={item.id} style={!item.isAvailable ? { opacity: 0.5 } : undefined}>
                    <td>{item.name}</td>
                    <td>{'\u20B1'}{item.basePrice.toFixed(2)}</td>
                    <td>
                      <button
                        className={item.isAvailable ? styles.statusActive : styles.statusInactive}
                        onClick={async () => {
                          await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
                          setCatItems((prev) =>
                            prev.map((i) => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i)
                          );
                          toast.success(item.isAvailable ? `${item.name} hidden from menu` : `${item.name} shown on menu`);
                        }}
                        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                      >
                        {item.isAvailable ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={styles.editItemBtn}
                        onClick={() => navigate(`/admin/menu/${item.id}`)}
                        title="Edit item"
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
