/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  User, 
  Heart, 
  ClipboardList, 
  ChevronDown,
  LayoutGrid,
  Settings,
  Sparkles,
  Mic
} from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';
import { SearchAutocomplete } from './SearchAutocomplete';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Logo3D } from '../common/3DLogo';
import { VoiceSearchModal } from '../common/VoiceSearchModal';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, openAuthModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  const { cart, wishlist, quotes, cartTotal, openCartDrawer } = useStore();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      (e.target as HTMLFormElement).querySelector('input')?.blur();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const navLinks = [
    { name: 'Products', path: '/products' },
    { name: 'Brands', path: '/brands' },
    { name: 'Bulk Quote', path: '/bulk-quote' },
    { name: 'Project Enquiries', path: '/project-enquiry' },
    { name: 'Cable Enquiries', path: '/cable-enquiry' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="relative z-[100] w-full">
      <AnnouncementBar />
      
      {/* Main Header Desktop */}
      <div className="bg-[#07090e]/90 backdrop-blur-md border-b border-cyan-500/20 py-3.5 lg:py-4 relative z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Zone 1: Logo & Brand Identity */}
            <Link 
              to="/" 
              aria-label="Delta Industrial Solutions Homepage"
              className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 sm:gap-3 group"
            >
              <Logo3D className="w-9 h-9 sm:w-11 sm:h-11" />
              <div className="flex flex-col -space-y-0.5">
                <span className="leading-none text-white font-extrabold tracking-wider font-mono text-xs sm:text-base">DELTA</span>
                <span className="text-cyan-400 text-[8px] sm:text-[10px] leading-none tracking-widest uppercase font-mono font-bold text-glow-cyan">INDUSTRIAL SOLUTIONS</span>
              </div>
            </Link>

            {/* Zone 2: Sleek Search Bar */}
            <div ref={searchContainerRef} className="hidden md:flex flex-grow max-w-xl lg:max-w-2xl relative" role="search">
              <form onSubmit={handleSearchSubmit} className="w-full relative group" action="/search" method="get">
                <label htmlFor="desktop-search-input" className="sr-only">Search catalog by SKU, part number or product name</label>
                <input 
                  id="desktop-search-input"
                  type="search" 
                  placeholder="Search 15,000+ industrial parts, SKUs, or use Voice Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  aria-label="Search catalog by SKU, part number or product name"
                  aria-autocomplete="list"
                  className="w-full pl-11 pr-32 py-2.5 bg-[#0b0f19]/80 border border-cyan-500/20 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all font-mono text-slate-100 placeholder:text-slate-500 industrial-input"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true" />
                
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    aria-label="Open AI Voice Search"
                    title="Open AI Voice Search Assistant"
                    className="p-1.5 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    <Mic className="w-4 h-4 animate-pulse" />
                  </button>

                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={handleClearSearch}
                      aria-label="Clear search input"
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    type="submit"
                    aria-label="Submit search"
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-[11px] font-mono font-bold uppercase tracking-wider rounded hover:shadow-[0_0_12px_rgba(0,240,255,0.5)] transition-all"
                  >
                    Search
                  </button>
                </div>
              </form>
              
              <SearchAutocomplete 
                query={debouncedSearchQuery} 
                isOpen={isSearchFocused} 
                onClose={() => setIsSearchFocused(false)} 
              />
            </div>

            {/* Zone 3: Quick Actions (Account, Wishlist, Cart) */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              
              {/* Account Dropdown / Button (Desktop Only) */}
              <div className="hidden md:flex items-center">
                {user ? (
                  <div className="relative group">
                    <button 
                      onClick={() => navigate('/account')}
                      aria-label="Customer account menu"
                      className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:text-cyan-400 transition-colors rounded-md hover:bg-cyan-950/30"
                    >
                      <User className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider truncate max-w-[70px]">
                        {profile?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Account'}
                      </span>
                    </button>
                    <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-[300] pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                      <div className="bg-[#0b0f19] border border-cyan-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.95)] rounded-xl py-2 w-56 font-mono text-xs backdrop-blur-2xl" role="menu">
                        <div className="px-4 py-2 border-b border-cyan-500/20 bg-cyan-950/40 text-[11px] text-cyan-400 font-bold uppercase tracking-wider truncate">
                          {user.email}
                        </div>
                        <div className="p-2 space-y-1">
                          <Link 
                            to="/account" 
                            className="block px-3 py-2 rounded text-xs text-slate-300 hover:bg-cyan-500/15 hover:text-cyan-400 transition-colors"
                          >
                            Dashboard & Orders
                          </Link>
                          {isAdmin && (
                            <Link 
                              to="/admin" 
                              className="block px-3 py-2 rounded text-xs text-cyan-400 bg-cyan-950/30 hover:bg-cyan-950/60 font-bold transition-colors"
                            >
                              Admin Console
                            </Link>
                          )}
                          <button
                            onClick={() => signOut()}
                            className="w-full text-left px-3 py-2 rounded text-xs text-red-400 hover:bg-red-950/30 transition-colors font-bold"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <button 
                      onClick={() => openAuthModal('signin')}
                      aria-label="Sign in to your account"
                      aria-haspopup="true"
                      className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:text-cyan-400 transition-colors rounded-md hover:bg-cyan-950/30"
                    >
                      <User className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Login</span>
                    </button>
                    <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-[300] pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                      <div className="bg-[#0b0f19] border border-cyan-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.95)] rounded-xl py-2 w-56 font-mono text-xs backdrop-blur-2xl" role="menu">
                        <div className="px-4 py-2 border-b border-cyan-500/20 bg-cyan-950/40 text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                          B2B Portal Access
                        </div>
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => openAuthModal('signin')}
                            className="w-full text-left px-3 py-2 rounded text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => openAuthModal('register')}
                            className="w-full text-left px-3 py-2 rounded text-xs font-medium text-slate-300 hover:bg-cyan-500/15 hover:text-cyan-400 transition-colors"
                          >
                            Create B2B Account
                          </button>
                          <Link 
                            to="/bulk-quote" 
                            className="block px-3 py-2 rounded text-xs text-slate-300 hover:bg-cyan-500/15 hover:text-cyan-400 transition-colors"
                          >
                            Track RFQ / Quote
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist (Desktop Only) */}
              <div className="hidden md:flex items-center">
                <Link 
                  to="/wishlist" 
                  aria-label={`Wishlist with ${wishlist.length} saved products`}
                  className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:text-cyan-400 transition-colors relative rounded-md hover:bg-cyan-950/30"
                >
                  <Heart className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-400 text-black text-[9px] font-mono font-bold flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" aria-hidden="true">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              </div>

              {/* Cart Drawer Trigger */}
              <button 
                onClick={openCartDrawer}
                aria-label={`Shopping cart with ${cart.length} items`}
                className="relative p-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 rounded-xl flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 text-white text-[10px] font-mono font-bold flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(138,43,226,0.8)] border border-cyan-300" aria-hidden="true">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                aria-label="Toggle mobile menu"
                className="lg:hidden shrink-0 flex items-center justify-center p-2.5 bg-cyan-950/80 border border-cyan-500/60 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer z-50"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Navigation Row Desktop */}
      <nav aria-label="Main Navigation" className="hidden md:block bg-[#07090e]/95 text-white sticky top-0 z-30 border-b border-cyan-500/20 shadow-xl backdrop-blur-md relative font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            
            {/* Category MegaMenu Trigger */}
            <div className="h-full">
              <button 
                onClick={() => setIsMegaMenuOpen(prev => !prev)}
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
                aria-label="All Categories Mega Menu"
                className={`flex items-center gap-2.5 px-5 h-full font-bold text-xs sm:text-sm tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  isMegaMenuOpen ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]' : 'bg-cyan-950/40 hover:bg-cyan-500/20 text-cyan-400 border-r border-cyan-500/20'
                }`}
              >
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                <span>CATEGORIES</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>

            {/* Links */}
            <div className="flex items-center gap-1 h-full overflow-x-auto no-scrollbar">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3.5 h-full flex items-center text-xs font-bold tracking-wide whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 text-glow-cyan' 
                        : 'text-slate-300 hover:bg-cyan-500/5 hover:text-cyan-300'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* B2B Technical Support Badge */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-cyan-400/80 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              <span className="text-glow-cyan">INDUSTRIAL SUPPORT ONLINE</span>
            </div>
          </div>
        </div>

        {/* Full-width Responsive Mega Menu */}
        <MegaMenu 
          isOpen={isMegaMenuOpen} 
          onClose={() => setIsMegaMenuOpen(false)} 
        />
      </nav>

      {/* Mobile Navigation Drawer */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* AI Voice Search Modal */}
      <VoiceSearchModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={(query) => {
          setSearchQuery(query);
          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
      />
    </header>
  );
};
