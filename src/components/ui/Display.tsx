import React from 'react';
import { ChevronRight } from 'lucide-react';

// --- Badge ---

export const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'neutral' | 'success' | 'error' | 'warning' | 'primary';
  className?: string;
}> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: 'bg-navy/90 text-text-secondary border border-border',
    success: 'bg-success/10 text-success border border-success/30',
    error: 'bg-error/10 text-error border border-error/30',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    primary: 'bg-teal/10 text-teal border border-teal/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// --- Status Indicator ---

export const StatusIndicator: React.FC<{ 
  status: 'online' | 'offline' | 'pending' | 'active' | 'inactive';
  label?: string;
  className?: string;
}> = ({ status, label, className = '' }) => {
  const colors = {
    online: 'bg-success shadow-[0_0_8px_#00FF66]',
    active: 'bg-success shadow-[0_0_8px_#00FF66]',
    offline: 'bg-text-muted',
    inactive: 'bg-text-muted',
    pending: 'bg-amber-400 shadow-[0_0_8px_#FBBF24]',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      {label && <span className="text-xs font-mono font-medium text-text-secondary uppercase">{label}</span>}
    </div>
  );
};

// --- Price Display ---

export const PriceDisplay: React.FC<{ 
  amount: number; 
  currency?: string; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ amount, currency = 'USD', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl lg:text-4xl',
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });

  return (
    <span className={`font-mono font-black tabular-nums text-teal ${sizes[size]} ${className}`}>
      {formatter.format(amount)}
    </span>
  );
};

// --- Breadcrumbs ---

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[]; className?: string }> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-xs font-mono font-medium text-text-muted">
        {items.map((item, index) => (
          <React.Fragment key={item.path}>
            <li className="flex items-center gap-2">
              <a 
                href={item.path} 
                className={`hover:text-teal transition-colors ${index === items.length - 1 ? 'text-teal font-bold pointer-events-none' : 'hover:underline'}`}
              >
                {item.label}
              </a>
            </li>
            {index < items.length - 1 && (
              <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

