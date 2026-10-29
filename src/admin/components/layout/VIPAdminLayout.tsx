/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { AdminProvider } from '../../context/AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { SEO } from '../../../components/common/SEO';

const VIPAdminLayoutContent: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090B10]">
        <SEO title="VIP Admin Control Center | Delta Industrial" noIndex={true} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#273244] border-t-[#22D3EE] animate-spin" />
          <p className="text-xs font-mono text-slate-400 tracking-widest uppercase">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  // Authorization Guard: redirect non-admin accounts to root
  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen w-full bg-[#090B10] text-slate-100 flex overflow-hidden antialiased">
      <SEO title="VIP Admin Control Center | Delta Industrial" noIndex={true} />

      {/* Persistent Left Navigation Sidebar */}
      <AdminSidebar />

      {/* Main Administrative Workspace Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Persistent Top Header */}
        <AdminHeader />

        {/* Primary Content Region with consistent gutters and singular scroll container */}
        <main 
          id="admin-main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 custom-scrollbar focus:outline-none"
        >
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
