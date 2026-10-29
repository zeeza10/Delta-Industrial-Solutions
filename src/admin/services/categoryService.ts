/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Category Taxonomy Service
 * Firestore CRUD for Categories with circular parent checks, slug uniqueness, and product dependency guards
 */

import { db } from '../../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { Category } from '../../types';
import { CATEGORIES as SEED_CATEGORIES } from '../../data/categories';
import { auditService } from './auditService';
import { productService } from './productService';

export class CategoryService {
  /**
   * Helper: Generate URL-safe slug from name
   */
  public generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Fetch all categories from Firestore
   */
  public async getCategories(): Promise<{ categories: Category[]; isLive: boolean }> {
    if (!db) return { categories: SEED_CATEGORIES as any as Category[], isLive: false };
    try {
      const snap = await getDocs(query(collection(db, 'categories'), limit(150)));
      if (!snap.empty) {
        const categories = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        return { categories, isLive: true };
      }
    } catch (err) {
      console.warn('[CategoryService] getCategories fallback to seed:', err);
    }
    return { categories: SEED_CATEGORIES as any as Category[], isLive: false };
  }

  /**
   * Check if category slug is unique
   */
  public async isSlugUnique(slug: string, excludeCategoryId?: string): Promise<boolean> {
    const slugNorm = this.generateSlug(slug);
    const seedMatch = SEED_CATEGORIES.find(
      c => c.slug.toLowerCase() === slugNorm && c.id !== excludeCategoryId
    );
    if (seedMatch) return false;

    if (!db) return true;

    try {
      const q = query(collection(db, 'categories'), where('slug', '==', slugNorm), limit(5));
      const snap = await getDocs(q);
      const matches = snap.docs.filter(d => d.id !== excludeCategoryId);
      return matches.length === 0;
    } catch (err) {
      console.warn('[CategoryService] isSlugUnique error:', err);
      return true;
    }
  }

  /**
   * Validate against circular parent-child dependency
   */
  public isCircularParent(categoryId: string, parentId: string, allCategories: Category[]): boolean {
    if (categoryId === parentId) return true;

    let currentParent = allCategories.find(c => c.id === parentId);
    while (currentParent && currentParent.parentId) {
      if (currentParent.parentId === categoryId) return true;
      currentParent = allCategories.find(c => c.id === currentParent?.parentId);
    }

    return false;
  }

  /**
   * Count products associated with a category
   */
  public async getCategoryProductCount(categoryId: string): Promise<number> {
    const { products } = await productService.getProducts();
    return products.filter(p => p.categoryId === categoryId || p.categoryId === categoryId.toLowerCase()).length;
  }

  /**
   * Create a new Category
   */
  public async createCategory(
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
    authorUid?: string,
    authorEmail?: string
  ): Promise<Category> {
    const slug = data.slug ? this.generateSlug(data.slug) : this.generateSlug(data.name);
    const isUnique = await this.isSlugUnique(slug);
    if (!isUnique) {
      throw new Error(`Category slug "${slug}" is already in use by another category.`);
    }

    const id = `cat-${Date.now()}`;
    const now = new Date().toISOString();

    const newCategory: Category = {
      ...data,
      id,
      slug,
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        await setDoc(doc(db, 'categories', id), newCategory);
        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'create',
          details: `Created taxonomy category: ${data.name} (${slug})`,
          targetResource: 'categories',
          resourceId: id,
        });
      } catch (err) {
        console.warn('[CategoryService] createCategory Firestore write error:', err);
      }
    }

    return newCategory;
  }

  /**
   * Update an existing Category
   */
  public async updateCategory(
    id: string,
    data: Partial<Category>,
    allCategories: Category[],
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    if (data.parentId && this.isCircularParent(id, data.parentId, allCategories)) {
      throw new Error(`Cannot set parent category: circular dependency detected.`);
    }

    if (data.slug) {
      const isUnique = await this.isSlugUnique(data.slug, id);
      if (!isUnique) {
        throw new Error(`Category slug "${data.slug}" is already in use.`);
      }
    }

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      ...data,
      updatedAt: now,
    };

    if (data.name && !data.slug) {
      updateData.slug = this.generateSlug(data.name);
    } else if (data.slug) {
      updateData.slug = this.generateSlug(data.slug);
    }

    if (db) {
      try {
        await updateDoc(doc(db, 'categories', id), updateData);
        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'update',
          details: `Updated category ID: ${id}`,
          targetResource: 'categories',
          resourceId: id,
        });
        return true;
      } catch (err) {
        console.warn('[CategoryService] updateCategory error:', err);
      }
    }
    return true;
  }

  /**
   * Delete Category with Product dependency check
   */
  public async deleteCategory(
    id: string,
    force: boolean = false,
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    if (!force) {
      const count = await this.getCategoryProductCount(id);
      if (count > 0) {
        throw new Error(`Cannot delete category: ${count} catalog products are currently assigned to this category.`);
      }
    }

    if (db) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'delete',
          details: `Deleted category ID: ${id}`,
          targetResource: 'categories',
          resourceId: id,
        });
        return true;
      } catch (err) {
        console.warn('[CategoryService] deleteCategory error:', err);
      }
    }
    return true;
  }
}

export const categoryService = new CategoryService();
