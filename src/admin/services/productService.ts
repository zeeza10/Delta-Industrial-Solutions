/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Product Catalog Service
 * Firestore CRUD for Products with SKU uniqueness validation, bulk actions, and audit logging
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
  limit,
  writeBatch
} from 'firebase/firestore';
import { Product } from '../../types';
import { PRODUCTS as SEED_PRODUCTS } from '../../data/products';
import { auditService } from './auditService';

export class ProductService {
  /**
   * Helper: Generate URL-safe slug from title
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
   * Fetch all products from Firestore
   */
  public async getProducts(): Promise<{ products: Product[]; isLive: boolean }> {
    if (!db) return { products: SEED_PRODUCTS, isLive: false };
    try {
      const snap = await getDocs(query(collection(db, 'products'), limit(300)));
      if (!snap.empty) {
        const products = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        return { products, isLive: true };
      }
    } catch (err) {
      console.warn('[ProductService] getProducts fallback to seed:', err);
    }
    return { products: SEED_PRODUCTS, isLive: false };
  }

  /**
   * Fetch single product by ID
   */
  public async getProductById(id: string): Promise<Product | null> {
    if (!db) return SEED_PRODUCTS.find(p => p.id === id) || null;
    try {
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Product;
      }
    } catch (err) {
      console.warn('[ProductService] getProductById error:', err);
    }
    return SEED_PRODUCTS.find(p => p.id === id) || null;
  }

  /**
   * Check if SKU is unique (excluding current productId if editing)
   */
  public async isSkuUnique(sku: string, excludeProductId?: string): Promise<boolean> {
    const skuNormalized = sku.trim().toUpperCase();
    
    // Check seed products first
    const seedMatch = SEED_PRODUCTS.find(
      p => p.sku.toUpperCase() === skuNormalized && p.id !== excludeProductId
    );
    if (seedMatch) return false;

    if (!db) return true;

    try {
      // Direct lookup in registry is faster and more reliable than query on products
      const registryDoc = await getDoc(doc(db, 'sku_registry', skuNormalized));
      if (registryDoc.exists()) {
        const data = registryDoc.data();
        // If it exists and belongs to another product, it's not unique
        if (data.productId !== excludeProductId) {
          return false;
        }
      }
      
      // Fallback/Double check: query products collection
      const q = query(collection(db, 'products'), where('sku', '==', skuNormalized), limit(1));
      const snap = await getDocs(q);
      const matchingDocs = snap.docs.filter(d => d.id !== excludeProductId);
      return matchingDocs.length === 0;
    } catch (err) {
      console.warn('[ProductService] isSkuUnique check error:', err);
      return true;
    }
  }

  /**
   * Create a new Product
   */
  public async createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    authorUid?: string,
    authorEmail?: string
  ): Promise<Product> {
    const skuNormalized = data.sku.toUpperCase().trim();
    const isSkuUnique = await this.isSkuUnique(skuNormalized);
    if (!isSkuUnique) {
      throw new Error(`SKU "${skuNormalized}" is already in use by another catalog product.`);
    }

    const id = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const slug = data.slug ? this.generateSlug(data.slug) : this.generateSlug(data.name);

    const newProduct: Product = {
      ...data,
      id,
      slug,
      sku: skuNormalized,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        const batch = writeBatch(db);
        
        // 1. Create product document
        batch.set(doc(db, 'products', id), newProduct);
        
        // 2. Register SKU to prevent duplicates
        batch.set(doc(db, 'sku_registry', skuNormalized), {
          productId: id,
          sku: skuNormalized,
          createdAt: now
        });

        await batch.commit();

        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'create',
          details: `Created SKU item: ${data.name} (${skuNormalized})`,
          targetResource: 'products',
          resourceId: id,
        });
      } catch (err) {
        console.warn('[ProductService] createProduct Firestore write error:', err);
        throw err;
      }
    }

    return newProduct;
  }

  /**
   * Update an existing Product
   */
  public async updateProduct(
    id: string,
    data: Partial<Product>,
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    const existingProduct = await this.getProductById(id);
    const oldSku = existingProduct?.sku?.toUpperCase().trim();
    const newSku = data.sku?.toUpperCase().trim();
    
    if (newSku && newSku !== oldSku) {
      const isSkuUnique = await this.isSkuUnique(newSku, id);
      if (!isSkuUnique) {
        throw new Error(`SKU "${newSku}" is already in use by another product.`);
      }
    }

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      ...data,
      updatedAt: now,
    };

    if (newSku) {
      updateData.sku = newSku;
    }

    if (data.name && !data.slug) {
      updateData.slug = this.generateSlug(data.name);
    } else if (data.slug) {
      updateData.slug = this.generateSlug(data.slug);
    }

    if (db) {
      try {
        const batch = writeBatch(db);
        
        // 1. Update product
        batch.update(doc(db, 'products', id), updateData);
        
        // 2. Handle SKU change in registry
        if (newSku && newSku !== oldSku) {
          // Delete old SKU if it exists
          if (oldSku) {
            batch.delete(doc(db, 'sku_registry', oldSku));
          }
          // Register new SKU
          batch.set(doc(db, 'sku_registry', newSku), {
            productId: id,
            sku: newSku,
            updatedAt: now
          });
        }

        await batch.commit();

        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'update',
          details: `Updated SKU product ID: ${id}${newSku && newSku !== oldSku ? ` (SKU changed from ${oldSku} to ${newSku})` : ''}`,
          targetResource: 'products',
          resourceId: id,
        });
        return true;
      } catch (err) {
        console.warn('[ProductService] updateProduct error:', err);
        throw err;
      }
    }
    return true;
  }

  /**
   * Archive a Product
   */
  public async archiveProduct(
    id: string,
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    return this.updateProduct(id, { status: 'archived', isAvailable: false }, authorUid, authorEmail);
  }

  /**
   * Delete a Product
   */
  public async deleteProduct(
    id: string,
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    const product = await this.getProductById(id);
    const sku = product?.sku?.toUpperCase().trim();

    if (db) {
      try {
        const batch = writeBatch(db);
        
        // 1. Delete product
        batch.delete(doc(db, 'products', id));
        
        // 2. Delete SKU from registry
        if (sku) {
          batch.delete(doc(db, 'sku_registry', sku));
        }

        await batch.commit();

        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'delete',
          details: `Deleted product SKU ID: ${id} (SKU: ${sku})`,
          targetResource: 'products',
          resourceId: id,
        });
        return true;
      } catch (err) {
        console.warn('[ProductService] deleteProduct error:', err);
        throw err;
      }
    }
    return true;
  }

  /**
   * Bulk Update Product Status
   */
  public async bulkUpdateStatus(
    productIds: string[],
    status: 'active' | 'draft' | 'archived',
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    const isAvailable = status === 'active';
    for (const id of productIds) {
      await this.updateProduct(id, { status, isAvailable }, authorUid, authorEmail);
    }
    return true;
  }

  /**
   * Bulk Delete Products
   */
  public async bulkDeleteProducts(
    productIds: string[],
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    for (const id of productIds) {
      await this.deleteProduct(id, authorUid, authorEmail);
    }
    return true;
  }
}

export const productService = new ProductService();
