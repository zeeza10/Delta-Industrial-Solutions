/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Logo3D: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className} group cursor-pointer`} aria-label="Delta Industrial Solutions Logo">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/25 via-blue-600/35 to-purple-600/30 border border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.5)] animate-pulse" />
      <div className="absolute inset-0 rounded-xl border border-cyan-300/30 rotate-45 transform scale-75 group-hover:rotate-90 transition-transform duration-700" />
      
      <svg className="w-6 h-6 text-cyan-400 relative z-10 filter drop-shadow-[0_0_10px_rgba(0,240,255,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" fill="#0b0f19" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
      </svg>
    </div>
  );
};
