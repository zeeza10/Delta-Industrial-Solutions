/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Shield, Save, CheckCircle2 } from 'lucide-react';
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
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">CONFIGURATION</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              POLICY ENGINE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Platform Parameters & Policy Controls</h1>
          <p className="text-xs text-slate-400">Configure corporate procurement thresholds, quotation validity windows, and security gates.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General B2B Configuration */}
        <div className="bg-[#121823] border border-[#273244] rounded-xl p-6 shadow-lg shadow-black/30 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-[#273244] pb-3">
            <Settings className="w-4 h-4 text-[#22D3EE]" />
            <span>Procurement & Quotation Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5">Company Legal Trading Entity</label>
              <input
                type="text"
                defaultValue="Delta Industrial Solutions Private Limited"
                className="w-full px-3.5 py-2 rounded-lg bg-[#090B10] border border-[#273244] text-slate-100 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">Corporate Procurement Dispatch Email</label>
              <input
                type="email"
                defaultValue="procurement@deltaindustrials.com"
                className="w-full px-3.5 py-2 rounded-lg bg-[#090B10] border border-[#273244] text-slate-100 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">Quotation Validity Period (Days)</label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3.5 py-2 rounded-lg bg-[#090B10] border border-[#273244] text-slate-100 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">Enterprise Bulk Order Minimum (USD)</label>
              <input
                type="number"
                defaultValue={10000}
                className="w-full px-3.5 py-2 rounded-lg bg-[#090B10] border border-[#273244] text-slate-100 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Security Gates */}
        <div className="bg-[#121823] border border-[#273244] rounded-xl p-6 shadow-lg shadow-black/30 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-[#273244] pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust Policy & Audit Enforcement</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3 rounded-lg bg-[#18212D] border border-[#273244] cursor-pointer hover:border-[#22D3EE]/30 transition-colors">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded border-[#273244] text-[#22D3EE] focus:ring-0" />
              <div className="space-y-0.5">
                <div className="text-slate-100 font-bold">Enforce Corporate Email Verification for Bulk RFQs</div>
                <div className="text-slate-400 text-[11px]">Require email confirmation before contractor discounted pricing is unlocked.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-[#18212D] border border-[#273244] cursor-pointer hover:border-[#22D3EE]/30 transition-colors">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded border-[#273244] text-[#22D3EE] focus:ring-0" />
              <div className="space-y-0.5">
                <div className="text-slate-100 font-bold">Immutable Audit Log Recording</div>
                <div className="text-slate-400 text-[11px]">Record every SKU modification and quotation update in the administrative audit collection.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration successfully saved.</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs tracking-wider uppercase transition-colors shadow-sm flex items-center gap-2 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
