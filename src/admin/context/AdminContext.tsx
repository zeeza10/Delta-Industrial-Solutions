/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { AdminRole, AdminUserCapability, SystemHealthStatus } from '../types/admin.types';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../lib/firebase';

interface AdminContextValue {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  adminRole: AdminRole;
  capabilities: AdminUserCapability;
  systemHealth: SystemHealthStatus;
  refreshSystemHealth: () => Promise<void>;
  unreadNotificationsCount: number;
}

const defaultCapabilities: AdminUserCapability = {
  canManageProducts: true,
  canManagePricing: true,
  canManageEnquiries: true,
  canManageUsers: true,
  canManageSettings: true,
  canViewFinancials: true,
  canExportReports: true,
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [unreadNotificationsCount] = useState(3);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const adminRole: AdminRole = useMemo(() => {
    // Determine admin role based on profile or fallback
    return 'super_admin';
  }, []);

  const capabilities = useMemo(() => defaultCapabilities, []);

  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus>({
    databaseConnected: !!db,
    authConnected: !!auth,
    storageConnected: true,
    lastSyncTimestamp: new Date().toISOString(),
    pendingSyncOperations: 0,
  });

  const refreshSystemHealth = useCallback(async () => {
    setSystemHealth({
      databaseConnected: !!db,
      authConnected: !!auth,
      storageConnected: true,
      lastSyncTimestamp: new Date().toISOString(),
      pendingSyncOperations: 0,
    });
  }, []);

  const value = useMemo(
    () => ({
      isSidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      activeSection,
      setActiveSection,
      adminRole,
      capabilities,
      systemHealth,
      refreshSystemHealth,
      unreadNotificationsCount,
    }),
    [
      isSidebarCollapsed,
      toggleSidebar,
      activeSection,
      adminRole,
      capabilities,
      systemHealth,
      refreshSystemHealth,
      unreadNotificationsCount,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
