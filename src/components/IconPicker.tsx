import { useState, useMemo } from 'react';
import styles from './IconPicker.module.css';

// Curated list of Material Symbols icons relevant to food/beverage/restaurant categories
const MATERIAL_ICONS = [
  // Food & Beverage
  'coffee', 'local_cafe', 'emoji_food_beverage', 'local_bar', 'wine_bar',
  'liquor', 'water_drop', 'local_drink', 'coffee_maker',
  'restaurant', 'restaurant_menu', 'lunch_dining', 'dinner_dining',
  'ramen_dining', 'set_meal', 'rice_bowl', 'kebab_dining',
  'fastfood', 'bakery_dining', 'brunch_dining', 'tapas',
  'soup_kitchen', 'skillet', 'oven',
  // Desserts & Snacks
  'icecream', 'cake', 'cookie',
  // Drinks
  'local_pizza', 'egg', 'egg_alt',
  // Category / Organization
  'category', 'apps', 'grid_view', 'view_list',
  'storefront', 'store', 'shopping_bag', 'shopping_cart',
  // Nature / Fresh
  'eco', 'grass', 'spa', 'yard',
  // General
  'star', 'favorite', 'thumb_up', 'whatshot', 'bolt',
  'local_fire_department', 'ac_unit',
  'bubble_chart', 'scatter_plot',
];

// Curated FontAwesome icons for food/restaurant
const FA_ICONS = [
  'fa-mug-hot', 'fa-mug-saucer', 'fa-coffee',
  'fa-wine-glass', 'fa-wine-bottle', 'fa-champagne-glasses',
  'fa-martini-glass', 'fa-beer-mug-empty', 'fa-glass-water',
  'fa-bottle-water', 'fa-whiskey-glass', 'fa-blender',
  'fa-utensils', 'fa-bowl-food', 'fa-plate-wheat', 'fa-bowl-rice',
  'fa-burger', 'fa-hotdog', 'fa-pizza-slice', 'fa-drumstick-bite',
  'fa-fish', 'fa-shrimp', 'fa-bacon', 'fa-bread-slice',
  'fa-cheese', 'fa-egg', 'fa-pepper-hot', 'fa-carrot',
  'fa-apple-whole', 'fa-lemon', 'fa-seedling',
  'fa-ice-cream', 'fa-cookie', 'fa-cake-candles', 'fa-candy-cane',
  'fa-cookie-bite', 'fa-stroopwafel',
  'fa-fire', 'fa-fire-flame-curved', 'fa-snowflake',
  'fa-leaf', 'fa-tree', 'fa-spa',
  'fa-star', 'fa-heart', 'fa-bolt', 'fa-sun', 'fa-cloud',
  'fa-store', 'fa-shop', 'fa-cart-shopping', 'fa-bag-shopping',
  'fa-jar', 'fa-jar-wheat', 'fa-kitchen-set',
];

type IconType = 'material' | 'fontawesome';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const isFa = value.startsWith('fa-');
  const [tab, setTab] = useState<IconType>(isFa ? 'fontawesome' : 'material');

  const filtered = useMemo(() => {
    const list = tab === 'material' ? MATERIAL_ICONS : FA_ICONS;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((icon) => icon.replace(/-/g, ' ').includes(q) || icon.includes(q));
  }, [search, tab]);

  const renderIcon = (icon: string, size = 24) => {
    if (icon.startsWith('fa-')) {
      return <i className={`fa-solid ${icon}`} style={{ fontSize: size }} />;
    }
    return <span className="material-symbols-rounded" style={{ fontSize: size }}>{icon}</span>;
  };

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.trigger} onClick={() => setOpen(!open)}>
        {renderIcon(value || 'category')}
        <span className={styles.triggerLabel}>{value || 'Select icon'}</span>
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'material' ? styles.tabActive : ''}`}
              onClick={() => setTab('material')}
            >
              Material
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'fontawesome' ? styles.tabActive : ''}`}
              onClick={() => setTab('fontawesome')}
            >
              FontAwesome
            </button>
          </div>
          <input
            className={styles.search}
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className={styles.grid}>
            {filtered.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`${styles.iconBtn} ${value === icon ? styles.iconBtnActive : ''}`}
                onClick={() => { onChange(icon); setOpen(false); setSearch(''); }}
                title={icon}
              >
                {renderIcon(icon)}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className={styles.noResults}>No icons match "{search}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
