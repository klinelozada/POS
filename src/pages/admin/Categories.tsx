import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../../hooks/useMenu';
import { deleteCategory } from '../../services/menuService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import FilterMenu, { type FilterGroup } from '../../components/FilterMenu';
import styles from './Categories.module.css';
import toast from 'react-hot-toast';

export default function Categories() {
  const { categories, menuItems, loading, refresh } = useMenu();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filterGroups: FilterGroup[] = [
    {
      key: 'station',
      label: 'Station',
      value: stationFilter,
      onChange: setStationFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'prep', label: 'Prep' },
        { value: 'kitchen', label: 'Kitchen' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  // Build hierarchical list: parents with their children indented below
  const orderedCategories = useMemo(() => {
    const childrenMap = new Map<string, typeof categories>();
    const parentIds = new Set<string>();

    for (const cat of categories) {
      if (cat.parentId) {
        const siblings = childrenMap.get(cat.parentId) ?? [];
        siblings.push(cat);
        childrenMap.set(cat.parentId, siblings);
        parentIds.add(cat.parentId);
      }
    }

    for (const [key, children] of childrenMap) {
      childrenMap.set(key, children.sort((a, b) => a.displayOrder - b.displayOrder));
    }

    const topLevel = categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const result: { cat: typeof categories[0]; depth: number }[] = [];
    for (const parent of topLevel) {
      result.push({ cat: parent, depth: 0 });
      const children = childrenMap.get(parent.id) ?? [];
      for (const child of children) {
        result.push({ cat: child, depth: 1 });
      }
    }

    return result;
  }, [categories]);

  if (loading) return <LoadingSpinner />;

  const q = search.trim().toLowerCase();
  const visibleCategories = orderedCategories.filter(({ cat }) => {
    if (q && !cat.name.toLowerCase().includes(q)) return false;
    if (stationFilter !== 'all' && cat.defaultStation !== stationFilter) return false;
    if (statusFilter === 'active' && !cat.isActive) return false;
    if (statusFilter === 'inactive' && cat.isActive) return false;
    return true;
  });

  const getItemCount = (catId: string) =>
    menuItems.filter((item) => item.categoryId === catId).length;

  const getChildCount = (catId: string) =>
    categories.filter((c) => c.parentId === catId).length;

  const handleDelete = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted.');
      refresh();
    } catch {
      toast.error('Failed to delete category.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <Button onClick={() => navigate('/admin/categories/new')}>
          + Add Category
        </Button>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'var(--color-foreground-muted)' }}>search</span>
          <input
            className={styles.searchInput}
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>
        <FilterMenu groups={filterGroups} />
      </div>

      {categories.length === 0 ? (
        <div className={styles.emptyState}>No categories yet.</div>
      ) : visibleCategories.length === 0 ? (
        <div className={styles.emptyState}>No categories match "{search}".</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Icon</th>
              <th>Name</th>
              <th>Items</th>
              <th>Station</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleCategories.map(({ cat, depth }, index) => (
              <tr
                key={cat.id}
                onClick={() => navigate(`/admin/categories/${cat.id}`)}
                className={depth > 0 ? styles.childRow : undefined}
              >
                <td>{index + 1}</td>
                <td>
                  <div className={styles.iconCell}>
                    {cat.icon.startsWith('fa-') ? (
                      <i className={`fa-solid ${cat.icon}`} style={{ fontSize: 20 }} />
                    ) : (
                      <span className="material-symbols-rounded" style={{ fontSize: 20 }}>{cat.icon}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ paddingLeft: depth * 24 }}>
                    {depth > 0 && <span style={{ color: 'var(--color-foreground-muted)', marginRight: 6 }}>└</span>}
                    {cat.name}
                    {getChildCount(cat.id) > 0 && (
                      <span className={styles.childBadge}>{getChildCount(cat.id)} sub</span>
                    )}
                  </span>
                </td>
                <td>{getItemCount(cat.id)}</td>
                <td>{cat.defaultStation}</td>
                <td>
                  <span
                    className={cat.isActive ? styles.statusActive : styles.statusInactive}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/categories/${cat.id}`);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(cat.id, e)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
