/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AdminRole = 'super_admin' | 'procurement_admin' | 'catalog_manager' | 'support_admin';

export type AdminStatusBadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'vip';

export type HealthProbeStatus = 'connected' | 'disconnected' | 'checking' | 'unconfigured';

export interface AdminUserCapability {
  canManageProducts: boolean;
  canManagePricing: boolean;
  canManageEnquiries: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewFinancials: boolean;
  canExportReports: boolean;
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

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminUid: string;
  adminName: string;
  action: 'create' | 'update' | 'delete' | 'export' | 'status_change';
  targetResource: 'products' | 'categories' | 'brands' | 'enquiries' | 'users' | 'settings';
  resourceId?: string;
  details: string;
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
