/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CapabilityId =
  | 'dashboard.view'
  | 'analytics.view'
  | 'products.view'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'categories.view'
  | 'categories.manage'
  | 'brands.view'
  | 'brands.manage'
  | 'enquiries.view'
  | 'enquiries.manage'
  | 'orders.view'
  | 'orders.manage'
  | 'customers.view'
  | 'customers.manage'
  | 'inventory.view'
  | 'inventory.manage'
  | 'quotations.view'
  | 'quotations.manage'
  | 'suppliers.view'
  | 'suppliers.manage'
  | 'procurement.manage'
  | 'users.view'
  | 'users.manage'
  | 'roles.manage'
  | 'settings.view'
  | 'settings.manage'
  | 'audit.view'
  | 'integrations.manage';

export type UserRole = 
  | 'owner' 
  | 'super_admin' 
  | 'admin' 
  | 'manager' 
  | 'procurement_admin'
  | 'catalog_manager'
  | 'support_admin'
  | 'staff' 
  | 'viewer' 
  | 'customer';

/**
 * Standard matrix mapping each role to its explicitly granted capabilities.
 * Deny-by-default architecture: Any role or capability not present in the set returns false.
 */
export const ROLE_PERMISSIONS: Record<string, Set<CapabilityId>> = {
  owner: new Set<CapabilityId>([
    'dashboard.view',
    'analytics.view',
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'categories.view',
    'categories.manage',
    'brands.view',
    'brands.manage',
    'enquiries.view',
    'enquiries.manage',
    'orders.view',
    'orders.manage',
    'customers.view',
    'customers.manage',
    'inventory.view',
    'inventory.manage',
    'quotations.view',
    'quotations.manage',
    'suppliers.view',
    'suppliers.manage',
    'procurement.manage',
    'users.view',
    'users.manage',
    'roles.manage',
    'settings.view',
    'settings.manage',
    'audit.view',
    'integrations.manage',
  ]),

  super_admin: new Set<CapabilityId>([
    'dashboard.view',
    'analytics.view',
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'categories.view',
    'categories.manage',
    'brands.view',
    'brands.manage',
    'enquiries.view',
    'enquiries.manage',
    'orders.view',
    'orders.manage',
    'customers.view',
    'customers.manage',
    'inventory.view',
    'inventory.manage',
    'quotations.view',
    'quotations.manage',
    'suppliers.view',
    'suppliers.manage',
    'procurement.manage',
    'users.view',
    'users.manage',
    'settings.view',
    'settings.manage',
    'audit.view',
    'integrations.manage',
    // Excludes roles.manage for Owner protection
  ]),

  admin: new Set<CapabilityId>([
    'dashboard.view',
    'analytics.view',
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'categories.view',
    'categories.manage',
    'brands.view',
    'brands.manage',
    'enquiries.view',
    'enquiries.manage',
    'orders.view',
    'orders.manage',
    'customers.view',
    'customers.manage',
    'inventory.view',
    'inventory.manage',
    'quotations.view',
    'quotations.manage',
    'suppliers.view',
    'suppliers.manage',
    'procurement.manage',
    'users.view',
    'settings.view',
  ]),

  manager: new Set<CapabilityId>([
    'dashboard.view',
    'analytics.view',
    'products.view',
    'products.create',
    'products.update',
    'categories.view',
    'categories.manage',
    'brands.view',
    'brands.manage',
    'enquiries.view',
    'enquiries.manage',
    'orders.view',
    'orders.manage',
    'customers.view',
    'inventory.view',
    'inventory.manage',
    'quotations.view',
    'quotations.manage',
  ]),

  procurement_admin: new Set<CapabilityId>([
    'dashboard.view',
    'enquiries.view',
    'enquiries.manage',
    'orders.view',
    'orders.manage',
    'quotations.view',
    'quotations.manage',
    'suppliers.view',
    'suppliers.manage',
    'procurement.manage',
    'inventory.view',
  ]),

  catalog_manager: new Set<CapabilityId>([
    'dashboard.view',
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'categories.view',
    'categories.manage',
    'brands.view',
    'brands.manage',
    'inventory.view',
    'inventory.manage',
  ]),

  support_admin: new Set<CapabilityId>([
    'dashboard.view',
    'enquiries.view',
    'enquiries.manage',
    'customers.view',
    'orders.view',
    'quotations.view',
  ]),

  staff: new Set<CapabilityId>([
    'dashboard.view',
    'products.view',
    'categories.view',
    'brands.view',
    'enquiries.view',
    'orders.view',
    'inventory.view',
    'quotations.view',
  ]),

  viewer: new Set<CapabilityId>([
    'dashboard.view',
    'analytics.view',
    'products.view',
    'categories.view',
    'brands.view',
    'enquiries.view',
    'orders.view',
    'customers.view',
    'inventory.view',
    'quotations.view',
    'suppliers.view',
  ]),

  customer: new Set<CapabilityId>([]),
};

/**
 * Evaluates whether a given user role possesses a specific capability.
 * Strictly returns false if the role is missing, unmapped, or capability is not granted.
 */
export const hasPermission = (
  role: string | null | undefined, 
  capability: CapabilityId
): boolean => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role.toLowerCase()];
  if (!permissions) return false;
  return permissions.has(capability);
};
