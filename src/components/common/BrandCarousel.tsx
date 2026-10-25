/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { BRANDS } from '../../data/brands';

export const BrandCarousel: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full py-6" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      
      {/* 3D Perspective Carousel Track */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-6 px-4"
        style={{ perspective: '1200px' }}
      >
        {BRANDS.map((brand) => (
          <div 
            key={brand.id}
            onClick={() => navigate(`/brands/${brand.slug}`)}
            className="group min-w-[280px] sm:min-w-[310px] max-w-[330px] p-6 sm:p-7 bg-gradient-to-b from-[#0b0f19] via-[#07090e] to-[#0b0f19] border border-cyan-500/40 hover:border-cyan-400 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between shrink-0 snap-center relative overflow-hidden transform hover:-translate-y-1.5"
          >
            {/* Cyberpunk Neon Glow Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl group-hover:bg-cyan-500/35 transition-all" />

            {/* Logo Container with 3D Depth */}
            <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 bg-[#04060a] rounded-xl border border-cyan-500/50 p-4 mb-5 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-300 transition-all duration-300 shadow-[inset_0_0_30px_rgba(0,240,255,0.2)]">
              <img 
                src={brand.logo || '/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg'}
                alt={brand.name}
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Brand Info */}
            <div className="relative z-10 space-y-2.5 w-full">
              <h4 className="font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1 font-mono tracking-tight">{brand.name}</h4>
              <div className="inline-flex items-center justify-center gap-1.5 text-[10px] text-cyan-400 font-mono uppercase tracking-widest bg-cyan-950/70 py-1 px-3 rounded-full border border-cyan-500/40 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Global Certified Alliance</span>
              </div>
            </div>

            {/* Bottom 3D lighting gradient */}
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-cyan-950/40 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Clean Bottom Navigation Controls Row */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button 
          onClick={() => scroll('left')}
          aria-label="Previous brand alliance"
          className="w-12 h-12 rounded-xl bg-[#0b0f19] border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => scroll('right')}
          aria-label="Next brand alliance"
          className="w-12 h-12 rounded-xl bg-[#0b0f19] border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer hover:scale-105"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
};
