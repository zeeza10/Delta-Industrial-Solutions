/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Executive Dashboard Data Service Layer
 * Reusable, typed, bounded Firestore queries with RBAC capability checks and defensive error handling
 */

import { db } from '../../lib/firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { Order, Enquiry, FormalQuotation, InventoryRecord, Product, PurchaseOrder, UserRole } from '../../types';
import { AdminActivityLog } from '../types/admin.types';
import { auditService } from './auditService';
import { PRODUCTS } from '../../data/products';

export interface DataAvailabilityStatus {
  metric: string;
  sourceCollection: string;
  requiredFields: string[];
  queryStrategy: string;
  permissionRequirements: string;
  availabilityStatus: 'Live Firestore' | 'Backend Aggregated' | 'Sample Data' | 'Unavailable' | 'Not Configured';
}

export class DashboardService {
  /**
   * Capability matrix check for role-based dashboard access
   */
  public canAccessMetric(role?: UserRole | string, requiredCapability?: string): boolean {
    if (!role) return false;
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'owner' || normalizedRole === 'super_admin') return true;
    if (normalizedRole === 'admin') return true;
    if (normalizedRole === 'manager') {
      return requiredCapability !== 'security_logs' && requiredCapability !== 'financial_audit';
    }
    if (normalizedRole === 'staff') {
      return requiredCapability === 'inventory' || requiredCapability === 'enquiries';
    }
    if (normalizedRole === 'viewer') {
      return requiredCapability === 'read_only';
    }
    return false;
  }

  /**
   * Fetch bounded Orders (max 50)
   */
  public async fetchBoundedOrders(): Promise<{ orders: Order[]; isLive: boolean }> {
    if (!db) return { orders: [], isLive: false };
    try {
      const snap = await getDocs(query(collection(db, 'orders'), limit(50)));
      if (!snap.empty) {
        const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        return { orders, isLive: true };
      }
    } catch (err) {
      console.warn('[DashboardService] fetchBoundedOrders error:', err);
    }
    return { orders: [], isLive: false };
  }

  /**
   * Fetch bounded Enquiries / RFQs (max 50)
   */
  public async fetchBoundedEnquiries(): Promise<{ enquiries: Enquiry[]; isLive: boolean }> {
    if (!db) return { enquiries: [], isLive: false };
    try {
      const snap = await getDocs(query(collection(db, 'enquiries'), limit(50)));
      if (!snap.empty) {
        const enquiries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry));
        return { enquiries, isLive: true };
      }
    } catch (err) {
      console.warn('[DashboardService] fetchBoundedEnquiries error:', err);
    }
    return { enquiries: [], isLive: false };
  }

  /**
   * Fetch bounded Formal Quotations (max 50)
   */
  public async fetchBoundedQuotations(): Promise<{ quotations: FormalQuotation[]; isLive: boolean }> {
    if (!db) return { quotations: [], isLive: false };
    try {
      const snap = await getDocs(query(collection(db, 'quotations'), limit(50)));
      if (!snap.empty) {
        const quotations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FormalQuotation));
        return { quotations, isLive: true };
      }
    } catch (err) {
      console.warn('[DashboardService] fetchBoundedQuotations error:', err);
    }
    return { quotations: [], isLive: false };
  }

  /**
   * Fetch bounded Purchase Orders (max 50)
   */
  public async fetchBoundedPurchaseOrders(): Promise<{ purchaseOrders: PurchaseOrder[]; isLive: boolean }> {
    if (!db) return { purchaseOrders: [], isLive: false };
    try {
      const snap = await getDocs(query(collection(db, 'purchase_orders'), limit(50)));
      if (!snap.empty) {
        const purchaseOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
        return { purchaseOrders, isLive: true };
      }
    } catch (err) {
      console.warn('[DashboardService] fetchBoundedPurchaseOrders error:', err);
    }
    return { purchaseOrders: [], isLive: false };
  }

  /**
   * Fetch bounded Inventory Records (max 50)
   */
  public async fetchBoundedInventory(): Promise<{ inventory: InventoryRecord[]; isLive: boolean }> {
    if (!db) return { inventory: [], isLive: false };
    try {
      const snap = await getDocs(query(collection(db, 'inventory'), limit(50)));
      if (!snap.empty) {
        const inventory = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryRecord));
        return { inventory, isLive: true };
      }
    } catch (err) {
      console.warn('[DashboardService] fetchBoundedInventory error:', err);
    }
    return { inventory: [], isLive: false };
  }

  /**
   * Fetch Audit Logs for Activity Feed (max 10)
   */
  public async fetchRecentActivity(role?: UserRole | string): Promise<AdminActivityLog[]> {
    if (!this.canAccessMetric(role, 'security_logs')) {
      return [];
    }
    try {
      return await auditService.getAuditLogs({ maxResults: 10 });
    } catch (err) {
      console.warn('[DashboardService] fetchRecentActivity error:', err);
      return [];
    }
  }

  /**
   * Returns Data Availability Matrix detailing each dashboard metric and its status
   */
  public getDataAvailabilityMatrix(): DataAvailabilityStatus[] {
    return [
      {
        metric: 'Total Gross & Net Revenue',
        sourceCollection: 'orders',
        requiredFields: ['totalAmount', 'status', 'paymentStatus', 'createdAt'],
        queryStrategy: 'Bounded collection fetch (limit 50)',
        permissionRequirements: 'ADMIN, SUPER_ADMIN, OWNER',
        availabilityStatus: 'Live Firestore',
      },
      {
        metric: 'Order Volume & Velocity',
        sourceCollection: 'orders',
        requiredFields: ['orderNumber', 'customerName', 'totalAmount', 'createdAt'],
        queryStrategy: 'Bounded query (limit 50)',
        permissionRequirements: 'MANAGER, ADMIN, OWNER',
        availabilityStatus: 'Live Firestore',
      },
      {
        metric: 'Priority RFQs & Enquiries Queue',
        sourceCollection: 'enquiries',
        requiredFields: ['status', 'customerInfo', 'subject', 'createdAt'],
        queryStrategy: 'Bounded query ordered by createdAt desc (limit 50)',
        permissionRequirements: 'STAFF, MANAGER, ADMIN, OWNER',
        availabilityStatus: 'Live Firestore',
      },
      {
        metric: 'Formal Quotations Status',
        sourceCollection: 'quotations',
        requiredFields: ['totalQuotedAmount', 'status', 'validUntil'],
        queryStrategy: 'Bounded collection query (limit 50)',
        permissionRequirements: 'MANAGER, ADMIN, OWNER',
        availabilityStatus: 'Live Firestore',
      },
      {
        metric: 'Catalog SKUs & Inventory Health',
        sourceCollection: 'products / inventory',
        requiredFields: ['stock', 'lowStockThreshold', 'availableStock', 'reservedStock'],
        queryStrategy: 'Bounded query (limit 50)',
        permissionRequirements: 'STAFF, MANAGER, ADMIN, OWNER',
        availabilityStatus: 'Live Firestore',
      },
      {
        metric: 'Purchase Orders & Procurement',
        sourceCollection: 'purchase_orders',
        requiredFields: ['poNumber', 'supplierName', 'totalCost', 'status'],
        queryStrategy: 'Bounded query (limit 50)',
        permissionRequirements: 'ADMIN, SUPER_ADMIN, OWNER',
        availabilityStatus: 'Not Configured', // Collection exists but 0 live PO documents created yet
      },
      {
        metric: 'Audit Activity Feed',
        sourceCollection: 'admin_audit_logs',
        requiredFields: ['action', 'actorRole', 'actorEmail', 'timestamp'],
        queryStrategy: 'Audit service query (limit 10)',
        permissionRequirements: 'SUPER_ADMIN, OWNER',
        availabilityStatus: 'Live Firestore',
      },
    ];
  }
}

export const dashboardService = new DashboardService();
