/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { AdminProvider } from '../../context/AdminContext';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { VIPAdminAccessGate } from '../auth/VIPAdminAccessGate';
import { VIPAdminAccessDenied } from '../auth/VIPAdminAccessDenied';
import { SEO } from '../../../components/common/SEO';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const VIPAdminLayoutContent: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const { canAccessRoute, roleTitle, isOwner } = useAdminPermissions();
  const location = useLocation();

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

  // 1. Unauthenticated: Render dedicated VIP Admin Access Gate
  if (!user) {
    return <VIPAdminAccessGate redirectUrl={location.pathname} />;
  }

  // 2. Authenticated but unauthorized (customer tier): Render VIP Access Denied Screen
  if (user && !isAdmin) {
    return <VIPAdminAccessDenied />;
  }

  // 3. Authenticated Admin: check section-level clearance
  const hasRouteAccess = canAccessRoute(location.pathname);

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
            {!hasRouteAccess ? (
              <div className="p-6 rounded-xl bg-[#121823] border border-amber-500/30 text-xs font-mono space-y-4">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-sm uppercase tracking-wider">
                    Elevated Permission Required
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your current tier (<span className="text-amber-300 font-bold">{roleTitle}</span>) does not have authorization to access this administrative zone. This module is restricted to higher administrative clearance levels.
                </p>
                <div className="pt-2">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-slate-200 text-xs transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#22D3EE]" />
                    <span>Return to Command Dashboard</span>
                  </Link>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
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
