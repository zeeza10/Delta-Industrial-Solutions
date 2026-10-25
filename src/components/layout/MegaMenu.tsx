import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  ToggleLeft, 
  Cable, 
  Box, 
  Cpu, 
  Lightbulb, 
  Radio, 
  X,
  Building2
} from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping for primary categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'circuit-protection': <ShieldCheck className="w-4 h-4 text-teal" />,
  'switches-sockets': <ToggleLeft className="w-4 h-4 text-teal" />,
  'cables-wires': <Cable className="w-4 h-4 text-teal" />,
  'conduits-management': <Box className="w-4 h-4 text-teal" />,
  'industrial-automation': <Cpu className="w-4 h-4 text-teal" />,
  'panels-distribution': <Zap className="w-4 h-4 text-teal" />,
  'lighting': <Lightbulb className="w-4 h-4 text-teal" />,
  'earthing-lightning': <Radio className="w-4 h-4 text-teal" />,
};

// Descriptions for each category
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'circuit-protection': 'Certified MCBs, MCCBs, RCDs, and high-breaking capacity isolators for industrial distribution boards.',
  'switches-sockets': 'Heavy-duty industrial switches, weatherproof isolators, and commercial power accessories.',
  'cables-wires': 'Armoured power cables, multi-core control cables, and fire-resistant industrial cabling solutions.',
  'conduits-management': 'Heavy gauge galvanised conduits, PVC cable trays, trunking systems, and support fittings.',
  'industrial-automation': 'PLCs, variable frequency drives (VFD), HMIs, contactors, and precision industrial sensors.',
  'panels-distribution': 'Modular distribution boards, floor-standing panel enclosures, and busbar accessories.',
  'lighting': 'High-bay industrial LED fixtures, hazardous-area luminaires, and emergency lighting units.',
  'earthing-lightning': 'Earth rods, copper tape, surge arresters, and complete structural lightning protection systems.',
};

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATEGORIES[0]?.id || 'circuit-protection');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('button[aria-haspopup="true"]')) {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeCategory = CATEGORIES.find(c => c.id === activeCategoryId) || CATEGORIES[0];
  const subcategories = activeCategory?.subcategories || [];

  return (
    <>
      {/* Full-width Mega Menu Container */}
      <div 
        ref={menuRef}
        role="dialog"
        aria-label="All Categories Navigation"
        className="absolute top-full left-0 right-0 w-full z-50 bg-[#0b0f19]/95 border-b border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-xl max-h-[calc(100vh-110px)] overflow-y-auto custom-scrollbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Main Master-Detail Tab Layout */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 min-h-[420px]">
            
            {/* Left Column: Category Tabs List */}
            <div 
              role="tablist" 
              aria-label="Product Categories"
              className="w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-cyan-500/20 pb-6 md:pb-0 md:pr-8 space-y-1"
            >
              <div className="px-3 py-1.5 mb-3 text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] flex items-center justify-between font-mono">
                <span>Select Department</span>
                <span className="text-white font-bold">{CATEGORIES.length}</span>
              </div>

              {CATEGORIES.map((category) => {
                const isActive = category.id === activeCategoryId;
                const icon = CATEGORY_ICONS[category.id] || <Box className="w-4 h-4 text-cyan-400" />;
                const count = category.subcategories?.length || 0;

                return (
                  <button
                    key={category.id}
                    role="tab"
                    id={`tab-${category.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${category.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onMouseEnter={() => setActiveCategoryId(category.id)}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-left text-xs sm:text-sm font-semibold transition-all group ${
                      isActive 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                        : 'text-slate-400 hover:bg-[#07090e] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 p-1 rounded ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {icon}
                      </span>
                      <span className="truncate">{category.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[#07090e] text-slate-500'
                      }`}>
                        {count}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
                      }`} />
                    </div>
                  </button>
                );
              })}

              <div className="pt-4 mt-2 border-t border-cyan-500/20">
                <Link
                  to="/categories"
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors uppercase tracking-wider"
                >
                  <span>Browse Full Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Active Category Child Tab Panel */}
            <div 
              role="tabpanel"
              id={`panel-${activeCategory.id}`}
              aria-labelledby={`tab-${activeCategory.id}`}
              className="flex-1 flex flex-col min-w-0 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono text-glow-cyan">Department Overview</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] text-slate-400 font-mono">{subcategories.length} Technical Ranges</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeCategory.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                    {CATEGORY_DESCRIPTIONS[activeCategory.id] || 'High quality components with full manufacturer documentation and compliant specifications.'}
                  </p>
                </div>

                <Link
                  to={`/categories/${activeCategory.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0 self-start sm:self-auto"
                >
                  View All Products <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Subcategories Child Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subcategories.map((sub: any) => (
                    <Link
                      key={sub.id}
                      to={`/categories/${sub.slug}`}
                      onClick={onClose}
                      className="group p-3.5 rounded-xl border border-cyan-500/20 bg-[#07090e] hover:bg-[#0b0f19] hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all flex items-start justify-between gap-3 industrial-card-3d"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {sub.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 group-hover:text-slate-300 transition-colors flex items-center gap-1 font-mono">
                          <span>Explore components</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-cyan-500/50 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </Link>
                  ))}
                </div>

                {/* Direct B2B Shortcuts */}
                <div className="mt-8 pt-6 border-t border-cyan-500/20 bg-[#0b0f19]/40 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>PROCUREMENT SHORTCUTS:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link 
                        to={`/products?sort=newest`} 
                        onClick={onClose}
                        className="px-3 py-1.5 bg-[#07090e] border border-cyan-500/30 rounded text-[11px] font-semibold text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-all font-mono"
                      >
                        New Arrivals
                      </Link>
                      <Link 
                        to={`/bulk-quote`} 
                        onClick={onClose}
                        className="px-3 py-1.5 bg-cyan-500 text-black rounded text-[11px] font-bold hover:bg-cyan-400 transition-all font-mono"
                      >
                        Volume Discount Quote
                      </Link>
                      <Link 
                        to={`/brands`} 
                        onClick={onClose}
                        className="px-3 py-1.5 bg-[#07090e] border border-cyan-500/30 rounded text-[11px] font-semibold text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-all font-mono"
                      >
                        Authorized Manufacturers
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Bar Footer */}
          <div className="mt-8 pt-5 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400 font-medium">
              <span className="font-bold text-cyan-400 uppercase text-[10px] tracking-widest">Quick Links:</span>
              <Link to="/products" onClick={onClose} className="hover:text-white transition-colors">Complete Catalog</Link>
              <Link to="/brands" onClick={onClose} className="hover:text-white transition-colors">Authorized Brands</Link>
              <Link to="/bulk-quote" onClick={onClose} className="hover:text-white transition-colors">Bulk Procurement</Link>
              <Link to="/project-enquiry" onClick={onClose} className="hover:text-white transition-colors">Project Bids</Link>
            </div>

            <button 
              onClick={onClose}
              aria-label="Close categories menu"
              className="text-slate-400 hover:text-white font-semibold flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-3 py-1.5"
            >
              <X className="w-4 h-4" />
              <span>Close (Esc)</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

