import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Upload a file to Firebase Storage.
 * @param path Storage path (e.g. 'menu-items/americano.png')
 * @param file File or Blob to upload
 * @returns Public download URL
 */
export async function uploadImage(path: string, file: File | Blob): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Delete a file from Firebase Storage.
 * @param path Storage path
 */
export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Get a download URL for a storage path.
 */
export async function getImageUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Upload a menu item image. Returns the download URL.
 */
export async function uploadMenuItemImage(itemId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `menu-items/${itemId}.${ext}`;
  return uploadImage(path, file);
}

/**
 * Upload a category image. Returns the download URL.
 */
export async function uploadCategoryImage(categoryId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `categories/${categoryId}.${ext}`;
  return uploadImage(path, file);
}
