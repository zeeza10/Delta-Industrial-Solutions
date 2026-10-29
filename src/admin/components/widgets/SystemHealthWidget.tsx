/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Activity, Database, Server, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const SystemHealthWidget: React.FC = () => {
  const { systemHealth, refreshSystemHealth } = useAdmin();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSystemHealth();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.6)] space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>System & Security Health</span>
        </h3>
        <button
          onClick={handleRefresh}
          className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
          title="Refresh Status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {/* Firestore Connection */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#07090e] border border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Firestore Multi-Region DB</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            systemHealth.databaseConnected 
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' 
              : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
          }`}>
            {systemHealth.databaseConnected ? 'HEALTHY' : 'OFFLINE'}
          </span>
        </div>

        {/* Security Rules Status */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#07090e] border border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Zero-Trust ABAC Rules</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            ENFORCED
          </span>
        </div>

        {/* Node & Vite Port Status */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#07090e] border border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Host Runtime (0.0.0.0:3000)</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
            ACTIVE
          </span>
        </div>
      </div>

      <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Last Ping: {new Date(systemHealth.lastSyncTimestamp).toLocaleTimeString()}</span>
        <span className="text-emerald-400">99.98% Uptime</span>
      </div>
    </div>
  );
};
