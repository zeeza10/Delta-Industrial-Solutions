/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Shield, 
  Eye, 
  X, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';
import { useAuth, TARGET_OWNER_EMAIL } from '../../context/AuthContext';
import { useAdminPermissions } from '../hooks/useAdminPermissions';
import { adminService } from '../services/adminService';
import { UserRole } from '../../types';

interface DisplayUser {
  id: string;
  uid?: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  verified: boolean;
  joined: string;
  taxId?: string;
  phone?: string;
  isLive?: boolean;
}

const baselineUsers: DisplayUser[] = [
  { 
    id: 'usr-owner', 
    name: 'Amaan Ur Rehman', 
    email: TARGET_OWNER_EMAIL, 
    company: 'Delta Industrial Solutions', 
    role: 'owner', 
    verified: true, 
    joined: '2026-10-01', 
    taxId: 'PK-992384-B', 
    phone: '+92 300 1234567' 
  },
  { 
    id: 'usr-002', 
    name: 'John Smith', 
    email: 'john@globalinfra.com', 
    company: 'Global Infra Ltd', 
    role: 'admin', 
    verified: true, 
    joined: '2026-10-14', 
    taxId: 'US-884192-A', 
    phone: '+1 555 382 9102' 
  },
  { 
    id: 'usr-003', 
    name: 'Sarah Lee', 
    email: 'sarah@indsys.com', 
    company: 'Industrial Systems Corp', 
    role: 'manager', 
    verified: true, 
    joined: '2026-10-18', 
    taxId: 'UK-441290-C', 
    phone: '+44 20 7946 0912' 
  },
  { 
    id: 'usr-004', 
    name: 'Mike Ross', 
    email: 'mike@citypower.com', 
    company: 'City Power Grid', 
    role: 'customer', 
    verified: false, 
    joined: '2026-10-21', 
    taxId: 'AE-992011-D', 
    phone: '+971 4 293 8472' 
  },
];

