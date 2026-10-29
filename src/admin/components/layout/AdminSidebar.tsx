/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Tag, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  X, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Mail,
  History,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { ADMIN_NAV_GROUPS, AdminNavItem } from '../../constants/adminConstants';
import { logAdminSignOut } from '../../utils/adminAudit';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Mail,
  Package,
  Layers,
  Tag,
  FileText,
  ImageIcon,
  History,
  Users,
  Settings,
};

export const AdminSidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isSidebarCollapsed, toggleSidebar, isMobileMenuOpen, closeMobileMenu } = useAdmin();
  const { canAccessRoute } = useAdminPermissions();
  const location = useLocation();

  const handleSignOut = async () => {
    if (user) {
      await logAdminSignOut(user.uid, user.email || '', user.displayName || user.email || 'Admin');
    }
    await signOut();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        aria-label="Admin Navigation Sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#0D1118] border-r border-[#273244] text-slate-200 flex flex-col transition-all duration-300 ease-in-out shrink-0
          lg:static lg:h-screen
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#273244] shrink-0">
          <Link 
            to="/" 
            className="flex items-center gap-3 overflow-hidden rounded-lg focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
            title="Return to Storefront"
          >
            <div className="w-8 h-8 rounded-lg bg-[#18212D] border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.2)] shrink-0">
              <span className="font-mono font-bold text-base select-none">Δ</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-xs tracking-wider text-slate-100 font-mono uppercase block truncate">
                  Delta Industrial
                </span>
                <span className="text-[10px] text-[#22D3EE] font-mono tracking-widest block truncate">
                  VIP CONTROL CENTER
                </span>
              </div>
            )}
          </Link>

          {/* Close button for mobile drawer */}
          <button 
            onClick={closeMobileMenu}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grouped Navigation List */}
        <nav 
          className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar"
          aria-label="Admin Navigation Links"
        >
          {ADMIN_NAV_GROUPS.map((group) => {
            const accessibleItems = group.items.filter(item => canAccessRoute(item.path));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-3 pt-1 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 truncate">
                    {group.label}
                  </div>
                )}
                {accessibleItems.map((item: AdminNavItem) => {
                  const isActive = location.pathname === item.path || (item.path === '/admin/cms' && location.pathname.startsWith('/admin/cms'));
                  const IconComponent = iconMap[item.iconName] || LayoutDashboard;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      title={isSidebarCollapsed ? item.name : undefined}
                      aria-label={item.name}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors group relative
                        focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none
                        ${isActive 
                          ? 'bg-[#18212D] text-[#22D3EE] border border-[#273244] shadow-sm font-semibold' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-[#18212D]/60 border border-transparent'
                        }
                        ${isSidebarCollapsed ? 'justify-center' : ''}
                      `}
                    >
                      <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#22D3EE]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {!isSidebarCollapsed && (
                        <span className="truncate flex-1">{item.name}</span>
                      )}
                      {!isSidebarCollapsed && item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section: Security Seal & Sidebar Collapse Toggle */}
        <div className="p-3 border-t border-[#273244] space-y-2 shrink-0">
          {!isSidebarCollapsed && (
            <div className="p-2.5 rounded-lg bg-[#121823] border border-[#273244] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-emerald-400 font-bold truncate">ZERO-TRUST VERIFIED</p>
                <p className="text-[9px] text-slate-400 font-mono truncate">Audit & RBAC Enforced</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className={`
                flex items-center gap-2 px-3 py-2 text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg border border-transparent hover:border-red-500/20 transition-all flex-1
                focus-visible:ring-1 focus-visible:ring-red-400 outline-none
                ${isSidebarCollapsed ? 'justify-center' : ''}
              `}
              title="Sign Out of Session"
              aria-label="Sign Out of Session"
            >
              <LogOut className="w-4 h-4" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>

            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 text-slate-400 hover:text-[#22D3EE] hover:bg-[#18212D] rounded-lg border border-[#273244] transition-all focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
              title={isSidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
