import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Category, MenuItem, AddOnGroup, CreateData } from '../types';

const categoriesRef = collection(db, 'categories');
const menuItemsRef = collection(db, 'menuItems');
const addOnGroupsRef = collection(db, 'addOnGroups');

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(categoriesRef, orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function createCategory(data: CreateData<Category>): Promise<string> {
  const docRef = await addDoc(categoriesRef, data);
  return docRef.id;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, data);
}

export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
}

// --- Menu Items ---

export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  try {
    let q;
    if (categoryId) {
      q = query(menuItemsRef, where('categoryId', '==', categoryId));
    } else {
      q = query(menuItemsRef);
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  try {
    const docRef = doc(db, 'menuItems', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as MenuItem;
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return null;
  }
}

export async function createMenuItem(data: CreateData<MenuItem>): Promise<string> {
  const docRef = await addDoc(menuItemsRef, data);
  return docRef.id;
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
  const docRef = doc(db, 'menuItems', id);
  await updateDoc(docRef, data);
}

export async function deleteMenuItem(id: string): Promise<void> {
  const docRef = doc(db, 'menuItems', id);
  await deleteDoc(docRef);
}

// --- Add-On Groups ---

export async function getAddOnGroups(): Promise<AddOnGroup[]> {
  try {
    const snapshot = await getDocs(addOnGroupsRef);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AddOnGroup));
  } catch (error) {
    console.error('Error fetching add-on groups:', error);
    return [];
  }
}

export async function createAddOnGroup(data: CreateData<AddOnGroup>): Promise<string> {
  const docRef = await addDoc(addOnGroupsRef, data);
  return docRef.id;
}

export async function updateAddOnGroup(id: string, data: Partial<AddOnGroup>): Promise<void> {
  const docRef = doc(db, 'addOnGroups', id);
  await updateDoc(docRef, data);
}

export async function deleteAddOnGroup(id: string): Promise<void> {
  const docRef = doc(db, 'addOnGroups', id);
  await deleteDoc(docRef);
}
