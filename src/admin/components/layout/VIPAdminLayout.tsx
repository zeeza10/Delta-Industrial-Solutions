/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { AdminProvider } from '../../context/AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { SEO } from '../../../components/common/SEO';

const VIPAdminLayoutContent: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e]">
        <SEO title="VIP Admin Control Center | Delta Industrial" noIndex={true} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin shadow-[0_0_20px_rgba(0,240,255,0.3)]" />
          <p className="text-xs font-mono text-cyan-400 tracking-widest uppercase">Authenticating VIP Admin Session...</p>
        </div>
      </div>
    );
  }

  // Authorization Guard: redirect non-admin accounts to root
  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex overflow-hidden">
      <SEO title="VIP Admin Control Center | Delta Industrial" noIndex={true} />

      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Administrative Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export const VIPAdminLayout: React.FC = () => {
  return (
    <AdminProvider>
      <VIPAdminLayoutContent />
    </AdminProvider>
  );
};
