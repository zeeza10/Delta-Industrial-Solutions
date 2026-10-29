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
  Crown,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';

interface AdminSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { name: 'VIP Overview', path: '/admin', icon: LayoutDashboard },
  { name: 'Products & SKUs', path: '/admin/products', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: Layers },
  { name: 'Brands', path: '/admin/brands', icon: Tag },
  { name: 'B2B Enquiries', path: '/admin/enquiries', icon: MessageSquare, badge: 'Live' },
  { name: 'Enterprise Users', path: '/admin/users', icon: Users },
  { name: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Control Settings', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { signOut } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useAdmin();
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#07090e] border-r border-cyan-500/20 text-slate-200 flex flex-col transition-all duration-300 ease-in-out
          lg:relative
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-cyan-500/20">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-sm tracking-wider text-white font-mono uppercase text-glow-cyan block truncate">
                  Delta VIP
                </span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest block">CONTROL CENTER</span>
              </div>
            )}
          </Link>

          {/* Close mobile button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={isSidebarCollapsed ? item.name : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                  }
                  ${isSidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}
                {!isSidebarCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* VIP Security Seal / Collapser */}
        <div className="p-3 border-t border-cyan-500/20 space-y-2">
          {!isSidebarCollapsed && (
            <div className="p-2.5 rounded-lg bg-[#0b0f19] border border-cyan-500/20 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-emerald-400 font-bold truncate">ZERO-TRUST SECURED</p>
                <p className="text-[9px] text-slate-500 font-mono truncate">Role: Super Admin</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => signOut()}
              className={`
                flex items-center gap-2 px-3 py-2 text-xs font-mono text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg border border-transparent hover:border-rose-500/30 transition-all flex-1
                ${isSidebarCollapsed ? 'justify-center' : ''}
              `}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>

            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 rounded-lg border border-slate-800 hover:border-cyan-500/30 transition-all"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
