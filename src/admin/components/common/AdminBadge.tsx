/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminStatusBadgeVariant } from '../../types/admin.types';

interface AdminBadgeProps {
  variant?: AdminStatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ 
  variant = 'default', 
  children, 
  className = '' 
}) => {
  const variantStyles: Record<AdminStatusBadgeVariant, string> = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    error: 'bg-rose-950/80 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    info: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]',
    vip: 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
