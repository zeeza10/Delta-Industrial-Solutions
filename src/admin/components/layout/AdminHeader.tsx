/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Activity,
  User as UserIcon,
  Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { AdminBadge } from '../common/AdminBadge';

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { systemHealth, unreadNotificationsCount } = useAdmin();

  return (
    <header className="h-16 bg-[#07090e]/95 border-b border-cyan-500/20 px-4 lg:px-8 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-30">
      {/* Left items: Mobile menu & Quick Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 rounded-lg"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0b0f19] border border-cyan-500/20 text-xs font-mono text-slate-400 w-64 lg:w-80">
          <Search className="w-4 h-4 text-cyan-400/70 shrink-0" />
          <input
            type="text"
            placeholder="Quick search SKUs, orders, clients..."
            className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full font-mono text-xs"
          />
        </div>
      </div>

      {/* Right items: System status, Storefront link, Notifications, User pill */}
      <div className="flex items-center gap-3">
        {/* System Health Pulse */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b0f19] border border-cyan-500/20 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${systemHealth.databaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-[11px] text-slate-300">
            {systemHealth.databaseConnected ? 'LIVE SYNC ACTIVE' : 'LOCAL BACKUP'}
          </span>
        </div>

        {/* View Storefront */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notifications Icon */}
        <div className="relative">
          <button 
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
          </button>
        </div>

        {/* Admin User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-mono font-bold text-white truncate max-w-[140px]">
                {user?.displayName || 'VIP Admin'}
              </span>
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 block truncate max-w-[150px]">
              {user?.email || 'admin@deltaindustrials.com'}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <div className="w-full h-full rounded-full bg-[#07090e] flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Admin Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-cyan-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
