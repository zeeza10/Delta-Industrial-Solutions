/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdminNavItem {
  id: string;
  name: string;
  path: string;
  iconName: string;
  badge?: string;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

/**
 * Logically organized navigation groups strictly mapping to implemented routes in adminRoutes.tsx
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'overview',
    label: 'Overview & Intelligence',
    items: [
      { id: 'dashboard', name: 'Executive Overview', path: '/admin', iconName: 'LayoutDashboard' },
      { id: 'analytics', name: 'Commercial Analytics', path: '/admin/analytics', iconName: 'BarChart3' },
    ],
  },
  {
    id: 'operations',
    label: 'Business Operations',
    items: [
      { id: 'enquiries', name: 'B2B Procurement RFQs', path: '/admin/enquiries', iconName: 'MessageSquare', badge: 'Active' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog Management',
    items: [
      { id: 'products', name: 'Products & SKUs', path: '/admin/products', iconName: 'Package' },
      { id: 'categories', name: 'Taxonomies', path: '/admin/categories', iconName: 'Layers' },
      { id: 'brands', name: 'OEM Partners', path: '/admin/brands', iconName: 'Tag' },
    ],
  },
  {
    id: 'system',
    label: 'Administration & Policy',
    items: [
      { id: 'users', name: 'Corporate Accounts', path: '/admin/users', iconName: 'Users' },
      { id: 'settings', name: 'Control Settings', path: '/admin/settings', iconName: 'Settings' },
    ],
  },
];

// Flat list for quick lookups
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap(g => g.items);

export const ENQUIRY_STATUSES = [
  { value: 'pending', label: 'Pending Review', color: 'amber' },
  { value: 'reviewing', label: 'Under Review', color: 'blue' },
  { value: 'quoted', label: 'Quotation Sent', color: 'emerald' },
  { value: 'closed', label: 'Archived / Closed', color: 'slate' },
] as const;

export const ADMIN_PAGINATION_LIMITS = [10, 25, 50, 100] as const;

export const DEFAULT_ADMIN_CONFIG = {
  quoteValidityDays: 30,
  minBulkOrderUsd: 10000,
  zeroTrustEnforced: true,
  auditLoggingEnabled: true,
} as const;
