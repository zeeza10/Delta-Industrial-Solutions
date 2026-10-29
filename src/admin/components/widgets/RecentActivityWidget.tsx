/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Clock, FileSpreadsheet, User, Box, Tag, Layers, RefreshCw } from 'lucide-react';
import { AdminActivityLog } from '../../types/admin.types';

interface RecentActivityWidgetProps {
  logs: AdminActivityLog[];
  loading?: boolean;
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'create':
      return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
    case 'update':
    case 'status_change':
      return 'bg-cyan-950/60 text-[#22D3EE] border-[#22D3EE]/30';
    case 'delete':
      return 'bg-red-950/60 text-red-400 border-red-500/30';
    case 'role_assignment':
    case 'owner_bootstrap':
      return 'bg-purple-950/60 text-purple-300 border-purple-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};

const getResourceIcon = (resource: string) => {
  switch (resource) {
    case 'products':
      return <Box className="w-3.5 h-3.5 text-[#22D3EE]" />;
    case 'categories':
      return <Layers className="w-3.5 h-3.5 text-[#22D3EE]" />;
    case 'brands':
      return <Tag className="w-3.5 h-3.5 text-[#22D3EE]" />;
    case 'users':
      return <User className="w-3.5 h-3.5 text-purple-400" />;
    default:
      return <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />;
  }
};

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ logs, loading }) => {
  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4">
      <div className="flex items-center justify-between border-b border-[#273244] pb-3">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#22D3EE]" />
          <span>Recent Audit & Governance Feed</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-400 bg-[#18212D] px-2 py-0.5 rounded border border-[#273244]">
          ZERO-TRUST LOGS
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#18212D] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="p-4 rounded-lg bg-[#18212D] border border-[#273244] text-center text-xs font-mono text-slate-400">
          No recent administrative audit activity recorded yet.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto custom-scrollbar">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/30 transition-colors flex items-start justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-start gap-2.5 overflow-hidden">
                <div className="p-1.5 rounded bg-[#090B10] border border-[#273244] shrink-0 mt-0.5">
                  {getResourceIcon(log.targetResource)}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-200 truncate">{log.adminName || 'System Admin'}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate leading-tight" title={log.details}>
                    {log.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0 mt-0.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
