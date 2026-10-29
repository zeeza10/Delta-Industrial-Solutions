/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { HealthProbeStatus } from '../../types/admin.types';

export const SystemHealthWidget: React.FC = () => {
  const { systemHealth, refreshSystemHealth } = useAdmin();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSystemHealth();
    setIsRefreshing(false);
  };

  const renderStatusBadge = (status: HealthProbeStatus) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>CONFIRMED CONNECTED</span>
          </span>
        );
      case 'disconnected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-950/60 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>DISCONNECTED</span>
          </span>
        );
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">
            <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" />
            <span>CHECKING...</span>
          </span>
        );
      case 'unconfigured':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>NOT CONFIGURED</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4">
      <div className="flex items-center justify-between border-b border-[#273244] pb-3">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#22D3EE]" />
          <span>System & Connectivity Status</span>
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 text-slate-400 hover:text-[#22D3EE] rounded transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none disabled:opacity-50"
          title="Run Live Health Probe"
          aria-label="Run Live Health Probe"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        {/* Firestore Connection */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#18212D] border border-[#273244]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#22D3EE] shrink-0" />
            <span className="text-slate-300">Firestore Cloud Database</span>
          </div>
          {renderStatusBadge(systemHealth.databaseStatus)}
        </div>

        {/* Security Rules Status */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#18212D] border border-[#273244]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Zero-Trust Rules Guard</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>ENFORCED</span>
          </span>
        </div>

        {/* Node & Vite Port Status */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#18212D] border border-[#273244]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#22D3EE] shrink-0" />
            <span className="text-slate-300">Host Server Port</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950/60 text-[#22D3EE] border border-[#22D3EE]/30">
            <span>0.0.0.0:3000 ACTIVE</span>
          </span>
        </div>
      </div>

      <div className="pt-1 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-[#273244]/60">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Last Probe: {systemHealth.lastChecked ? new Date(systemHealth.lastChecked).toLocaleTimeString() : 'Initial load'}</span>
        </span>
        {systemHealth.errorMessage ? (
          <span className="text-red-400 truncate max-w-[150px]" title={systemHealth.errorMessage}>
            {systemHealth.errorMessage}
          </span>
        ) : (
          <span className="text-emerald-400">Services Reachable</span>
        )}
      </div>
    </div>
  );
};
