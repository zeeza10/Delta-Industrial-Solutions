/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  UserX, 
  LogOut, 
  CornerDownLeft, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth, TARGET_OWNER_EMAIL } from '../../../context/AuthContext';
import { SEO } from '../../../components/common/SEO';

export const VIPAdminAccessDenied: React.FC = () => {
  const { user, profile, role, signOut, claimOwnerRole } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const isDesignatedOwner = user?.email?.toLowerCase().trim() === TARGET_OWNER_EMAIL;

  const handleClaimOwner = async () => {
    setIsClaiming(true);
    setClaimError(null);
    const res = await claimOwnerRole();
    setIsClaiming(false);

    if (res.success) {
      setClaimSuccess(true);
      window.location.reload();
    } else {
      setClaimError(res.error || 'Failed to initialize owner role.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090B10] text-slate-100 flex items-center justify-center p-4 font-mono selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
      <SEO title="Access Denied | VIP Admin Control Center" noIndex={true} />

      {/* Cyberpunk Glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0 overflow-hidden" 
        aria-hidden="true"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Emblem */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#121823] border border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.2)] mb-3">
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 uppercase">
            Clearance Denied (403)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            DELTA INDUSTRIAL SYSTEMS // SECURITY PERIMETER
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121823] border border-[#273244] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/90 space-y-6">
          {/* Status Message */}
          <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-500/30 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Administrative Clearance Required</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Your account is successfully signed in, but does not possess the required administrative clearance tier to access the VIP Admin Control Center.
            </p>
          </div>

          {/* Account Profile Specifications */}
          <div className="space-y-3 p-4 rounded-xl bg-[#0D1118] border border-[#273244] text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#273244]/60">
              <span className="text-slate-400">Authenticated Identity</span>
              <span className="text-slate-200 font-bold truncate max-w-[220px]">
                {user?.email || 'Unknown Session'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#273244]/60">
              <span className="text-slate-400">Assigned Account Tier</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#18212D] text-slate-300 border border-[#273244] uppercase">
                {role === 'customer' ? 'Corporate Buyer / Contractor' : role}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#273244]/60">
              <span className="text-slate-400">Required Clearance Tier</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 uppercase">
                Owner / Executive Admin / Manager
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Access Policy</span>
              <span className="text-slate-400 font-mono text-[11px]">Zero-Trust Rule RBAC-v4</span>
            </div>
          </div>

          {/* Owner Bootstrap Callout if authenticated account matches 309amaanu@gmail.com */}
          {isDesignatedOwner && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#18212D] to-[#121823] border border-[#F5A623]/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5A623] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Root Owner Verification Detected</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Your authenticated email ({TARGET_OWNER_EMAIL}) matches the designated System Owner. Click below to immediately provision and claim full administrative root authority.
              </p>

              {claimError && (
                <div className="p-2 rounded bg-red-950/40 border border-red-500/40 text-[11px] text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{claimError}</span>
                </div>
              )}

              {claimSuccess && (
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Owner clearance confirmed. Initializing VIP workspace...</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleClaimOwner}
                disabled={isClaiming || claimSuccess}
                className="w-full py-2.5 px-4 rounded-lg bg-[#F5A623] hover:bg-[#F59E0B] text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing Owner Authorization...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Claim & Bootstrap Owner Authority</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#18212D] hover:bg-[#1E293B] border border-[#273244] hover:border-red-500/40 text-slate-200 hover:text-red-300 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 focus-visible:ring-1 focus-visible:ring-red-400 outline-none"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Switch Account</span>
            </button>

            <Link
              to="/"
              className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] hover:from-[#38BDF8] hover:to-[#22D3EE] text-[#090B10] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none text-center"
            >
              <CornerDownLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
