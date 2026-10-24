/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PageContainer, SectionHeading } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { BrandTile } from '../components/ui/Cards';
import { BRANDS } from '../data/brands';
import { Search } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useNavigate } from 'react-router-dom';

export const BrandDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const filteredBrands = BRANDS.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Brands', path: '/brands' }
  ];

  return (
    <PageContainer>
      <SEO 
        title="Authorized Electrical Manufacturers & Brand Directory"
        description="Official distributor directory for ABB, Schneider Electric, Siemens, Eaton, and leading global electrical automation manufacturers."
      />
      <Breadcrumbs items={breadcrumbs} className="mb-6" />
      
      <SectionHeading 
        title="Brand Directory" 
        subtitle="Explore our comprehensive range of products from world-leading industrial electrical manufacturers."
      />

      {/* Search & Alphabet */}
      <div className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-6 lg:p-8 mb-12 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl font-mono">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <label htmlFor="brand-search-input" className="sr-only">Search manufacturers</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" aria-hidden="true" />
            <input 
              id="brand-search-input"
              type="search" 
              placeholder="Search 50+ global manufacturers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search manufacturers"
              className="w-full pl-12 pr-4 py-3 industrial-input rounded-lg text-sm font-mono placeholder:text-slate-500"
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-1">
            {alphabet.map(letter => {
              const isActive = searchTerm.toUpperCase() === letter;
              return (
                <button 
                  key={letter}
                  onClick={() => setSearchTerm(letter)}
                  aria-label={`Filter brands starting with ${letter}`}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.6)] font-mono' 
                      : 'text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
            <button 
              onClick={() => setSearchTerm('')}
              aria-label="Show all brands"
              className={`px-3 h-8 flex items-center justify-center text-xs font-bold rounded transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer ${
                !searchTerm ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.6)] font-mono' : 'text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {filteredBrands.map(brand => (
          <BrandTile 
            key={brand.id}
            name={brand.name}
            logo={brand.logo || '/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg'}
            onClick={() => navigate(`/brands/${brand.slug}`)}
          />
        ))}
      </div>
    </PageContainer>
  );
};

