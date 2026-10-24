import React from 'react';
import { Loader2 } from 'lucide-react';

// --- Layout ---

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 ${className}`}>
    {children}
  </div>
);

// --- Typography ---

export const SectionHeading: React.FC<{ 
  title: string; 
  subtitle?: string; 
  align?: 'left' | 'center';
  className?: string;
  tag?: string;
}> = ({ title, subtitle, align = 'left', className = '', tag }) => (
  <div className={`mb-8 lg:mb-10 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
    {tag && (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal/10 border border-teal/30 rounded-full text-[10px] font-mono font-bold text-teal tracking-widest uppercase mb-3 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-teal" />
        <span>{tag}</span>
      </div>
    )}
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
    {subtitle && <p className="mt-2 text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">{subtitle}</p>}
  </div>
);

export const TextLink: React.FC<{ 
  href?: string; 
  to?: string; 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ href, to, children, className = '', onClick }) => {
  const baseClass = `text-teal hover:text-white font-bold transition-all underline-offset-4 hover:underline cursor-pointer ${className}`;
  
  if (to) {
    return <a href={to} className={baseClass} onClick={onClick}>{children}</a>;
  }
  
  return <a href={href} className={baseClass} onClick={onClick}>{children}</a>;
};

// --- Buttons ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  leftIcon, 
  rightIcon, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled,
  ...props 
}) => {
  const variants = {
    primary: 'bg-teal text-black font-extrabold hover:bg-teal-hover shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_28px_rgba(0,240,255,0.6)] border border-teal/50',
    secondary: 'bg-violet-neon text-white font-bold hover:bg-violet-neon/90 shadow-[0_0_15px_rgba(138,43,226,0.35)] hover:shadow-[0_0_28px_rgba(138,43,226,0.6)] border border-violet-neon/50',
    outline: 'bg-[#0b0f19] text-teal border border-teal/40 hover:border-teal hover:bg-teal/15 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]',
    ghost: 'bg-transparent text-text-primary hover:text-teal hover:bg-teal/10',
    neon: 'bg-gradient-to-r from-teal via-cyan-neon to-violet-neon text-black font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(138,43,226,0.6)] border-0',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-md',
    md: 'px-5 py-2.5 text-xs sm:text-sm font-bold rounded-lg',
    lg: 'px-7 py-3.5 text-sm sm:text-base font-extrabold rounded-xl',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        relative inline-flex items-center justify-center transition-all duration-300 cursor-pointer industrial-btn-glow
        focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-50 disabled:cursor-not-allowed
        hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {isLoading && <Loader2 className="absolute w-4 h-4 animate-spin" />}
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </button>
  );
};

export const PrimaryButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="outline" />
);


