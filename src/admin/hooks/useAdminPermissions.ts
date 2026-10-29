/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminUserCapability } from '../types/admin.types';
import { hasPermission, CapabilityId } from '../constants/permissions';

export const useAdminPermissions = () => {
  const { user, profile, isOwner, isAdmin, isStaff, role } = useAuth();

  const isManager = role === 'manager';

  const capabilities: AdminUserCapability = useMemo(() => {
    if (isOwner) {
      return {
        canManageProducts: true,
        canManagePricing: true,
        canManageEnquiries: true,
        canManageUsers: true,
        canAssignRoles: true,
        canManageSettings: true,
        canViewFinancials: true,
        canExportReports: true,
        canDeleteLogs: true,
      };
    }

    if (role === 'admin' || role === 'super_admin') {
      return {
        canManageProducts: true,
        canManagePricing: true,
        canManageEnquiries: true,
        canManageUsers: true,
        canAssignRoles: role === 'super_admin' || isOwner,
        canManageSettings: role === 'super_admin' || isOwner,
        canViewFinancials: true,
        canExportReports: true,
        canDeleteLogs: isOwner,
      };
    }

    if (isManager) {
      return {
        canManageProducts: true,
        canManagePricing: false,
        canManageEnquiries: true,
        canManageUsers: false,
        canAssignRoles: false,
        canManageSettings: false,
        canViewFinancials: false,
        canExportReports: true,
        canDeleteLogs: false,
      };
    }

    // Default for staff, viewer, customer or unauthenticated
    return {
      canManageProducts: hasPermission(role, 'products.update'),
      canManagePricing: hasPermission(role, 'products.create'),
      canManageEnquiries: hasPermission(role, 'enquiries.manage'),
      canManageUsers: hasPermission(role, 'users.manage'),
      canAssignRoles: hasPermission(role, 'roles.manage'),
      canManageSettings: hasPermission(role, 'settings.manage'),
      canViewFinancials: hasPermission(role, 'analytics.view'),
      canExportReports: hasPermission(role, 'analytics.view'),
      canDeleteLogs: false,
    };
  }, [isOwner, role, isManager]);

  const hasCap = useCallback(
    (capability: CapabilityId): boolean => {
      return hasPermission(role, capability);
    },
    [role]
  );

  const canAccessRoute = (pathname: string): boolean => {
    if (!isAdmin) return false;
    if (isOwner) return true;

    if (pathname.startsWith('/admin/settings')) {
      return hasPermission(role, 'settings.view');
    }
    if (pathname.startsWith('/admin/users')) {
      return hasPermission(role, 'users.view');
    }
    if (pathname.startsWith('/admin/products') || pathname.startsWith('/admin/categories') || pathname.startsWith('/admin/brands')) {
      return hasPermission(role, 'products.view');
    }
    if (pathname.startsWith('/admin/enquiries')) {
      return hasPermission(role, 'enquiries.view');
    }
    if (pathname.startsWith('/admin/analytics')) {
      return hasPermission(role, 'analytics.view');
    }

    return true;
  };

  const roleTitle = useMemo(() => {
    if (isOwner) return 'System Owner';
    if (role === 'super_admin') return 'Super Administrator';
    if (role === 'admin') return 'Executive Administrator';
    if (role === 'manager') return 'Operations Manager';
    if (role === 'procurement_admin') return 'Procurement Lead';
    if (role === 'catalog_manager') return 'Catalog Specialist';
    if (role === 'support_admin') return 'Support Lead';
    if (role === 'staff') return 'Operations Staff';
    if (role === 'viewer') return 'Auditor / Viewer';
    return 'Corporate Buyer';
  }, [isOwner, role]);

  return {
    isAuthorized: isAdmin,
    isOwner,
    isAdmin,
    isManager,
    isStaff,
    role,
    roleTitle,
    capabilities,
    hasCap,
    canAccessRoute,
    userEmail: user?.email || '',
    userDisplayName: user?.displayName || (isOwner ? 'System Owner' : 'VIP Administrator'),
  };
};

