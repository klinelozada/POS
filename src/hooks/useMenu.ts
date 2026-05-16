import { useState, useEffect } from 'react';
import { getCategories, getMenuItems } from '../services/menuService';
import type { Category, MenuItem } from '../types';

export interface UseMenuReturn {
  categories: Category[];
  menuItems: MenuItem[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useMenu(): UseMenuReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([
        getCategories(),
        getMenuItems(),
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { categories, menuItems, loading, refresh: load };
}
