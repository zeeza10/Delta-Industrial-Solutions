/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';

// --- Loading Skeleton ---

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white border border-border rounded-lg p-4 flex flex-col gap-4">
    <Skeleton className="aspect-square w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-6 w-full" />
    <div className="flex justify-between mt-auto">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

// --- Modal ---

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-text-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Feedback / Toast ---

export const Feedback: React.FC<{
  type?: 'success' | 'error' | 'info' | 'loading';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}> = ({ type = 'info', title, message, onClose, className = '' }) => {
  const styles = {
    success: { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', iconColor: 'text-success' },
    error: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800', iconColor: 'text-error' },
    info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800', iconColor: 'text-secondary-blue' },
    loading: { icon: Loader2, bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-800', iconColor: 'text-slate-400' },
  };

  const { icon: Icon, bg, border, text, iconColor } = styles[type];

  return (
    <div className={`p-4 rounded-lg border ${bg} ${border} ${text} flex gap-3 ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 ${iconColor} ${type === 'loading' ? 'animate-spin' : ''}`} />
      <div className="flex-grow">
        <h4 className="text-sm font-bold leading-tight">{title}</h4>
        {message && <p className="text-xs mt-1 opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-md self-start">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
