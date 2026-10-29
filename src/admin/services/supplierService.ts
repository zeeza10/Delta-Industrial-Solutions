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
import { Supplier } from '../../types';
import { adminService } from './adminService';

export const supplierService = {
  /**
   * Get all vendor suppliers ordered by name
   */
  async getSuppliers(): Promise<Supplier[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'suppliers'), orderBy('companyName', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Supplier));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'suppliers');
      return [];
    }
  },

  /**
   * Create new supplier record
   */
  async createSupplier(
    supplierData: Partial<Supplier>,
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!db) return { success: false, error: 'Database service unavailable' };

    if (!supplierData.companyName || supplierData.companyName.trim().length < 2) {
      return { success: false, error: 'Supplier company name is required.' };
    }

    try {
      const newRef = doc(collection(db, 'suppliers'));
      const now = new Date().toISOString();
      const companyName = supplierData.companyName.trim();
      const slug = supplierData.slug || companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const payload: Omit<Supplier, 'id'> = {
        companyName,
        slug,
        contactPerson: supplierData.contactPerson || '',
        contactEmail: supplierData.contactEmail || '',
        phone: supplierData.phone || '',
        taxId: supplierData.taxId || '',
        paymentTerms: supplierData.paymentTerms || 'NET30',
        status: supplierData.status || 'active',
        rating: supplierData.rating || 5.0,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(newRef, payload);

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'create',
        targetResource: 'suppliers',
        resourceId: newRef.id,
        details: `Created supplier vendor "${payload.companyName}" (${payload.slug})`,
      });

      return { success: true, id: newRef.id };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'suppliers');
      return { success: false, error: err.message || 'Failed to create supplier' };
    }
  },

  /**
   * Update supplier profile
   */
  async updateSupplier(
    id: string,
    updates: Partial<Supplier>,
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (!db || !id) return { success: false, error: 'Database service unavailable' };

    try {
      const docRef = doc(db, 'suppliers', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'update',
        targetResource: 'suppliers',
        resourceId: id,
        details: `Updated supplier ID: ${id}`,
      });

      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `suppliers/${id}`);
      return { success: false, error: err.message || 'Failed to update supplier' };
    }
  },
};
