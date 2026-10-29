/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Executive Revenue Performance Widget
 * Executive revenue breakdown, average order value (AOV), date range filters, and interactive SVG timeline
 */

import React, { useState } from 'react';
import { DateFilterType, RevenueMetrics, DateRange } from '../../hooks/useExecutiveDashboard';
import { DollarSign, TrendingUp, ShoppingBag, Calendar, AlertCircle, ArrowUpRight } from 'lucide-react';

interface RevenuePerformanceWidgetProps {
  revenueMetrics: RevenueMetrics;
  dateFilter: DateFilterType;
  onDateFilterChange: (filter: DateFilterType) => void;
  customRange: DateRange;
  onCustomRangeChange: (range: DateRange) => void;
  loading?: boolean;
}

export const RevenuePerformanceWidget: React.FC<RevenuePerformanceWidgetProps> = ({
  revenueMetrics,
  dateFilter,
  onDateFilterChange,
  customRange,
  onCustomRangeChange,
  loading = false,
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; revenue: number; orderCount: number } | null>(null);

  const {
    grossRevenue,
    netRevenue,
    orderVolume,
    averageOrderValue,
    currency,
    hasMultipleCurrencies,
    timeSeries,
  } = revenueMetrics;

  const filters: { id: DateFilterType; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_year', label: 'This Year' },
    { id: 'custom', label: 'Custom' },
  ];

  // Prepare chart dimensions & scaling
  const maxRevenue = Math.max(...timeSeries.map(p => p.revenue), 1000);
  const svgWidth = 600;
  const svgHeight = 160;
  const padding = 20;

  const points = timeSeries.map((p, idx) => {
    const x = padding + (idx / Math.max(1, timeSeries.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - (p.revenue / maxRevenue) * (svgHeight - padding * 2);
    return { x, y, data: p };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`
    : '';

  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-5 font-mono">
      {/* Widget Header & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#22D3EE]" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Executive Revenue Performance
            </h2>
            {hasMultipleCurrencies && (
              <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1" title="Transactions in multiple currencies detected">
                <AlertCircle className="w-3 h-3" />
                <span>Multi-Currency ({currency})</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Settled gross & net transaction figures, date-range filtering, and order velocity timeline.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0D1118] p-1 rounded-lg border border-[#273244]">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => {
                if (f.id === 'custom') {
                  setShowCustomInputs(!showCustomInputs);
                } else {
                  setShowCustomInputs(false);
                }
                onDateFilterChange(f.id);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                dateFilter === f.id
                  ? 'bg-[#22D3EE] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#18212D]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs if active */}
      {showCustomInputs && dateFilter === 'custom' && (
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="text-slate-400">Start Date:</label>
            <input
              type="date"
              value={customRange.startDate.toISOString().split('T')[0]}
              onChange={e => onCustomRangeChange({ ...customRange, startDate: new Date(e.target.value) })}
              className="bg-[#0D1118] border border-[#273244] rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-400">End Date:</label>
            <input
              type="date"
              value={customRange.endDate.toISOString().split('T')[0]}
              onChange={e => onCustomRangeChange({ ...customRange, endDate: new Date(e.target.value) })}
              className="bg-[#0D1118] border border-[#273244] rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
        </div>
      )}

      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Gross Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400">
            ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">
            Valid non-cancelled orders
          </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Net Settled</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#22D3EE]" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#22D3EE]">
            ${netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">
            Paid & verified transactions
          </div>
        </div>

        {/* Order Volume */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Order Volume</span>
            <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-100">
            {orderVolume} <span className="text-xs text-slate-400 font-normal">Orders</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Total count in period
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Avg Order Value (AOV)</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-purple-300">
            ${averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">
            Gross revenue / order volume
          </div>
        </div>
      </div>

      {/* SVG Revenue Timeline Chart */}
      <div className="bg-[#0D1118] border border-[#273244] rounded-lg p-4 space-y-2 relative">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#273244]/60 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Revenue Velocity Timeline ({dateFilter.replace('_', ' ').toUpperCase()})</span>
          </span>
          {hoveredPoint ? (
            <span className="text-[#22D3EE] font-bold">
              {hoveredPoint.date}: ${hoveredPoint.revenue.toLocaleString()} ({hoveredPoint.orderCount} orders)
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Hover nodes to view daily metrics</span>
          )}
        </div>

        {timeSeries.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs text-slate-500">
            No order transactions recorded in selected date range.
          </div>
        ) : (
          <div className="w-full overflow-x-auto custom-scrollbar">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-40 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75].map((factor, i) => {
                const y = svgHeight - padding - factor * (svgHeight - padding * 2);
                return (
                  <line
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={svgWidth - padding}
                    y2={y}
                    stroke="#273244"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Under Curve */}
              {areaD && <path d={areaD} fill="url(#revenueGrad)" />}

              {/* Curve Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.date === p.data.date ? '6' : '4'}
                    fill="#121823"
                    stroke="#22D3EE"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:r-6"
                    onMouseEnter={() => setHoveredPoint(p.data)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-mono">
              {timeSeries.filter((_, idx) => idx % Math.max(1, Math.floor(timeSeries.length / 6)) === 0).map(pt => (
                <span key={pt.date}>{pt.date}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
