/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
    <p className="text-sm font-medium text-slate-500">{message}</p>
  </div>
);

export const EmptyState: React.FC<{ 
  title: string; 
  message: string; 
  action?: React.ReactNode 
}> = ({ title, message, action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
    <Inbox className="w-12 h-12 text-slate-300 mb-4" />
    <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs mb-6">{message}</p>
    {action}
  </div>
);
