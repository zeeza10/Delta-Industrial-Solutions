/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAdminStats } from '../hooks/useAdminStats';
import { AdminStatCard } from '../components/common/AdminStatCard';
import { QuickActionsWidget } from '../components/widgets/QuickActionsWidget';
import { SystemHealthWidget } from '../components/widgets/SystemHealthWidget';
import { AdminBadge } from '../components/common/AdminBadge';
import { MessageSquare, ArrowUpRight, Crown, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const recentEnquiriesDemo = [
  { id: 'ENQ-2026-001', type: 'High-Voltage Cable Run', customer: 'Global Infra Ltd', company: 'Global Infra', date: '2026-10-24', status: 'pending', value: '$45,200 est.' },
  { id: 'ENQ-2026-002', type: 'Bulk Switchgear Batch', customer: 'Industrial Systems Corp', company: 'Industrial Systems', date: '2026-10-23', status: 'reviewing', value: '$88,400 est.' },
  { id: 'ENQ-2026-003', type: 'Substation Automation PLC', customer: 'City Power Grid', company: 'City Power', date: '2026-10-23', status: 'quoted', value: '$120,000 est.' },
  { id: 'ENQ-2026-004', type: 'Marine Grade Power Cable', customer: 'Offshore Electrics Ltd', company: 'Offshore Electrics', date: '2026-10-22', status: 'pending', value: '$32,500 est.' },
];

export const VIPDashboard: React.FC = () => {
  const { metrics, loading } = useAdminStats();

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0b0f19] via-[#0d1527] to-[#0b0f19] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.1)] relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <AdminBadge variant="vip">VIP CONTROL CENTER</AdminBadge>
            <span className="text-[11px] font-mono text-cyan-400">PHASE 1 ACTIVATED</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight text-glow-cyan">
            Enterprise Command Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            High-velocity procurement supervision, live inventory, and zero-trust audit architecture.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-mono font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-1.5"
          >
            <span>Manage Catalog</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Decorative Grid Backdrop */}
        <div className="absolute inset-0 bg-industrial-grid opacity-20 pointer-events-none" />
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-[#0b0f19] border border-cyan-500/10 rounded-xl animate-pulse" />
            ))
          : metrics.map((metric) => (
              <AdminStatCard key={metric.id} metric={metric} />
            ))}
      </div>

      {/* Main Grid: Live Queue & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Enquiries Queue (Left 2 columns) */}
        <div className="lg:col-span-2 bg-[#0b0f19] border border-cyan-500/20 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Priority Procurement Enquiries
              </h2>
            </div>
            <Link 
              to="/admin/enquiries" 
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Inspect All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="bg-[#07090e] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="px-5 py-3">Tracking ID</th>
                  <th className="px-5 py-3">Project / Type</th>
                  <th className="px-5 py-3">Client Entity</th>
                  <th className="px-5 py-3">Est. Value</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {recentEnquiriesDemo.map((enq) => (
                  <tr key={enq.id} className="hover:bg-cyan-950/20 transition-colors group">
                    <td className="px-5 py-3.5 font-bold text-cyan-400">{enq.id}</td>
                    <td className="px-5 py-3.5 text-slate-200">{enq.type}</td>
                    <td className="px-5 py-3.5 text-slate-400">{enq.customer}</td>
                    <td className="px-5 py-3.5 text-emerald-400 font-bold">{enq.value}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        enq.status === 'pending'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          : enq.status === 'reviewing'
                          ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to="/admin/enquiries"
                        className="text-xs text-slate-400 group-hover:text-cyan-400 transition-colors"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          <QuickActionsWidget />
          <SystemHealthWidget />
        </div>
      </div>
    </div>
  );
};
