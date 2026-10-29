/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { AdminActivityLog } from '../types/admin.types';
import { adminService } from './adminService';

export const auditService = {
  /**
   * Fetch system audit logs with optional filters
   */
  async getAuditLogs(params?: {
    adminUid?: string;
    targetResource?: string;
    action?: string;
    maxResults?: number;
  }): Promise<AdminActivityLog[]> {
    if (!db) return [];
    try {
      const constraints: any[] = [];

      if (params?.adminUid) {
        constraints.push(where('adminUid', '==', params.adminUid));
      }
      if (params?.targetResource) {
        constraints.push(where('targetResource', '==', params.targetResource));
      }
      if (params?.action) {
        constraints.push(where('action', '==', params.action));
      }

      constraints.push(orderBy('timestamp', 'desc'));
      constraints.push(limit(params?.maxResults || 50));

      const q = query(collection(db, 'admin_audit_logs'), ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminActivityLog));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'admin_audit_logs');
      return [];
    }
  },

  /**
   * Record security/audit entry
   */
  async log(entry: Omit<AdminActivityLog, 'id' | 'timestamp'>): Promise<void> {
    await adminService.logAdminActivity(entry);
  },
};
