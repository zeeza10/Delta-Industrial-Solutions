/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Search, ShieldCheck, Mail, Building, Phone, Filter, CheckCircle2 } from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';

const demoUsers = [
  { id: 'usr-001', name: 'Amaan Ur Rehman', email: '309amaanu@gmail.com', company: 'Delta Industrial Solutions', role: 'admin', verified: true, joined: '2026-10-01' },
  { id: 'usr-002', name: 'John Smith', email: 'john@globalinfra.com', company: 'Global Infra Ltd', role: 'customer', verified: true, joined: '2026-10-14' },
  { id: 'usr-003', name: 'Sarah Lee', email: 'sarah@indsys.com', company: 'Industrial Systems Corp', role: 'customer', verified: true, joined: '2026-10-18' },
  { id: 'usr-004', name: 'Mike Ross', email: 'mike@citypower.com', company: 'City Power Grid', role: 'customer', verified: false, joined: '2026-10-21' },
];

export const VIPUserManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = demoUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">DIRECTORY & RBAC</AdminBadge>
          </div>
          <h1 className="text-2xl font-bold text-white text-glow-cyan">Enterprise Accounts & Access Control</h1>
          <p className="text-xs text-slate-400">Manage B2B contractor profiles, corporate tax IDs, and administrative roles.</p>
        </div>
      </div>

      <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07090e] border border-cyan-500/20 text-xs w-full max-w-md">
            <Search className="w-4 h-4 text-cyan-400/70 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, corporate email or enterprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full"
            />
          </div>
          <div className="text-xs text-slate-400 hidden sm:block">
            {filtered.length} Enterprise Users
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#07090e] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Role Tier</th>
                <th className="px-5 py-3">Verification</th>
                <th className="px-5 py-3">Registration</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-cyan-950/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-white">{user.name}</div>
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
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                      Edit Permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
