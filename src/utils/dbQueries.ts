/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category, Brand } from '../types';

export const getFeaturedProducts = async (count = 4) => {
  if (!db) return [];
  const path = 'products';
  try {
    const q = query(
      collection(db, path),
      where('status', '==', 'active'),
      where('tags', 'array-contains', 'featured'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getAllProducts = async () => {
  if (!db) return [];
  const path = 'products';
  try {
    const q = query(
      collection(db, path),
      where('status', '==', 'active'),
      limit(200)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getProductsByCategory = async (categoryId: string, limitCount = 20) => {
  if (!db) return [];
  const path = 'products';
  try {
    const q = query(
      collection(db, path),
      where('status', '==', 'active'),
      where('categoryId', '==', categoryId),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getProductBySlug = async (slug: string) => {
  if (!db) return null;
  const path = 'products';
  try {
    const q = query(
      collection(db, path),
      where('status', '==', 'active'),
      where('slug', '==', slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const getCategories = async () => {
  if (!db) return [];
  const path = 'categories';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getBrands = async () => {
  if (!db) return [];
  const path = 'brands';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Brand[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};
