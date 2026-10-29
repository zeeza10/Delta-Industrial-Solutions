/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminStatusBadgeVariant } from '../../types/admin.types';
import { Check, AlertTriangle, AlertCircle, Info, Crown, Circle } from 'lucide-react';

interface AdminBadgeProps {
  variant?: AdminStatusBadgeVariant | string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ 
  variant = 'default', 
  children, 
  className = '',
  showIcon = true
}) => {
  const safeVariant: AdminStatusBadgeVariant = (
    variant === 'success' || 
    variant === 'warning' || 
    variant === 'error' || 
    variant === 'info' || 
    variant === 'vip'
  ) ? variant : 'default';

  const variantStyles: Record<AdminStatusBadgeVariant, string> = {
    default: 'bg-[#18212D] text-slate-300 border-[#273244]',
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    error: 'bg-red-950/60 text-red-400 border-red-500/40',
    info: 'bg-cyan-950/60 text-[#22D3EE] border-[#22D3EE]/40',
    vip: 'bg-[#F5A623]/15 text-[#F5A623] border-[#F5A623]/40 shadow-sm',
  };

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (safeVariant) {
      case 'success':
        return <Check className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-amber-300 shrink-0" aria-hidden="true" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400 shrink-0" aria-hidden="true" />;
      case 'info':
        return <Info className="w-3 h-3 text-[#22D3EE] shrink-0" aria-hidden="true" />;
      case 'vip':
        return <Crown className="w-3 h-3 text-[#F5A623] shrink-0" aria-hidden="true" />;
      case 'default':
      default:
        return <Circle className="w-2 h-2 fill-current text-slate-400 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${variantStyles[safeVariant]} ${className}`}
    >
      {renderIcon()}
      <span>{children ?? 'Unknown'}</span>
    </span>
  );
};
