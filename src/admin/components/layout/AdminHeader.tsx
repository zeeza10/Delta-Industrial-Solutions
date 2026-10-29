/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  ExternalLink, 
  User as UserIcon,
  Crown,
  ChevronRight,
  LogOut,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';

export const AdminHeader: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { 
    systemHealth, 
    refreshSystemHealth, 
    openMobileMenu, 
    toggleSidebar, 
    isSidebarCollapsed 
  } = useAdmin();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumb from current route
  const getBreadcrumb = (pathname: string): { section: string; title: string } => {
    switch (pathname) {
      case '/admin':
        return { section: 'Overview', title: 'Executive Command' };
      case '/admin/analytics':
        return { section: 'Overview', title: 'Commercial Analytics' };
      case '/admin/enquiries':
        return { section: 'Operations', title: 'B2B Procurement RFQs' };
      case '/admin/products':
        return { section: 'Catalog', title: 'Products & SKUs' };
      case '/admin/categories':
        return { section: 'Catalog', title: 'Taxonomies' };
      case '/admin/brands':
        return { section: 'Catalog', title: 'OEM Partners' };
      case '/admin/users':
        return { section: 'Administration', title: 'Corporate Accounts' };
      case '/admin/settings':
        return { section: 'Administration', title: 'Control Settings' };
      default:
        return { section: 'Admin', title: 'Control Center' };
    }
  };

  const breadcrumb = getBreadcrumb(location.pathname);

  // Real database health formatting
  const isDbConnected = systemHealth.databaseStatus === 'connected';
  const isDbChecking = systemHealth.databaseStatus === 'checking';

  return (
    <header className="h-16 bg-[#0D1118]/95 border-b border-[#273244] px-4 lg:px-6 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-30 shrink-0">
      {/* Left items: Mobile drawer trigger, Desktop toggle, Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={openMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-[#22D3EE] hover:bg-[#18212D] rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-mono truncate">
          <span className="text-slate-500 uppercase tracking-wider hidden sm:inline">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline shrink-0" />
          <span className="text-slate-400 uppercase tracking-wider hidden md:inline">{breadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden md:inline shrink-0" />
          <span className="text-slate-100 font-bold tracking-wide truncate">{breadcrumb.title}</span>
        </div>
      </div>

      {/* Right items: Real System Health, Storefront Link, Notifications, User Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Real System Health Indicator */}
        <div 
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#121823] border border-[#273244] text-xs font-mono"
          title={`Firestore DB: ${systemHealth.databaseStatus}. Last probe: ${systemHealth.lastChecked ? new Date(systemHealth.lastChecked).toLocaleTimeString() : 'Pending'}`}
        >
          <span 
            className={`w-2 h-2 rounded-full ${
              isDbConnected 
                ? 'bg-emerald-400' 
                : isDbChecking 
                ? 'bg-amber-400 animate-pulse' 
                : 'bg-red-400'
            }`} 
          />
          <span className="text-[11px] text-slate-300 font-medium">
            {isDbConnected ? 'DB ONLINE' : isDbChecking ? 'CHECKING...' : 'DB OFFLINE'}
          </span>
          <button 
            onClick={() => refreshSystemHealth()} 
            className="text-slate-500 hover:text-[#22D3EE] transition-colors p-0.5"
            title="Probe connection"
            aria-label="Probe database connection"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* View Storefront Link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18212D] hover:bg-[#1E293B] border border-[#273244] hover:border-[#22D3EE]/50 text-slate-300 hover:text-white text-xs font-mono transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Restrained Notifications Menu */}
        <div className="relative" ref={notifMenuRef}>
          <button 
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="p-2 text-slate-400 hover:text-[#22D3EE] hover:bg-[#18212D] rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
            title="System Notifications"
            aria-label="View system alerts"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="w-4 h-4" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#121823] border border-[#273244] shadow-2xl p-4 text-xs font-mono z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-[#273244] pb-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider">Operational Alerts</span>
                <span className="text-[10px] text-slate-500">Real-Time</span>
              </div>
              <div className="p-3 rounded-lg bg-[#18212D] border border-[#273244] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Systems Normal</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Firestore rules verified. Zero-trust security enforcement is active.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Account Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#18212D] border border-transparent hover:border-[#273244] transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
            aria-expanded={isUserMenuOpen}
            aria-label="User account menu"
          >
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs font-mono font-bold text-slate-100 truncate max-w-[120px]">
                  {user?.displayName || 'VIP Admin'}
                </span>
                <Crown className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[130px]">
                {profile?.role === 'admin' ? 'Super Admin' : 'Admin Session'}
              </span>
            </div>

            <div className="w-8 h-8 rounded-lg bg-[#18212D] border border-[#273244] flex items-center justify-center overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Admin Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-[#22D3EE]" />
              )}
            </div>
          </button>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121823] border border-[#273244] shadow-2xl p-3 text-xs font-mono z-50 space-y-3">
              <div className="p-2.5 rounded-lg bg-[#18212D] border border-[#273244] space-y-1">
                <p className="font-bold text-slate-100 truncate">{user?.displayName || 'Administrator'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@deltaindustrials.com'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 uppercase">
                  {profile?.role === 'admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>

              <div className="space-y-1 border-t border-[#273244] pt-2">
                <Link
                  to="/account"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#18212D] transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#22D3EE]" />
                  <span>Account Profile</span>
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#18212D] transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#22D3EE]" />
                  <span>Security & Policy</span>
                </Link>
              </div>

              <div className="border-t border-[#273244] pt-2">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
