/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Admin Panel Types & Capabilities
 */

import { UserRole } from '../../types';

export type AdminRole = UserRole;

export type AdminStatusBadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'vip';

export type HealthProbeStatus = 'connected' | 'disconnected' | 'checking' | 'unconfigured';

export interface AdminUserCapability {
  canManageProducts: boolean;
  canManagePricing: boolean;
  canManageEnquiries: boolean;
  canManageUsers: boolean;
  canAssignRoles: boolean;
  canManageSettings: boolean;
  canViewFinancials: boolean;
  canExportReports: boolean;
  canDeleteLogs: boolean;
}

export interface AdminMetricSummary {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  changePercent?: number;
  isPositiveChange?: boolean;
  trendText?: string;
  iconName?: string;
  highlightVariant?: AdminStatusBadgeVariant;
}

// --- 5.10 Audit Logs ---
export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminUid: string;
  adminName: string;
  actorRole?: AdminRole;
  action: 
    | 'create' 
    | 'update' 
    | 'delete' 
    | 'export' 
    | 'status_change' 
    | 'login' 
    | 'logout' 
    | 'auth_failure' 
    | 'owner_bootstrap' 
    | 'role_assignment' 
    | 'suspension'
    | 'system_configuration';
  targetResource: 
    | 'products' 
    | 'categories' 
    | 'brands' 
    | 'enquiries' 
    | 'users' 
    | 'settings' 
    | 'security'
    | 'orders'
    | 'quotations'
    | 'inventory'
    | 'inventory_movements'
    | 'suppliers'
    | 'purchase_orders';
  resourceId?: string;
  details: string;
  correlationId?: string; // Request / Trace ID
  metadata?: Record<string, any>;
}

export interface AdminFilterState {
  searchQuery: string;
  statusFilter?: string;
  categoryFilter?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SystemHealthStatus {
  databaseStatus: HealthProbeStatus;
  authStatus: HealthProbeStatus;
  lastChecked: string | null;
  errorMessage?: string;
  // Backward compatibility
  databaseConnected: boolean;
  authConnected: boolean;
  storageConnected: boolean;
  lastSyncTimestamp: string;
  pendingSyncOperations: number;
}
