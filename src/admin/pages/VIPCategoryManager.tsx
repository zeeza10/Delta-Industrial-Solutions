/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Plus, Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { AdminBadge } from '../components/common/AdminBadge';

export const VIPCategoryManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">TAXONOMY MATRIX</AdminBadge>
          </div>
          <h1 className="text-2xl font-bold text-white text-glow-cyan">Product Categories & Hierarchies</h1>
          <p className="text-xs text-slate-400">Structured electrical taxonomies and subcategory trees.</p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07090e] border border-cyan-500/20 text-xs w-full max-w-md">
            <Search className="w-4 h-4 text-cyan-400/70 shrink-0" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full"
            />
          </div>
          <span className="text-xs text-slate-400">{filtered.length} Main Taxonomies</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#07090e] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="px-5 py-3">Category Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Subcategories</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-cyan-950/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{cat.slug}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px]">
                      {cat.subcategories?.length || 0} subcategories
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-emerald-400">Active</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button className="hover:text-cyan-400 p-1">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="hover:text-rose-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
