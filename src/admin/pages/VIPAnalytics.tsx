/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Clock, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';

export const VIPAnalytics: React.FC = () => {
  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">INTELLIGENCE MATRIX</AdminBadge>
          </div>
          <h1 className="text-2xl font-bold text-white text-glow-cyan">Analytics & Quotation Velocity</h1>
          <p className="text-xs text-slate-400">Quarterly B2B electrical demand patterns and conversion performance.</p>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>PIPELINE QUOTATION VALUE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">$1,480,250</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+24.6% vs previous quarter</span>
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>BID CONVERSION RATE</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">68.4%</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+5.2% win rate on bulk orders</span>
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>TOP DEMAND CATEGORY</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white">Power Cables (XLPE)</div>
          <div className="mt-3 text-xs text-slate-400">
            <span>42% of total quotation volume</span>
          </div>
        </div>
      </div>

      {/* Demand Breakdown Container */}
      <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.6)] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>Category Volume Distribution</span>
        </h3>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Cables & Wiring (XLPE, Armored, Control)</span>
              <span className="text-cyan-400 font-bold">42% (52 Enquiries)</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Switchgear & Circuit Breakers (MCCB, MCB, ACB)</span>
              <span className="text-cyan-400 font-bold">31% (38 Enquiries)</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '31%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Automation & Control (PLC, VFD, Relays)</span>
              <span className="text-cyan-400 font-bold">18% (22 Enquiries)</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '18%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Lighting & Enclosures</span>
              <span className="text-cyan-400 font-bold">9% (11 Enquiries)</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '9%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
