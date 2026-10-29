/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  query, 
  where, 
  limit, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Order, StockMovementType } from '../../types';
import { adminService } from './adminService';
import { inventoryService } from './inventoryService';

export const orderService = {
  /**
   * Get list of enterprise orders with optional status filter
   */
  async getOrders(params?: { status?: Order['status']; maxResults?: number }): Promise<Order[]> {
    if (!db) return [];
    try {
      const constraints: any[] = [];
      if (params?.status) {
        constraints.push(where('status', '==', params.status));
      }
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(params?.maxResults || 50));

      const q = query(collection(db, 'orders'), ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'orders');
      return [];
    }
  },

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    if (!db || !id) return null;
    try {
      const snap = await getDoc(doc(db, 'orders', id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Order;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `orders/${id}`);
      return null;
    }
  },

  /**
   * Update order status with audit log record
   */
  async updateOrderStatus(
    id: string,
    newStatus: Order['status'],
    trackingNumber: string | undefined,
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (!db || !id) return { success: false, error: 'Database service unavailable' };

    try {
      const orderRef = doc(db, 'orders', id);
      const now = new Date().toISOString();
      const updates: Record<string, any> = {
        status: newStatus,
        updatedAt: now,
      };

      if (trackingNumber) {
        updates.trackingNumber = trackingNumber;
      }

      // 1. Get original order to check items and current status
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) throw new Error('Order not found');
      const orderData = orderSnap.data() as Order;
      const oldStatus = orderData.status;

      // 2. Perform Inventory Adjustments if needed
      if (newStatus !== oldStatus) {
        // Example: If cancelled, return items to stock
        if (newStatus === 'cancelled') {
          for (const item of orderData.items) {
            await inventoryService.adjustStock({
              productId: item.productId,
              sku: item.skuAtPurchase,
              delta: item.quantity,
              type: 'order_cancellation_release',
              reason: `Order #${id} cancelled`,
              actor: { uid: actor.uid, email: actor.name, role: 'admin' }
            });
          }
        }
        
        // Example: If shipped, record as stock issued (if not already issued)
        if (newStatus === 'shipped' && oldStatus !== 'delivered') {
          for (const item of orderData.items) {
            await inventoryService.adjustStock({
              productId: item.productId,
              sku: item.skuAtPurchase,
              delta: -item.quantity,
              type: 'stock_issued',
              reason: `Order #${id} shipped`,
              actor: { uid: actor.uid, email: actor.name, role: 'admin' },
              allowNegative: true // In case of data discrepancy, shipment must proceed
            });
          }
        }
      }

      await updateDoc(orderRef, updates);

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'status_change',
        targetResource: 'orders',
        resourceId: id,
        details: `Updated order #${id} status from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`,
      });

      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
      return { success: false, error: err.message || 'Failed to update order status' };
    }
  },
};
