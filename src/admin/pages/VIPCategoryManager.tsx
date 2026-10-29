/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Plus, Search, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { AdminBadge } from '../components/common/AdminBadge';

export const VIPCategoryManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleExpand = (catId: string) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const filtered = CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">TAXONOMY MATRIX</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              OFFICIAL SYSTEM TAXONOMY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Product Categories & Hierarchies</h1>
          <p className="text-xs text-slate-400">Structured industrial electrical taxonomies and multi-tier subcategory trees.</p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors shadow-sm focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none shrink-0">
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        <div className="p-4 border-b border-[#273244] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs w-full sm:max-w-md focus-within:border-[#22D3EE] transition-colors">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search taxonomies by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
            />
          </div>
          <span className="text-xs text-slate-400 hidden sm:block whitespace-nowrap">
            {filtered.length} Main Classifications
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-5 py-3.5">Slug ID</th>
                <th className="px-5 py-3.5">Taxonomy Depth</th>
                <th className="px-5 py-3.5">Registry Status</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
              {filtered.map((cat) => {
                const isExpanded = !!expandedCats[cat.id];
                const subCount = cat.subcategories?.length || 0;

                return (
                  <React.Fragment key={cat.id}>
                    <tr className="hover:bg-[#18212D]/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => toggleExpand(cat.id)}
                            className="p-1 hover:text-[#22D3EE] transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded"
                            aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#22D3EE]" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                          <Layers className="w-4 h-4 text-[#22D3EE] shrink-0" />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">{cat.slug}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-[#18212D] border border-[#273244] text-[#22D3EE] text-[10px] font-bold">
                          {subCount} subcategories
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button 
                          onClick={() => toggleExpand(cat.id)}
                          className="text-xs text-slate-400 hover:text-[#22D3EE] transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none p-1 rounded"
                        >
                          {isExpanded ? 'Collapse' : 'Explore Tree'}
                        </button>
                      </td>
                    </tr>

                    {/* Subcategories expansion */}
                    {isExpanded && cat.subcategories && (
                      <tr className="bg-[#090B10]/80 border-b border-[#273244]/80">
                        <td colSpan={5} className="px-8 py-3">
                          <div className="space-y-1.5 pl-6 border-l-2 border-[#22D3EE]/30">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                              Subcategories ({cat.subcategories.length})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {cat.subcategories.map(sub => (
                                <div key={sub.id} className="p-2 rounded bg-[#121823] border border-[#273244] flex items-center justify-between text-xs">
                                  <span className="text-slate-200">{sub.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{sub.slug}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
