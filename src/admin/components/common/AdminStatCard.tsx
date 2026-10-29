/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Package, 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck,
  AlertCircle,
  LucideIcon 
} from 'lucide-react';
import { AdminMetricSummary } from '../../types/admin.types';

const iconMap: Record<string, LucideIcon> = {
  Package,
  MessageSquare,
  Users,
  Clock,
  ShieldCheck,
};

interface AdminStatCardProps {
  metric?: AdminMetricSummary;
  loading?: boolean;
  error?: string | null;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ 
  metric, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return (
      <div 
        className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 min-h-[130px] flex flex-col justify-between animate-pulse"
        role="status"
        aria-label="Loading KPI metric"
      >
        <div className="space-y-2">
          <div className="h-3 w-28 bg-[#18212D] rounded"></div>
          <div className="h-8 w-20 bg-[#18212D] rounded"></div>
        </div>
        <div className="h-3 w-36 bg-[#18212D] rounded mt-3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-[#121823] border border-red-500/30 rounded-xl p-5 shadow-lg shadow-black/30 min-h-[130px] flex flex-col justify-center gap-2"
        role="alert"
      >
        <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Metric Unavailable</span>
        </div>
        <p className="text-[11px] font-mono text-slate-400 truncate">{error}</p>
      </div>
    );
  }

  if (!metric) {
    return (
      <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 min-h-[130px] flex items-center justify-center text-slate-500 font-mono text-xs">
        No metric data
      </div>
    );
  }

  const IconComponent = metric.iconName ? (iconMap[metric.iconName] || Package) : Package;
  const hasTrend = metric.changePercent !== undefined && metric.changePercent !== null;

  return (
    <div className="bg-[#121823] border border-[#273244] hover:border-[#22D3EE]/40 rounded-xl p-5 shadow-lg shadow-black/30 transition-all duration-200 relative group overflow-hidden flex flex-col justify-between min-h-[130px]">
      {/* Subtle top industrial accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#22D3EE]/20 to-transparent group-hover:via-[#22D3EE]/60 transition-all" />

      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider truncate">
            {metric.title}
          </p>
          <div className="w-9 h-9 rounded-lg bg-[#18212D] border border-[#273244] flex items-center justify-center text-[#22D3EE] shadow-sm shrink-0">
            <IconComponent className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-1">
          <p className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-mono tracking-tight truncate">
            {metric.value}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#273244]/70 flex items-center justify-between text-xs font-mono">
        {hasTrend ? (
          <div className={`flex items-center gap-1 font-semibold text-[11px] ${metric.isPositiveChange ? 'text-emerald-400' : 'text-red-400'}`}>
            {metric.isPositiveChange ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{metric.changePercent! > 0 ? `+${metric.changePercent}%` : `${metric.changePercent}%`}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono">
            {metric.description || 'Current operational total'}
          </span>
        )}

        {metric.trendText && (
          <span className="text-slate-400 text-[10px] font-mono truncate max-w-[170px]" title={metric.trendText}>
            {metric.trendText}
          </span>
        )}
      </div>
    </div>
  );
};
