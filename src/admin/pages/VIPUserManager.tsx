/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Search, CheckCircle2, Shield, Eye, X } from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'admin' | 'customer';
  verified: boolean;
  joined: string;
  taxId?: string;
  phone?: string;
}

const demoUsers: DemoUser[] = [
  { id: 'usr-001', name: 'Amaan Ur Rehman', email: '309amaanu@gmail.com', company: 'Delta Industrial Solutions', role: 'admin', verified: true, joined: '2026-10-01', taxId: 'PK-992384-B', phone: '+92 300 1234567' },
  { id: 'usr-002', name: 'John Smith', email: 'john@globalinfra.com', company: 'Global Infra Ltd', role: 'customer', verified: true, joined: '2026-10-14', taxId: 'US-884192-A', phone: '+1 555 382 9102' },
  { id: 'usr-003', name: 'Sarah Lee', email: 'sarah@indsys.com', company: 'Industrial Systems Corp', role: 'customer', verified: true, joined: '2026-10-18', taxId: 'UK-441290-C', phone: '+44 20 7946 0912' },
  { id: 'usr-004', name: 'Mike Ross', email: 'mike@citypower.com', company: 'City Power Grid', role: 'customer', verified: false, joined: '2026-10-21', taxId: 'AE-992011-D', phone: '+971 4 293 8472' },
];

export const VIPUserManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);

  const filtered = demoUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">DIRECTORY & RBAC</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              SAMPLE ENTERPRISE ACCOUNTS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Enterprise Accounts & Roles</h1>
          <p className="text-xs text-slate-400">Manage B2B contractor profiles, corporate tax IDs, and access levels.</p>
        </div>
      </div>

      <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-[#273244] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs w-full sm:max-w-md focus-within:border-[#22D3EE] transition-colors">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, corporate email or enterprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none ${roleFilter === 'all' ? 'bg-[#18212D] text-[#22D3EE] border border-[#273244]' : 'text-slate-400 hover:text-white'}`}
            >
              All ({demoUsers.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none ${roleFilter === 'admin' ? 'bg-[#18212D] text-[#22D3EE] border border-[#273244]' : 'text-slate-400 hover:text-white'}`}
            >
              Admins (1)
            </button>
            <button
              onClick={() => setRoleFilter('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none ${roleFilter === 'customer' ? 'bg-[#18212D] text-[#22D3EE] border border-[#273244]' : 'text-slate-400 hover:text-white'}`}
            >
              Contractors (3)
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Enterprise Entity</th>
                <th className="px-5 py-3.5">Role Tier</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#18212D]/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-100">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">{user.company}</td>
                  <td className="px-5 py-3.5">
                    <AdminBadge variant={user.role === 'admin' ? 'vip' : 'default'}>
                      {user.role === 'admin' ? 'Super Admin' : 'Corporate Buyer'}
                    </AdminBadge>
                  </td>
                  <td className="px-5 py-3.5">
                    {user.verified ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-amber-400 text-xs">Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{user.joined}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-2.5 py-1 rounded bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-slate-300 hover:text-[#22D3EE] text-xs transition-colors inline-flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#22D3EE]" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Account Specifications</h3>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded p-1"
                aria-label="Close user details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Full Name</span>
                <span className="text-slate-200 font-bold">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Corporate Email</span>
                <span className="text-slate-200">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Enterprise</span>
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
                <span className="text-slate-400">Access Level</span>
                <AdminBadge variant={selectedUser.role === 'admin' ? 'vip' : 'default'}>
                  {selectedUser.role === 'admin' ? 'Super Admin' : 'Corporate Buyer'}
                </AdminBadge>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
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
