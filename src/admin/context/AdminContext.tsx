/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { AdminRole, AdminUserCapability, SystemHealthStatus, HealthProbeStatus } from '../types/admin.types';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

interface AdminContextValue {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  adminRole: AdminRole;
  capabilities: AdminUserCapability;
  systemHealth: SystemHealthStatus;
  refreshSystemHealth: () => Promise<void>;
}

const defaultCapabilities: AdminUserCapability = {
  canManageProducts: false,
  canManagePricing: false,
  canManageEnquiries: false,
  canManageUsers: false,
  canAssignRoles: false,
  canManageSettings: false,
  canViewFinancials: false,
  canExportReports: false,
  canDeleteLogs: false,
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isOwner, role } = useAuth();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const openMobileMenu = useCallback(() => setIsMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const adminRole: AdminRole = useMemo(() => {
    if (isOwner) return 'owner';
    if (role === 'admin') return 'super_admin';
    if (role === 'manager') return 'procurement_admin';
    return 'support_admin';
  }, [isOwner, role]);

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
    if (role === 'admin') {
      return {
        canManageProducts: true,
        canManagePricing: true,
        canManageEnquiries: true,
        canManageUsers: true,
        canAssignRoles: false,
        canManageSettings: false,
        canViewFinancials: true,
        canExportReports: true,
        canDeleteLogs: false,
      };
    }
    if (role === 'manager') {
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
    return defaultCapabilities;
  }, [isOwner, role]);

  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus>({
    databaseStatus: db ? 'checking' : 'unconfigured',
    authStatus: auth ? 'connected' : 'unconfigured',
    lastChecked: null,
    databaseConnected: !!db,
    authConnected: !!auth,
    storageConnected: true,
    lastSyncTimestamp: new Date().toISOString(),
    pendingSyncOperations: 0,
  });

  const probeHealth = useCallback(async () => {
    if (!db) {
      setSystemHealth({
        databaseStatus: 'unconfigured',
        authStatus: auth ? 'connected' : 'unconfigured',
        lastChecked: new Date().toISOString(),
        databaseConnected: false,
        authConnected: !!auth,
        storageConnected: false,
        lastSyncTimestamp: new Date().toISOString(),
        pendingSyncOperations: 0,
      });
      return;
    }

    try {
      // Test real connection to Firestore server
      await getDocFromServer(doc(db, '_connection_probe_', 'health'));
      setSystemHealth({
        databaseStatus: 'connected',
        authStatus: auth ? 'connected' : 'unconfigured',
        lastChecked: new Date().toISOString(),
        databaseConnected: true,
        authConnected: !!auth,
        storageConnected: true,
        lastSyncTimestamp: new Date().toISOString(),
        pendingSyncOperations: 0,
      });
    } catch (err: any) {
      // If error indicates client is offline, mark disconnected
      const isOffline = err?.message?.toLowerCase().includes('offline') || err?.code === 'unavailable';
      const status: HealthProbeStatus = isOffline ? 'disconnected' : 'connected'; // Permission errors still mean server is connected and responding

      setSystemHealth({
        databaseStatus: status,
        authStatus: auth ? 'connected' : 'unconfigured',
        lastChecked: new Date().toISOString(),
        errorMessage: isOffline ? 'Firestore client is currently offline' : undefined,
        databaseConnected: status === 'connected',
        authConnected: !!auth,
        storageConnected: status === 'connected',
        lastSyncTimestamp: new Date().toISOString(),
        pendingSyncOperations: 0,
      });
    }
  }, []);

  useEffect(() => {
    probeHealth();
  }, [probeHealth]);

  const value = useMemo(
    () => ({
      isSidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      isMobileMenuOpen,
      openMobileMenu,
      closeMobileMenu,
      adminRole,
      capabilities,
      systemHealth,
      refreshSystemHealth: probeHealth,
    }),
    [
      isSidebarCollapsed,
      toggleSidebar,
      isMobileMenuOpen,
      openMobileMenu,
      closeMobileMenu,
      adminRole,
      capabilities,
      systemHealth,
      probeHealth,
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
