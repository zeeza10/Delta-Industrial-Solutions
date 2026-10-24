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
    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-border shadow-2xl mt-1 rounded-b-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left: Suggestions */}
        <div className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Suggestions for "{query}"</h4>
            <Link 
              to={`/search?q=${query}`} 
              onClick={onClose}
              className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
            >
              View All Results <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {suggestions.map((item, idx) => (
              <Link 
                key={idx}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{item.label}</div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider">SKU: {item.sku}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Popular / Recent */}
        <div className="bg-slate-50 p-6">
          <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4">Popular Searches</h4>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <Link
                key={search}
                to={`/search?q=${search}`}
                onClick={onClose}
                className="px-3 py-1.5 bg-white border border-border rounded text-xs font-medium text-text-primary hover:border-primary hover:text-primary transition-all flex items-center gap-2"
              >
                <History className="w-3 h-3 opacity-50" />
                {search}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
