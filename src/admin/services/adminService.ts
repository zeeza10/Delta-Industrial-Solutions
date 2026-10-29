/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { AdminActivityLog } from '../types/admin.types';

export const adminService = {
  /**
   * Log an administrative action to Firestore activity logs
   */
  async logAdminActivity(entry: Omit<AdminActivityLog, 'id' | 'timestamp'>): Promise<void> {
    if (!db) return;
    try {
      const logsRef = doc(collection(db, 'admin_audit_logs'));
      await setDoc(logsRef, {
        ...entry,
        timestamp: new Date().toISOString(),
        serverTime: serverTimestamp(),
      });
    } catch {
      // In offline / preview fallback mode, non-blocking
    }
  },

  /**
   * Get recent audit logs
   */
  async getRecentAuditLogs(count = 10): Promise<AdminActivityLog[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'admin_audit_logs'), orderBy('timestamp', 'desc'), limit(count));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminActivityLog));
    } catch {
      return [];
    }
  },

  /**
   * Update enquiry status with audit confirmation
   */
  async updateEnquiryStatus(enquiryId: string, status: string): Promise<boolean> {
    if (!db) return false;
    const path = `enquiries/${enquiryId}`;
    try {
      const enquiryRef = doc(db, 'enquiries', enquiryId);
      await updateDoc(enquiryRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return false;
    }
  },

  /**
   * Delete product by ID with error tracking
   */
  async deleteProduct(productId: string): Promise<boolean> {
    if (!db) return false;
    const path = `products/${productId}`;
    try {
      await deleteDoc(doc(db, 'products', productId));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      return false;
    }
  },
};
