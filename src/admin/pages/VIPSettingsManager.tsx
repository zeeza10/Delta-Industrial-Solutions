/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Save, CheckCircle2 } from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';

export const VIPSettingsManager: React.FC = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">SECURITY & CONFIG</AdminBadge>
          </div>
          <h1 className="text-2xl font-bold text-white text-glow-cyan">Platform Settings & Control Gates</h1>
          <p className="text-xs text-slate-400">Configure corporate parameters, procurement workflow thresholds, and alerts.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General B2B Configuration */}
        <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.6)] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Procurement & Quotation Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Company Trading Name</label>
              <input
                type="text"
                defaultValue="Delta Industrial Solutions Private Limited"
                className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-slate-700 text-white focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Corporate Support Email</label>
              <input
                type="email"
                defaultValue="procurement@deltaindustrials.com"
                className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-slate-700 text-white focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Default Quote Validity (Days)</label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-slate-700 text-white focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Bulk Order Minimum Value (USD)</label>
              <input
                type="number"
                defaultValue={10000}
                className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-slate-700 text-white focus:border-cyan-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Security Gates */}
        <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.6)] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security & Zero-Trust Verification</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-lg bg-[#07090e] border border-slate-800 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 text-cyan-400" />
              <div className="space-y-0.5">
                <div className="text-white font-bold">Enforce Corporate Email Verification for Bulk Quotes</div>
                <div className="text-slate-400 text-[11px]">Require email confirmation before contractor pricing is unlocked.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-[#07090e] border border-slate-800 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 text-cyan-400" />
              <div className="space-y-0.5">
                <div className="text-white font-bold">Audit Log Write Tracking</div>
                <div className="text-slate-400 text-[11px]">Record every SKU modification and quotation update in immutable security log.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration successfully synchronized.</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
