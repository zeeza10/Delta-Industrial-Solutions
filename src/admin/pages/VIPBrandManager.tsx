/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tag, Plus, Search, CheckCircle2 } from 'lucide-react';
import { BRANDS } from '../../data/brands';
import { AdminBadge } from '../components/common/AdminBadge';

export const VIPBrandManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = BRANDS.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">OEM PARTNERS</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              CERTIFIED GLOBAL LINES
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Manufacturer Brands & Distribution</h1>
          <p className="text-xs text-slate-400">Certified electrical manufacturer partnerships and equipment distribution lines.</p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors shadow-sm focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#090B10] border border-[#273244] text-xs max-w-md focus-within:border-[#22D3EE] transition-colors">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter brands by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
        />
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((brand) => (
          <div key={brand.id} className="bg-[#121823] border border-[#273244] hover:border-[#22D3EE]/40 rounded-xl p-5 shadow-lg shadow-black/30 space-y-3 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#18212D] border border-[#273244] flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Tag className="w-4 h-4 text-[#22D3EE]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{brand.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{brand.slug}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{brand.description}</p>
            </div>

            <div className="pt-2.5 border-t border-[#273244]/70 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Authorized Distributor</span>
              </div>
              <span className="text-[11px] text-[#22D3EE] font-mono">Tier-1 OEM</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
