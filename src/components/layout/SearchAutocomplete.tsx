/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, ArrowRight, History, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { searchProducts } from '../../utils/search';

interface SearchAutocompleteProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ query, isOpen, onClose }) => {
  if (!isOpen || query.length < 2) return null;

  // Real search for autocomplete
  const searchResults = searchProducts(PRODUCTS, query).slice(0, 5);
  
  const suggestions = searchResults.map(p => ({
    type: 'product',
    label: p.name,
    path: `/products/${p.id}`,
    sku: p.sku
  }));

  const popularSearches = ['MCB 630A', 'XLPE Cable', 'Contactor 3 Pole', 'LED Floodlight'];

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-[#0b0f19] border border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.95)] mt-2 rounded-xl overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-250 font-mono">
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-cyan-500/20">
        
        {/* Left: Suggestions */}
        <div className="lg:col-span-3 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan">Suggestions for "{query}"</h4>
            <Link 
              to={`/search?q=${query}`} 
              onClick={onClose}
              className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 hover:underline"
            >
              View All Results <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-2">
            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => (
                <Link 
                  key={idx}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded bg-[#07090e] border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{item.label}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">SKU: {item.sku}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                No matching parts or SKUs found for "{query}".
              </div>
            )}
          </div>
        </div>

        {/* Right: Popular / Recent */}
        <div className="bg-[#07090e]/60 p-5 sm:p-6">
          <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Popular Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <Link
                key={search}
                to={`/search?q=${search}`}
                onClick={onClose}
                className="px-3 py-1.5 bg-[#0b0f19] border border-cyan-500/30 rounded-lg text-xs font-medium text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.05)]"
              >
                <History className="w-3 h-3 text-cyan-400/60" />
                {search}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
