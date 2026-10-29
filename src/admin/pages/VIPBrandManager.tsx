/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tag, Plus, Search, Edit2, Trash2 } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">OEM PARTNERS</AdminBadge>
          </div>
          <h1 className="text-2xl font-bold text-white text-glow-cyan">Manufacturer Brands & OEM Distribution</h1>
          <p className="text-xs text-slate-400">Manage certified electrical manufacturer partners and branding assets.</p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((brand) => (
          <div key={brand.id} className="bg-[#0b0f19] border border-cyan-500/20 hover:border-cyan-400/40 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.6)] space-y-3 group transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#07090e] border border-slate-800 flex items-center justify-center p-1.5 overflow-hidden">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Tag className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{brand.name}</h4>
                  <span className="text-[10px] text-slate-500">{brand.slug}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{brand.description}</p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Tier 1 OEM</span>
              <div className="flex items-center gap-2">
                <button className="hover:text-cyan-400 p-1">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="hover:text-rose-400 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
