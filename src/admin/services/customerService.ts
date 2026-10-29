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
  limit, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Customer, UserRole } from '../../types';
import { adminService } from './adminService';

export const customerService = {
  /**
   * Get registered customers and user profiles
   */
  async getCustomers(maxResults = 50): Promise<Customer[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(maxResults));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        const displayName = data.displayName || data.name || data.email?.split('@')[0] || 'Customer';
        const parts = displayName.trim().split(' ');
        const firstName = parts[0] || 'Customer';
        const lastName = parts.slice(1).join(' ') || '';

        return {
          id: d.id,
          email: data.email || '',
          firstName,
          lastName,
          companyName: data.company || data.companyName || 'Enterprise Account',
          phone: data.phone || '',
          status: data.status || 'active',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as Customer;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
      return [];
    }
  },

  /**
   * Get single customer by UID
   */
  async getCustomerById(uid: string): Promise<Customer | null> {
    if (!db || !uid) return null;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      const displayName = data.displayName || data.name || 'Customer';
      const parts = displayName.trim().split(' ');
      const firstName = parts[0] || 'Customer';
      const lastName = parts.slice(1).join(' ') || '';

      return {
        id: snap.id,
        email: data.email || '',
        firstName,
        lastName,
        companyName: data.company || data.companyName || '',
        phone: data.phone || '',
        status: data.status || 'active',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as Customer;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  /**
   * Update customer status
   */
  async updateCustomerStatus(
    uid: string,
    updates: { status?: 'active' | 'suspended'; role?: UserRole },
    actor: { uid: string; email: string; name: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (!db || !uid) return { success: false, error: 'Database service unavailable' };

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'status_change',
        targetResource: 'users',
        resourceId: uid,
        details: `Updated customer state: ${JSON.stringify(updates)}`,
      });

      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      return { success: false, error: err.message || 'Failed to update customer status' };
    }
  },
};
