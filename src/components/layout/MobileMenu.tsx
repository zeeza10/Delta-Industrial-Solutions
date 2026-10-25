import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { X, ChevronDown, ChevronRight, User, Heart, ShoppingBag, ClipboardList, Search, Settings, LogOut, LogIn, Mic } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Logo3D } from '../common/3DLogo';
import { VoiceSearchModal } from '../common/VoiceSearchModal';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = React.useState(false);
  
  const { user, isAdmin, signOut, openAuthModal } = useAuth();
  const { cart, wishlist, openCartDrawer } = useStore();

  // Accessibility: Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Products', path: '/products', icon: null },
    { name: 'Brands', path: '/brands', icon: null },
    { name: 'Bulk Quote', path: '/bulk-quote', icon: <ClipboardList className="w-4 h-4 text-cyan-400" aria-hidden="true" /> },
    { name: 'Project Enquiries', path: '/project-enquiry', icon: null },
    { name: 'Cable Enquiries', path: '/cable-enquiry', icon: null },
    { name: 'About Us', path: '/about', icon: null },
    { name: 'Contact', path: '/contact', icon: null },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Panel', path: '/admin', icon: <Settings className="w-4 h-4 text-cyan-400" aria-hidden="true" /> });
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-[#04060A]/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`fixed inset-y-0 left-0 z-[70] w-full max-w-xs bg-[#07090e] text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.9)] border-r border-cyan-500/30 transition-transform duration-300 ease-in-out transform flex flex-col h-full overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-[#0b0f19]">
            <Link to="/" onClick={onClose} aria-label="Delta Industrial Solutions Home" className="flex items-center gap-3 group">
              <Logo3D className="w-9 h-9" />
              <div className="flex flex-col -space-y-0.5">
                <span className="leading-none text-white font-extrabold tracking-wider font-mono text-sm">DELTA</span>
                <span className="text-cyan-400 text-[9px] leading-none tracking-widest uppercase font-mono font-bold text-glow-cyan">INDUSTRIAL SOLUTIONS</span>
              </div>
            </Link>
            <button 
              onClick={onClose} 
              aria-label="Close mobile navigation"
              className="p-1.5 text-slate-300 hover:text-cyan-400 rounded-md hover:bg-cyan-950/40 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-cyan-500/20 bg-[#0b0f19]/60">
            <form onSubmit={handleSearchSubmit} className="relative" role="search">
              <label htmlFor="mobile-search-input" className="sr-only">Search products</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" aria-hidden="true" />
              <input 
                id="mobile-search-input"
                type="search" 
                placeholder="Search products & SKUs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
                className="w-full pl-9 pr-10 py-2 bg-[#07090e] border border-cyan-500/30 rounded-lg text-xs font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
              />
              <button 
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                aria-label="Open AI Voice Search"
                title="Open AI Voice Search Assistant"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors flex items-center"
              >
                <Mic className="w-4 h-4 animate-pulse" />
              </button>
            </form>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-3 divide-x divide-cyan-500/20 border-b border-cyan-500/20 bg-[#0b0f19]/80">
            <Link 
              to="/account" 
              onClick={onClose} 
              aria-label="Go to customer account"
              className="flex flex-col items-center gap-1 py-3 hover:bg-cyan-950/40 transition-colors text-slate-300 hover:text-cyan-400"
            >
              <User className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider truncate max-w-full px-2">
                {user?.displayName?.split(' ')[0] || 'Account'}
              </span>
            </Link>
            <Link 
              to="/wishlist" 
              onClick={onClose} 
              aria-label={`Wishlist with ${wishlist.length} saved products`}
              className="flex flex-col items-center gap-1 py-3 hover:bg-cyan-950/40 transition-colors relative text-slate-300 hover:text-cyan-400"
            >
              <Heart className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute top-2 right-4 w-3.5 h-3.5 bg-cyan-400 text-black text-[8px] font-mono font-bold flex items-center justify-center rounded-full shadow-[0_0_6px_rgba(0,240,255,0.8)]" aria-hidden="true">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button 
              onClick={() => { openCartDrawer(); onClose(); }} 
              aria-label={`Cart with ${cart.length} items`}
              className="flex flex-col items-center gap-1 py-3 hover:bg-cyan-950/40 transition-colors relative text-slate-300 hover:text-cyan-400"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Cart</span>
              <span className="absolute top-2 right-4 w-3.5 h-3.5 bg-cyan-400 text-black text-[8px] font-mono font-bold flex items-center justify-center rounded-full shadow-[0_0_6px_rgba(0,240,255,0.8)]" aria-hidden="true">
                {cart.length}
              </span>
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em] mb-1">Product Categories</div>
            {CATEGORIES.map((category) => (
              <div key={category.id} className="border-b border-cyan-500/10 last:border-0">
                <button 
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={expandedCategories.includes(category.id)}
                  className="w-full flex items-center justify-between py-2.5 px-3 text-xs font-bold text-slate-200 hover:bg-cyan-950/30 hover:text-cyan-400 rounded-lg transition-colors font-mono"
                >
                  <span>{category.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-cyan-400/70 transition-transform duration-200 ${expandedCategories.includes(category.id) ? 'rotate-180 text-cyan-400' : ''}`} aria-hidden="true" />
                </button>
                {expandedCategories.includes(category.id) && (
                  <div className="bg-[#0b0f19]/70 p-2 space-y-1 ml-3 border-l-2 border-cyan-500/40 my-1 rounded-r-md">
                    {category.subcategories?.map((sub: any) => (
                      <Link 
                        key={sub.id} 
                        to={`/categories/${sub.slug}`} 
                        onClick={onClose}
                        className="block px-2 py-1.5 text-xs text-slate-300 hover:text-cyan-400 font-medium transition-colors font-mono"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    <Link 
                      to={`/categories/${category.slug}`} 
                      onClick={onClose}
                      className="px-2 py-1.5 text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline font-mono"
                    >
                      View Category <ChevronRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            ))}

            <div className="px-2 py-1 text-[10px] font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em] mb-1 mt-5 border-t border-cyan-500/20 pt-4">Navigation</div>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => 
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    isActive ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]' : 'text-slate-300 hover:bg-cyan-950/30 hover:text-cyan-400'
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}

            {user ? (
              <button 
                onClick={() => { signOut(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold font-mono text-red-400 hover:bg-red-950/30 transition-all mt-4 border border-red-500/20"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => { openAuthModal('signin'); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold font-mono text-black bg-cyan-400 hover:bg-cyan-300 transition-all mt-4 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                <LogIn className="w-4 h-4 text-black" aria-hidden="true" />
                Sign In / B2B Portal
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#0b0f19] border-t border-cyan-500/20 text-center">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Delta Industrial Solutions B2B</p>
          </div>
        </div>
      </div>

      {/* AI Voice Search Modal */}
      <VoiceSearchModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={(query) => {
          setSearchQuery(query);
          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
          onClose();
        }}
      />
    </>
  );
};
