/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, icon: Icon, description }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {Icon && <Icon className="w-16 h-16 mb-6 text-slate-300" />}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-500 max-w-md mx-auto">
        {description || `This is the ${title} page. It is currently under development as part of Phase 1.`}
      </p>
      <div className="mt-8 p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50 text-xs font-mono text-slate-400">
        [PHASE 1: FOUNDATION]
      </div>
    </div>
  );
};
