/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  limit, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { PurchaseOrder } from '../../types';
import { adminService } from './adminService';

export const procurementService = {
  /**
   * Get list of purchase orders with optional status filter
   */
  async getPurchaseOrders(params?: { status?: PurchaseOrder['status']; maxResults?: number }): Promise<PurchaseOrder[]> {
    if (!db) return [];
    try {
      const constraints: any[] = [];
      if (params?.status) {
        constraints.push(where('status', '==', params.status));
      }
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(params?.maxResults || 50));

      const q = query(collection(db, 'purchase_orders'), ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseOrder));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'purchase_orders');
      return [];
    }
  },

  /**
   * Create purchase order
   */
  async createPurchaseOrder(
    poData: Partial<PurchaseOrder>,
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!db) return { success: false, error: 'Database service unavailable' };

    try {
      const newRef = doc(collection(db, 'purchase_orders'));
      const now = new Date().toISOString();

      const payload: Omit<PurchaseOrder, 'id'> = {
        poNumber: poData.poNumber || `PO-${Date.now().toString().slice(-6)}`,
        supplierId: poData.supplierId || '',
        supplierName: poData.supplierName || 'Vendor Partner',
        supplierEmail: poData.supplierEmail || '',
        lines: poData.lines || [],
        totalCost: poData.totalCost || 0,
        currency: poData.currency || 'USD',
        status: poData.status || 'draft',
        expectedDeliveryDate: poData.expectedDeliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdByUid: actor.uid,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(newRef, payload);

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'create',
        targetResource: 'purchase_orders',
        resourceId: newRef.id,
        details: `Issued Purchase Order #${payload.poNumber} to ${payload.supplierName}`,
      });

      return { success: true, id: newRef.id };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'purchase_orders');
      return { success: false, error: err.message || 'Failed to create purchase order' };
    }
  },

  /**
   * Update purchase order status
   */
  async updatePOStatus(
    id: string,
    newStatus: PurchaseOrder['status'],
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (!db || !id) return { success: false, error: 'Database service unavailable' };

    try {
      const docRef = doc(db, 'purchase_orders', id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'status_change',
        targetResource: 'purchase_orders',
        resourceId: id,
        details: `Updated Purchase Order status to ${newStatus}`,
      });

      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `purchase_orders/${id}`);
      return { success: false, error: err.message || 'Failed to update purchase order status' };
    }
  },
};
