/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminUserCapability } from '../types/admin.types';

export const useAdminPermissions = () => {
  const { user, profile, isAdmin } = useAuth();

  const capabilities: AdminUserCapability = useMemo(() => {
    const isSuper = isAdmin || profile?.role === 'admin';
    return {
      canManageProducts: isSuper,
      canManagePricing: isSuper,
      canManageEnquiries: isSuper,
      canManageUsers: isSuper,
      canManageSettings: isSuper,
      canViewFinancials: isSuper,
      canExportReports: isSuper,
    };
  }, [isAdmin, profile?.role]);

  return {
    isAuthorized: isAdmin,
    capabilities,
    userEmail: user?.email || '',
    userDisplayName: user?.displayName || 'VIP Administrator',
  };
};
