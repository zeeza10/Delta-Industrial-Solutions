import React from 'react';
import { Search, Minus, Plus } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput: React.FC<InputProps> = ({ label, error, helperText, className = '', ...props }) => {
  const id = React.useId();
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider text-glow-cyan">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          industrial-input px-4 py-2.5 rounded-lg text-sm font-mono transition-all
          placeholder:text-slate-500
          ${error ? 'border-rose-500 shadow-[0_0_12px_rgba(255,42,95,0.4)]' : ''}
          disabled:bg-black/60 disabled:text-slate-600
        `}
        {...props}
      />
      {error && <span className="text-xs text-rose-400 font-medium font-mono">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-400 font-mono">{helperText}</span>}
    </div>
  );
};

export const SearchInput: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
      <input
        className="w-full pl-10 pr-4 py-2.5 industrial-input rounded-lg text-sm font-mono placeholder:text-slate-500"
        type="text"
        {...props}
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const SelectInput: React.FC<SelectProps> = ({ label, error, options, className = '', ...props }) => {
  const id = React.useId();
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider text-glow-cyan">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          industrial-input px-4 py-2.5 rounded-lg text-sm font-mono transition-all appearance-none cursor-pointer
          ${error ? 'border-rose-500' : ''}
          disabled:bg-black/60 disabled:text-slate-600
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0b0f19] text-slate-100 font-mono">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-400 font-medium font-mono">{error}</span>}
    </div>
  );
};

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => {
  const id = React.useId();
  return (
    <div className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="industrial-checkbox-input"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="text-xs font-mono font-medium text-slate-200 cursor-pointer select-none hover:text-cyan-400 transition-colors">
          {label}
        </label>
      )}
    </div>
  );
};

export const QuantitySelector: React.FC<{
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  className?: string;
}> = ({ value, onChange, min = 1, max = 999, className = '' }) => {
  const increment = () => value < max && onChange(value + 1);
  const decrement = () => value > min && onChange(value - 1);

  return (
    <div className={`inline-flex items-center border border-cyan-500/30 rounded-lg bg-[#07090e] overflow-hidden shadow-[0_0_10px_rgba(0,240,255,0.1)] ${className}`}>
      <button 
        onClick={decrement}
        disabled={value <= min}
        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-30 disabled:cursor-not-allowed border-r border-cyan-500/20 cursor-pointer transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (!isNaN(val) && val >= min && val <= max) onChange(val);
        }}
        className="w-12 text-center text-sm font-mono font-bold text-cyan-400 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button 
        onClick={increment}
        disabled={value >= max}
        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-30 disabled:cursor-not-allowed border-l border-cyan-500/20 cursor-pointer transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

