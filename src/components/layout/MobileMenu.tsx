import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { X, ChevronDown, ChevronRight, User, Heart, ShoppingBag, ClipboardList, Search, Settings, LogOut, LogIn } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  
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
    { name: 'Bulk Quote', path: '/bulk-quote', icon: <ClipboardList className="w-4 h-4 text-teal" aria-hidden="true" /> },
    { name: 'Project Enquiries', path: '/project-enquiry', icon: null },
    { name: 'Cable Enquiries', path: '/cable-enquiry', icon: null },
    { name: 'About Us', path: '/about', icon: null },
    { name: 'Contact', path: '/contact', icon: null },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Panel', path: '/admin', icon: <Settings className="w-4 h-4 text-teal" aria-hidden="true" /> });
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-navy/50 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`fixed top-0 left-0 bottom-0 z-[70] w-full max-w-xs bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-navy text-white">
            <Link to="/" onClick={onClose} aria-label="Delta Industrial Solutions Home" className="text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 text-teal rounded flex items-center justify-center font-mono text-xs font-bold border border-white/20" aria-hidden="true">DI</div>
              <span className="font-extrabold tracking-tight">Delta <span className="text-teal font-normal text-xs uppercase tracking-widest">Industrial Solutions</span></span>
            </Link>
            <button 
              onClick={onClose} 
              aria-label="Close mobile navigation"
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border bg-page-bg">
            <form onSubmit={handleSearchSubmit} className="relative" role="search">
              <label htmlFor="mobile-search-input" className="sr-only">Search products</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
              <input 
                id="mobile-search-input"
                type="search" 
                placeholder="Search products & SKUs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
                className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </form>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-slate-50/80">
            <Link 
              to="/account" 
              onClick={onClose} 
              aria-label="Go to customer account"
              className="flex flex-col items-center gap-1 py-3 hover:bg-white transition-colors"
            >
              <User className="w-4 h-4 text-navy" aria-hidden="true" />
              <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-2 text-text-primary">
                {user?.displayName?.split(' ')[0] || 'Account'}
              </span>
            </Link>
            <Link 
              to="/wishlist" 
              onClick={onClose} 
              aria-label={`Wishlist with ${wishlist.length} saved products`}
              className="flex flex-col items-center gap-1 py-3 hover:bg-white transition-colors relative"
            >
              <Heart className="w-4 h-4 text-navy" aria-hidden="true" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-primary">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute top-2 right-5 w-3.5 h-3.5 bg-teal text-white text-[8px] font-bold flex items-center justify-center rounded-full" aria-hidden="true">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button 
              onClick={() => { openCartDrawer(); onClose(); }} 
              aria-label={`Cart with ${cart.length} items`}
              className="flex flex-col items-center gap-1 py-3 hover:bg-white transition-colors relative"
            >
              <ShoppingBag className="w-4 h-4 text-teal" aria-hidden="true" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-primary">Cart</span>
              <span className="absolute top-2 right-5 w-3.5 h-3.5 bg-navy text-white text-[8px] font-bold flex items-center justify-center rounded-full" aria-hidden="true">
                {cart.length}
              </span>
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Product Categories</div>
            {CATEGORIES.map((category) => (
              <div key={category.id} className="border-b border-slate-100 last:border-0">
                <button 
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={expandedCategories.includes(category.id)}
                  className="w-full flex items-center justify-between py-2.5 px-3 text-xs font-bold text-text-primary hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span>{category.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${expandedCategories.includes(category.id) ? 'rotate-180 text-teal' : ''}`} aria-hidden="true" />
                </button>
                {expandedCategories.includes(category.id) && (
                  <div className="bg-slate-50/80 p-2 space-y-1 ml-3 border-l-2 border-teal/40 my-1 rounded-r-md">
                    {category.subcategories?.map((sub: any) => (
                      <Link 
                        key={sub.id} 
                        to={`/categories/${sub.slug}`} 
                        onClick={onClose}
                        className="block px-2 py-1.5 text-xs text-text-secondary hover:text-navy font-medium transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    <Link 
                      to={`/categories/${category.slug}`} 
                      onClick={onClose}
                      className="px-2 py-1.5 text-xs font-bold text-teal flex items-center gap-1 hover:underline"
                    >
                      View Category <ChevronRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            ))}

            <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1 mt-5 border-t border-border pt-4">Navigation</div>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => 
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-navy text-white shadow-2xs' : 'text-text-primary hover:bg-slate-50'
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
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-error hover:bg-red-50 transition-all mt-4"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => { openAuthModal('signin'); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-navy bg-slate-100 hover:bg-slate-200 transition-all mt-4"
              >
                <LogIn className="w-4 h-4 text-teal" aria-hidden="true" />
                Sign In
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-border text-center">
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Delta Industrial Solutions B2B</p>
          </div>
        </div>
      </div>
    </>
  );
};

