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
import { MessageSquare, ArrowUpRight, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const recentEnquiriesDemo = [
  { id: 'ENQ-2026-001', type: 'High-Voltage Cable Run', customer: 'Global Infra Ltd', date: '2026-10-24', status: 'pending', value: '$45,200' },
  { id: 'ENQ-2026-002', type: 'Bulk Switchgear Batch', customer: 'Industrial Systems Corp', date: '2026-10-23', status: 'reviewing', value: '$88,400' },
  { id: 'ENQ-2026-003', type: 'Substation Automation PLC', customer: 'City Power Grid', date: '2026-10-23', status: 'quoted', value: '$120,000' },
  { id: 'ENQ-2026-004', type: 'Marine Grade Power Cable', customer: 'Offshore Electrics Ltd', date: '2026-10-22', status: 'pending', value: '$32,500' },
];

export const VIPDashboard: React.FC = () => {
  const { metrics, loading, error } = useAdminStats();

  return (
    <div className="space-y-6 font-mono">
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">EXECUTIVE MATRIX</AdminBadge>
            <span className="text-[10px] text-slate-500 font-mono">CONTROL CENTER v1.0</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Delta Industrial Command Center
          </h1>
          <p className="text-xs text-slate-400">
            High-velocity electrical procurement supervision, inventory control, and zero-trust audit architecture.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/admin/products"
            className="px-3.5 py-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 hover:bg-[#1E293B] text-slate-200 hover:text-white font-mono text-xs transition-colors flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
          >
            <span>Catalog Items</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <Link
            to="/admin/enquiries"
            className="px-3.5 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-mono font-bold text-xs tracking-wider uppercase transition-colors shadow-sm flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
          >
            <span>Review Quotes</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-950" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <AdminStatCard key={i} loading={true} />
            ))
          : error
          ? Array.from({ length: 4 }).map((_, i) => (
              <AdminStatCard key={i} error={error} />
            ))
          : metrics.map((metric) => (
              <AdminStatCard key={metric.id} metric={metric} />
            ))}
      </div>

      {/* Main Grid: Priority Enquiries Queue & Operational Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enquiries Queue (Left 2 columns) */}
        <div className="lg:col-span-2 bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#273244] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#22D3EE]" />
                <h2 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Priority Procurement Enquiries
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
                  DEMO SAMPLE QUEUE
                </span>
              </div>
              <Link 
                to="/admin/enquiries" 
                className="text-xs font-mono text-[#22D3EE] hover:underline flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
              >
                <span>View Full Queue</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                    <th className="px-4 py-3">Tracking ID</th>
                    <th className="px-4 py-3">Requirement</th>
                    <th className="px-4 py-3">Client Entity</th>
                    <th className="px-4 py-3">Est. Value</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
                  {recentEnquiriesDemo.map((enq) => (
                    <tr key={enq.id} className="hover:bg-[#18212D]/70 transition-colors group">
                      <td className="px-4 py-3 font-bold text-[#22D3EE]">{enq.id}</td>
                      <td className="px-4 py-3 text-slate-200">{enq.type}</td>
                      <td className="px-4 py-3 text-slate-400">{enq.customer}</td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">{enq.value}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          enq.status === 'pending'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                            : enq.status === 'reviewing'
                            ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/admin/enquiries"
                          className="text-xs text-slate-400 group-hover:text-[#22D3EE] transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded p-0.5"
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

          <div className="p-3 border-t border-[#273244]/60 bg-[#0D1118]/40 flex items-center justify-between text-[11px] text-slate-500">
            <span>Showing priority pipeline entries</span>
            <Link to="/admin/enquiries" className="text-slate-400 hover:text-slate-200 transition-colors">
              Manage complete database table →
            </Link>
          </div>
        </div>

        {/* Right Column: Operational & Health Widgets */}
        <div className="space-y-6">
          <QuickActionsWidget />
          <SystemHealthWidget />
        </div>
      </div>
    </div>
  );
};
