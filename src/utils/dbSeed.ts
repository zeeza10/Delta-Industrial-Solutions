/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, writeBatch, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { BRANDS } from '../data/brands';

export const seedDatabase = async () => {
  const firestore = db;
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }

  const batch = writeBatch(firestore);

  // 1. Seed Categories
  CATEGORIES.forEach((cat) => {
    const catRef = doc(firestore, 'categories', cat.id);
    batch.set(catRef, {
      name: cat.name,
      slug: cat.slug,
      parentId: null,
      updatedAt: new Date().toISOString()
    });

    if (cat.subcategories) {
      cat.subcategories.forEach((sub) => {
        const subRef = doc(firestore, 'categories', sub.id);
        batch.set(subRef, {
          name: sub.name,
          slug: sub.slug,
          parentId: cat.id,
          updatedAt: new Date().toISOString()
        });
      });
    }
  });

  // 2. Seed Brands
  BRANDS.forEach((brand) => {
    const brandRef = doc(firestore, 'brands', brand.id);
    batch.set(brandRef, {
      ...brand,
      updatedAt: new Date().toISOString()
    });
  });

  // 3. Seed Products
  PRODUCTS.forEach((prod) => {
    const prodRef = doc(firestore, 'products', prod.id);
    batch.set(prodRef, {
      ...prod,
      updatedAt: new Date().toISOString()
    });
  });

  await batch.commit();
  console.log('Database seeded successfully');
};

export const promoteToAdmin = async (uid: string) => {
  const firestore = db;
  if (!firestore) return;
  
  const batch = writeBatch(firestore);
  
  // Update user profile
  const userRef = doc(firestore, 'users', uid);
  batch.update(userRef, { role: 'admin' });
  
  // Add to admins collection (requires rules update to allow this temporarily or use script)
  const adminRef = doc(firestore, 'admins', uid);
  batch.set(adminRef, { createdAt: new Date().toISOString() });
  
  await batch.commit();
};

export const checkHasData = async () => {
  const firestore = db;
  if (!firestore) return false;
  const q = query(collection(firestore, 'products'), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
};
