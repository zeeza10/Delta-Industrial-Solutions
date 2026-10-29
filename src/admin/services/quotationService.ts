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
  setDoc,
  query, 
  where, 
  limit, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { FormalQuotation, Enquiry } from '../../types';
import { adminService } from './adminService';

export const quotationService = {
  /**
   * Fetch custom bulk inquiries/RFQs
   */
  async getEnquiries(params?: { status?: string; maxResults?: number }): Promise<Enquiry[]> {
    if (!db) return [];
    try {
      const constraints: any[] = [];
      if (params?.status) {
        constraints.push(where('status', '==', params.status));
      }
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(params?.maxResults || 50));

      const q = query(collection(db, 'enquiries'), ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Enquiry));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'enquiries');
      return [];
    }
  },

  /**
   * Issue formal quotation to customer from RFQ
   */
  async issueFormalQuotation(
    quotationData: Partial<FormalQuotation>,
    actor: { uid: string; name: string }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!db) return { success: false, error: 'Database service unavailable' };

    try {
      const newRef = doc(collection(db, 'quotations'));
      const now = new Date().toISOString();

      const payload: Omit<FormalQuotation, 'id'> = {
        quotationNumber: quotationData.quotationNumber || `RFQ-${Date.now().toString().slice(-6)}`,
        enquiryId: quotationData.enquiryId || '',
        userId: quotationData.userId || '',
        customerEmail: quotationData.customerEmail || '',
        companyName: quotationData.companyName || 'Enterprise Partner',
        lines: quotationData.lines || [],
        totalQuotedAmount: quotationData.totalQuotedAmount || 0,
        currency: quotationData.currency || 'USD',
        validityDays: quotationData.validityDays || 14,
        validUntil: quotationData.validUntil || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: quotationData.status || 'sent',
        paymentTerms: quotationData.paymentTerms || 'NET30',
        assignedAdminUid: actor.uid,
        notes: quotationData.notes || '',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(newRef, payload);

      // If associated with an enquiry, update enquiry status to 'quoted'
      if (payload.enquiryId) {
        try {
          await updateDoc(doc(db, 'enquiries', payload.enquiryId), {
            status: 'quoted',
            updatedAt: now,
          });
        } catch {
          // Non-blocking
        }
      }

      await adminService.logAdminActivity({
        adminUid: actor.uid,
        adminName: actor.name,
        action: 'create',
        targetResource: 'quotations',
        resourceId: newRef.id,
        details: `Issued quotation #${payload.quotationNumber} for ${payload.companyName}`,
      });

      return { success: true, id: newRef.id };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'quotations');
      return { success: false, error: err.message || 'Failed to issue formal quotation' };
    }
  },

  /**
   * Get formal quotation by ID
   */
  async getQuotationById(id: string): Promise<FormalQuotation | null> {
    if (!db || !id) return null;
    try {
      const snap = await getDoc(doc(db, 'quotations', id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as FormalQuotation;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `quotations/${id}`);
      return null;
    }
  },
};
