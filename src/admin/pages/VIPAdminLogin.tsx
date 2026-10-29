/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VIPAdminAccessGate } from '../components/auth/VIPAdminAccessGate';
import { VIPAdminAccessDenied } from '../components/auth/VIPAdminAccessDenied';

export const VIPAdminLogin: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090B10]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#273244] border-t-[#22D3EE] animate-spin" />
          <p className="text-xs font-mono text-slate-400 tracking-widest uppercase">
            Resolving Admin Security State...
          </p>
        </div>
      </div>
    );
  }

  // If already authenticated with admin privileges, navigate directly to admin dashboard
  if (user && isAdmin) {
    return <Navigate to={redirectUrl} replace />;
  }

  // If user is authenticated but lacks admin role, show access denied
  if (user && !isAdmin) {
    return <VIPAdminAccessDenied />;
  }

  // Unauthenticated: show VIP access gate
  return <VIPAdminAccessGate redirectUrl={redirectUrl} />;
};

export default VIPAdminLogin;
