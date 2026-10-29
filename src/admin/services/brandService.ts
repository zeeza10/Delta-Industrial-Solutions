/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Brand } from '../../types';
import { adminValidation } from '../utils/validation';
import { adminService } from './adminService';

export const brandService = {
  /**
   * Get all brands ordered by name
   */
  async getBrands(): Promise<Brand[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'brands'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Brand));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'brands');
      return [];
    }
  },

  /**
   * Create brand
   */
  async createBrand(
    brandData: Partial<Brand>,
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!db) return { success: false, error: 'Database service unavailable' };

    const validation = adminValidation.validateBrand(brandData);
    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0];
      return { success: false, error: firstErr };
    }

    try {
      const newRef = doc(collection(db, 'brands'));
      const now = new Date().toISOString();
      const name = brandData.name!.trim();
      const slug = brandData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const payload: Omit<Brand, 'id'> = {
        name,
        slug,
        logo: brandData.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300',
        description: brandData.description || '',
        website: brandData.website || '',
        status: brandData.status || 'active',
        countryOfOrigin: brandData.countryOfOrigin || '',
        certifications: brandData.certifications || [],
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(newRef, payload);

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'create',
        targetResource: 'brands',
        resourceId: newRef.id,
        details: `Created brand "${payload.name}"`,
      });

      return { success: true, id: newRef.id };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'brands');
      return { success: false, error: err.message || 'Failed to create brand' };
    }
  },

  /**
   * Update brand
   */
  async updateBrand(
    id: string,
    updates: Partial<Brand>,
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (!db || !id) return { success: false, error: 'Database service unavailable' };

    try {
      const docRef = doc(db, 'brands', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'update',
        targetResource: 'brands',
        resourceId: id,
        details: `Updated brand ID: ${id}`,
      });

      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `brands/${id}`);
      return { success: false, error: err.message || 'Failed to update brand' };
    }
  },

  /**
   * Delete brand
   */
  async deleteBrand(
    id: string,
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (!db || !id) return { success: false, error: 'Database service unavailable' };

    try {
      await deleteDoc(doc(db, 'brands', id));

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'delete',
        targetResource: 'brands',
        resourceId: id,
        details: `Deleted brand ID: ${id}`,
      });

      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `brands/${id}`);
      return { success: false, error: err.message || 'Failed to delete brand' };
    }
  },
};
