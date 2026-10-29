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
import { UserProfile, UserRole } from '../../types';
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

  /**
   * Get all registered enterprise users from Firestore
   */
  async getUsers(): Promise<any[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'users'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id, uid: d.id }));
    } catch (err) {
      console.warn('Unable to fetch live users from Firestore, using baseline:', err);
      return [];
    }
  },

  /**
   * Update an enterprise user's RBAC role with strict Owner protection
   */
  async updateUserRole(
    targetUid: string, 
    targetEmail: string, 
    newRole: UserRole,
    adminActor: { uid: string; email: string; name: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) {
      return { success: false, error: 'Database service is currently unreachable.' };
    }

    // Protection rule: Root owner cannot be demoted or changed
    if (targetEmail.toLowerCase().trim() === '309amaanu@gmail.com' && newRole !== 'owner') {
      return { 
        success: false, 
        error: 'Security violation: The root designated system owner cannot be demoted or modified.' 
      };
    }

    const path = `users/${targetUid}`;
    try {
      const userRef = doc(db, 'users', targetUid);
      const now = new Date().toISOString();
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: now,
      });

      // Synchronize /admins lookup collection
      const adminLookupRef = doc(db, 'admins', targetUid);
      if (newRole !== 'customer') {
        await setDoc(adminLookupRef, {
          uid: targetUid,
          email: targetEmail,
          role: newRole,
          updatedAt: now,
        }, { merge: true });
      } else {
        try {
          await deleteDoc(adminLookupRef);
        } catch {
          // Non-blocking if admin record did not exist
        }
      }

      // Record in immutable audit logs
      await this.logAdminActivity({
        adminUid: adminActor.uid,
        adminName: adminActor.name || adminActor.email,
        action: 'status_change',
        targetResource: 'users',
        resourceId: targetUid,
        details: `Updated role of ${targetEmail} to ${newRole.toUpperCase()}`,
      });

      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return { success: false, error: err.message || 'Failed to update user authorization role.' };
    }
  },
};