export const VIPUserManager: React.FC = () => {
  const { user: currentActor, isOwner } = useAuth();
  const { capabilities } = useAdminPermissions();

  const [users, setUsers] = useState<DisplayUser[]>(baselineUsers);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'admin' | 'manager' | 'customer'>('all');
  const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null);

  // Role modification state
  const [targetRole, setTargetRole] = useState<UserRole>('customer');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [roleUpdateFeedback, setRoleUpdateFeedback] = useState<{ success?: boolean; message: string } | null>(null);

  // Fetch live accounts from Firestore
  useEffect(() => {
    let isMounted = true;
    const loadAccounts = async () => {
      setLoadingUsers(true);
      try {
        const live = await adminService.getUsers();
        if (isMounted && live && live.length > 0) {
          // Merge live accounts with baseline to guarantee root owner is present
          const mappedLive: DisplayUser[] = live.map(u => ({
            id: u.uid || u.id,
            uid: u.uid || u.id,
            name: u.displayName || u.email?.split('@')[0] || 'User',
            email: u.email || '',
            company: u.company || 'Enterprise Entity',
            role: (u.email?.toLowerCase().trim() === TARGET_OWNER_EMAIL ? 'owner' : (u.role || 'customer')) as UserRole,
            verified: true,
            joined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-10-29',
            taxId: u.taxId,
            phone: u.phone,
            isLive: true,
          }));

          // Avoid duplicates by email
          const existingEmails = new Set(mappedLive.map(u => u.email.toLowerCase()));
          const combined = [
            ...mappedLive,
            ...baselineUsers.filter(b => !existingEmails.has(b.email.toLowerCase()))
          ];
          setUsers(combined);
        }
      } catch (err) {
        console.warn('Fallback to baseline user directory:', err);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };

    loadAccounts();
    return () => { isMounted = false; };
  }, []);

  const handleOpenDetails = (u: DisplayUser) => {
    setSelectedUser(u);
    setTargetRole(u.role);
    setRoleUpdateFeedback(null);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !currentActor) return;
    setRoleUpdateFeedback(null);

    // Prevent demoting the root owner
    if (selectedUser.email.toLowerCase().trim() === TARGET_OWNER_EMAIL && targetRole !== 'owner') {
      setRoleUpdateFeedback({
        success: false,
        message: 'Root System Owner cannot be demoted or revoked.',
      });
      return;
    }

    setIsUpdatingRole(true);
    const res = await adminService.updateUserRole(
      selectedUser.uid || selectedUser.id,
      selectedUser.email,
      targetRole,
      {
        uid: currentActor.uid,
        email: currentActor.email || 'admin@deltaindustrials.com',
        name: currentActor.displayName || 'System Administrator',
      }
    );
    setIsUpdatingRole(false);

    if (res.success) {
      setRoleUpdateFeedback({
        success: true,
        message: `Clearance successfully updated to ${targetRole.toUpperCase()}.`,
      });
      // Update local state
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: targetRole } : u));
      setSelectedUser(prev => prev ? { ...prev, role: targetRole } : null);
    } else {
      setRoleUpdateFeedback({
        success: false,
        message: res.error || 'Failed to update clearance role.',
      });
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">DIRECTORY & RBAC</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30">
              ZERO-TRUST RBAC ACTIVE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Enterprise Accounts & Role Access
          </h1>
          <p className="text-xs text-slate-400">
            Control enterprise contractors, clearance roles (Owner, Admin, Manager, Customer), and corporate credentials.
          </p>
        </div>

        {/* Current user privilege reminder */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121823] border border-[#273244] text-xs">
          <ShieldCheck className="w-4 h-4 text-[#22D3EE]" />
          <span className="text-slate-300">Your Authority:</span>
          <span className={`font-bold uppercase text-[11px] ${isOwner ? 'text-[#F5A623]' : 'text-[#22D3EE]'}`}>
            {isOwner ? 'System Owner (Root)' : capabilities.canAssignRoles ? 'Executive Admin' : 'Read-Only'}
          </span>
        </div>
      </div>

      <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-[#273244] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs w-full md:max-w-md focus-within:border-[#22D3EE] transition-colors">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, corporate email or enterprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
            {(['all', 'owner', 'admin', 'manager', 'customer'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRoleFilter(tab)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors shrink-0 outline-none ${
                  roleFilter === tab 
                    ? 'bg-[#18212D] text-[#22D3EE] border border-[#273244] font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? `All (${users.length})` : `${tab}s`}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-5 py-3.5">Enterprise Entity</th>
                <th className="px-5 py-3.5">Clearance Tier</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5">Provisioned</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
              {filtered.map((u) => {
                const isTargetOwner = u.email.toLowerCase().trim() === TARGET_OWNER_EMAIL;

                return (
                  <tr key={u.id} className="hover:bg-[#18212D]/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{u.name}</span>
                        {isTargetOwner && (
                          <span title="Root Owner Authority">
                            <Crown className="w-3.5 h-3.5 text-[#F5A623]" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{u.email}</span>
                        {u.isLive && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
                            LIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{u.company}</td>
                    <td className="px-5 py-3.5">
                      {u.role === 'owner' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 uppercase">
                          <Crown className="w-3 h-3" />
                          System Owner
                        </span>
                      ) : u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30 uppercase">
                          <Shield className="w-3 h-3" />
                          Executive Admin
                        </span>
                      ) : u.role === 'manager' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase">
                          Operations Manager
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          Corporate Buyer
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.verified ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{u.joined}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetails(u)}
                        className="px-2.5 py-1 rounded bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-slate-300 hover:text-[#22D3EE] text-xs transition-colors inline-flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & RBAC</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Specifications & RBAC Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#22D3EE]" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Account Clearance Specifications
                </h3>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded p-1"
                aria-label="Close user details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Identity / Name</span>
                <span className="text-slate-200 font-bold">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Corporate Email</span>
                <span className="text-slate-200 font-mono">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Enterprise Entity</span>
                <span className="text-slate-200">{selectedUser.company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Tax ID / VAT</span>
                <span className="text-slate-200 font-mono">{selectedUser.taxId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Contact Telephone</span>
                <span className="text-slate-200 font-mono">{selectedUser.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Current Role Tier</span>
                <span className="font-bold text-[#22D3EE] uppercase text-[11px]">
                  {selectedUser.role}
                </span>
              </div>
            </div>

            {/* RBAC Role Assignment Section (Owner Privilege) */}
            <div className="p-4 rounded-xl bg-[#0D1118] border border-[#273244] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#22D3EE]" />
                  Modify Clearance Role
                </span>
                {!capabilities.canAssignRoles && (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Owner Only
                  </span>
                )}
              </div>

              {selectedUser.email.toLowerCase().trim() === TARGET_OWNER_EMAIL ? (
                <div className="p-3 rounded-lg bg-[#18212D] border border-[#F5A623]/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#F5A623] font-bold">
                    <Crown className="w-4 h-4" />
                    <span>Protected Root Owner</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    This account is the immutable Root Authority for Delta Industrial Solutions. Its owner tier cannot be modified.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(['customer', 'manager', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        disabled={!capabilities.canAssignRoles || isUpdatingRole}
                        onClick={() => setTargetRole(r)}
                        className={`p-2 rounded-lg text-xs font-mono uppercase text-center transition-all border outline-none ${
                          targetRole === r
                            ? 'bg-[#18212D] text-[#22D3EE] border-[#22D3EE] font-bold shadow-sm'
                            : 'bg-[#121823] text-slate-400 border-[#273244] hover:text-white disabled:opacity-50'
                        }`}
                      >
                        {r === 'customer' ? 'Buyer' : r}
                      </button>
                    ))}
                  </div>

                  {roleUpdateFeedback && (
                    <div className={`p-2 rounded text-[11px] flex items-center gap-2 ${
                      roleUpdateFeedback.success 
                        ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' 
                        : 'bg-red-950/40 border border-red-500/40 text-red-300'
                    }`}>
                      {roleUpdateFeedback.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{roleUpdateFeedback.message}</span>
                    </div>
                  )}

                  {capabilities.canAssignRoles && (
                    <button
                      type="button"
                      disabled={isUpdatingRole || targetRole === selectedUser.role}
                      onClick={handleSaveRole}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] hover:from-[#38BDF8] hover:to-[#22D3EE] text-[#090B10] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isUpdatingRole ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating RBAC Role in Firestore...</span>
                        </>
                      ) : (
                        <span>Apply Clearance Change</span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-lg bg-[#18212D] border border-[#273244] hover:bg-[#1E293B] text-slate-200 text-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
