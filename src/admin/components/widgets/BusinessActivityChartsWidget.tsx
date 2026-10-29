/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Business Activity Charts Widget
 * Responsive charts for orders/revenue trends, enquiry statuses, quotation conversions, and catalog distribution
 */

import React from 'react';
import { StatusBreakdownItem, CategoryDistribution } from '../../hooks/useExecutiveDashboard';
import { BarChart3, MessageSquare, FileText, PieChart, Users, TrendingUp } from 'lucide-react';

interface BusinessActivityChartsWidgetProps {
  enquiryBreakdown: StatusBreakdownItem[];
  quotationBreakdown: StatusBreakdownItem[];
  categoryDist: CategoryDistribution[];
  loading?: boolean;
}

export const BusinessActivityChartsWidget: React.FC<BusinessActivityChartsWidgetProps> = ({
  enquiryBreakdown,
  quotationBreakdown,
  categoryDist,
  loading = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
      {/* 1. Enquiries Pipeline by Status */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#273244] pb-3">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#22D3EE]" />
            <span>RFQs / Enquiries Pipeline Status</span>
          </h3>
          <span className="text-[10px] text-slate-500">LIVE FEED</span>
        </div>

        <div className="space-y-3 pt-1">
          {enquiryBreakdown.map((item) => (
            <div key={item.status} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="text-slate-200 font-bold">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#0D1118] rounded-full overflow-hidden border border-[#273244]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(item.percentage, 4)}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Quotation Status & Conversion */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#273244] pb-3">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Formal Quotations Status Breakdown</span>
          </h3>
          <span className="text-[10px] text-slate-500">PROPOSAL PIPELINE</span>
        </div>

        <div className="space-y-3 pt-1">
          {quotationBreakdown.map((item) => (
            <div key={item.status} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="text-slate-200 font-bold">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#0D1118] rounded-full overflow-hidden border border-[#273244]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(item.percentage, 4)}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Catalog Taxonomy & Product Density */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#273244] pb-3">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            <span>Catalog Taxonomy Distribution</span>
          </h3>
          <span className="text-[10px] text-slate-500">CATALOG SKUs</span>
        </div>

        <div className="space-y-3 pt-1">
          {categoryDist.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="text-[#22D3EE] font-bold">
                  {cat.count} SKUs ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#0D1118] rounded-full overflow-hidden border border-[#273244]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(cat.percentage, 4)}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. B2B Account Activity Summary */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#273244] pb-3">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Account Demographics</span>
          </h3>
          <span className="text-[10px] text-slate-500">B2B ENTITIES</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Contractors & EPCs</div>
            <div className="text-lg font-bold text-slate-100">45%</div>
            <div className="text-[10px] text-slate-500">High volume cabling & switchgear</div>
          </div>
          <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">OEMs & System Integrators</div>
            <div className="text-lg font-bold text-slate-100">30%</div>
            <div className="text-[10px] text-slate-500">Automation PLCs & Drives</div>
          </div>
          <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Distributors & Resellers</div>
            <div className="text-lg font-bold text-slate-100">15%</div>
            <div className="text-[10px] text-slate-500">Bulk stock replenishment</div>
          </div>
          <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Utilities & Government</div>
            <div className="text-lg font-bold text-slate-100">10%</div>
            <div className="text-[10px] text-slate-500">Power grid infrastructure</div>
          </div>
        </div>
      </div>
    </div>
  );
};
