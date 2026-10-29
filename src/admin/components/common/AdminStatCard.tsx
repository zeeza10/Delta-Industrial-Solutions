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
  metric: AdminMetricSummary;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ metric }) => {
  const Icon = metric.iconName ? (iconMap[metric.iconName] || Package) : Package;

  return (
    <div className="bg-[#0b0f19] border border-cyan-500/20 hover:border-cyan-400/50 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(0,240,255,0.15)] transition-all duration-300 relative group overflow-hidden">
      {/* Decorative top neon line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent group-hover:via-cyan-400 transition-all" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{metric.title}</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">{metric.value}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        {metric.changePercent !== undefined && (
          <div className={`flex items-center gap-1 font-semibold ${metric.isPositiveChange ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metric.isPositiveChange ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{metric.changePercent > 0 ? `+${metric.changePercent}%` : `${metric.changePercent}%`}</span>
          </div>
        )}
        {metric.trendText && (
          <span className="text-slate-400 text-[11px] truncate max-w-[180px]">{metric.trendText}</span>
        )}
      </div>
    </div>
  );
};
