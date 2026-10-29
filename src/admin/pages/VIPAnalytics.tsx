/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, ArrowUpRight, Info } from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';

export const VIPAnalytics: React.FC = () => {
  return (
    <div className="space-y-6 font-mono">
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">COMMERCIAL INTELLIGENCE</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              BENCHMARK SIMULATION MODEL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Analytics & Quotation Velocity
          </h1>
          <p className="text-xs text-slate-400">
            Quarterly B2B electrical demand patterns, bid conversion rates, and revenue pipeline metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <Info className="w-4 h-4 text-[#22D3EE]" />
          <span>Quarterly Rolling Window</span>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121823] border border-[#273244] hover:border-[#22D3EE]/40 rounded-xl p-5 shadow-lg shadow-black/30 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>PIPELINE QUOTATION VALUE</span>
            <div className="w-8 h-8 rounded-lg bg-[#18212D] border border-[#273244] flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">$1,480,250</div>
          <div className="mt-3 pt-2.5 border-t border-[#273244]/70 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+24.6% vs previous quarter</span>
          </div>
        </div>

        <div className="bg-[#121823] border border-[#273244] hover:border-[#22D3EE]/40 rounded-xl p-5 shadow-lg shadow-black/30 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>BID CONVERSION RATE</span>
            <div className="w-8 h-8 rounded-lg bg-[#18212D] border border-[#273244] flex items-center justify-center text-[#22D3EE]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">68.4%</div>
          <div className="mt-3 pt-2.5 border-t border-[#273244]/70 flex items-center gap-1.5 text-xs text-[#22D3EE] font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+5.2% win rate on bulk orders</span>
          </div>
        </div>

        <div className="bg-[#121823] border border-[#273244] hover:border-[#22D3EE]/40 rounded-xl p-5 shadow-lg shadow-black/30 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>TOP DEMAND CATEGORY</span>
            <div className="w-8 h-8 rounded-lg bg-[#18212D] border border-[#273244] flex items-center justify-center text-[#F5A623]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-100 font-mono tracking-tight">Power Cables (XLPE)</div>
          <div className="mt-3 pt-2.5 border-t border-[#273244]/70 text-xs text-slate-400">
            <span>42% of total quotation volume</span>
          </div>
        </div>
      </div>

      {/* Demand Breakdown Container */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 sm:p-6 shadow-lg shadow-black/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#273244] pb-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#22D3EE]" />
            <span>Category Volume Distribution Benchmark</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">123 Total RFQ Samples</span>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300">Cables & Wiring (XLPE, Armored, Control)</span>
              <span className="text-[#22D3EE] font-bold">42% (52 Enquiries)</span>
            </div>
            <div className="w-full h-2 bg-[#090B10] rounded-full overflow-hidden border border-[#273244]">
              <div className="h-full bg-[#22D3EE] rounded-full" style={{ width: '42%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300">Switchgear & Circuit Breakers (MCCB, MCB, ACB)</span>
              <span className="text-blue-400 font-bold">31% (38 Enquiries)</span>
            </div>
            <div className="w-full h-2 bg-[#090B10] rounded-full overflow-hidden border border-[#273244]">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '31%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300">Automation & Control (PLC, VFD, Relays)</span>
              <span className="text-purple-400 font-bold">18% (22 Enquiries)</span>
            </div>
            <div className="w-full h-2 bg-[#090B10] rounded-full overflow-hidden border border-[#273244]">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '18%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300">Industrial Lighting & Enclosures</span>
              <span className="text-emerald-400 font-bold">9% (11 Enquiries)</span>
            </div>
            <div className="w-full h-2 bg-[#090B10] rounded-full overflow-hidden border border-[#273244]">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '9%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
