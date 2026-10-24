/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PageContainer, SectionHeading, SecondaryButton, PrimaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { ProductCard } from '../components/ui/Cards';
import { EmptyState } from '../components/ui/States';
import { PRODUCTS } from '../data/products';
import { BRANDS } from '../data/brands';
import { searchProducts, SortOption, FilterOptions } from '../utils/search';
import { SortAsc, LayoutGrid, List, X, ChevronDown, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getBrands } from '../utils/dbQueries';
import { Product, Brand } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEO } from '../components/common/SEO';

export const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        if (db) {
          const snap = await getDocs(collection(db, 'products'));
          const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
          setAllProducts(products.length > 0 ? products : PRODUCTS);
          
          const brands = await getBrands();
          setAllBrands(brands.length > 0 ? brands : BRANDS);
        } else {
          setAllProducts(PRODUCTS);
          setAllBrands(BRANDS);
        }
      } catch (error) {
        console.error('Error fetching search data:', error);
        setAllProducts(PRODUCTS);
        setAllBrands(BRANDS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }
  
  // URL States
  const query = searchParams.get('q') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'relevance';
  const selectedBrands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const availability = searchParams.get('availability')?.split(',').filter(Boolean) || [];
  
  // Specification Filters
  const specFilters = searchParams.get('specs')?.split(';').filter(Boolean).reduce((acc: any, curr) => {
    const [key, values] = curr.split(':');
    acc[key] = values.split(',');
    return acc;
  }, {}) || {};

  const toggleSpec = (key: string, value: string) => {
    const currentValues = specFilters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    
    const newSpecFilters = { ...specFilters };
    if (newValues.length > 0) newSpecFilters[key] = newValues;
    else delete newSpecFilters[key];

    const specString = Object.entries(newSpecFilters)
      .map(([k, v]) => `${k}:${(v as string[]).join(',')}`)
      .join(';');

    const newParams = new URLSearchParams(searchParams);
    if (specString) newParams.set('specs', specString);
    else newParams.delete('specs');
    setSearchParams(newParams);
  };

  const toggleBrand = (brandId: string) => {
    let newBrands = [...selectedBrands];
    if (newBrands.includes(brandId)) {
      newBrands = newBrands.filter(id => id !== brandId);
    } else {
      newBrands.push(brandId);
    }
    const newParams = new URLSearchParams(searchParams);
    if (newBrands.length > 0) newParams.set('brands', newBrands.join(','));
    else newParams.delete('brands');
    setSearchParams(newParams);
  };

  const toggleAvailability = (val: string) => {
    const newAvail = availability.includes(val) 
      ? availability.filter(v => v !== val) 
      : [...availability, val];
    const newParams = new URLSearchParams(searchParams);
    if (newAvail.length > 0) newParams.set('availability', newAvail.join(','));
    else newParams.delete('availability');
    setSearchParams(newParams);
  };

  // Build Filters
  const filters: FilterOptions = {
    brand: selectedBrands,
    availability,
    specifications: specFilters
  };

  // Perform Search
  const results = searchProducts(allProducts, query, filters, sort);

  // Derive Dynamic Filters from search results
  const availableBrands = Array.from(new Set(results.map(p => p.brandId)))
    .map(bid => allBrands.find(b => b.id === bid))
    .filter(Boolean);

  const technicalSpecs = results.reduce((acc: any, p) => {
    if (p.specifications) {
      Object.entries(p.specifications).forEach(([key, val]) => {
        if (!acc[key]) acc[key] = new Set();
        acc[key].add(val);
      });
    }
    return acc;
  }, {});

  const clearAllFilters = () => {
    setSearchParams({ q: query, sort });
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Search Results', path: '/search' }
  ];

  return (
    <PageContainer>
      <SEO 
        title={query ? `Search: "${query}" | Industrial Catalog` : 'Industrial Electrical Catalog'}
        description={`Browse ${results.length} industrial electrical equipment and automation components. Filter by brand, technical specifications, and availability.`}
      />
      <Breadcrumbs items={breadcrumbs} className="mb-6" />
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#0b0f19] border border-cyan-500/30 rounded-lg mb-4 w-full">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            aria-expanded={showMobileFilters}
            aria-controls="mobile-search-filters"
            className="flex items-center gap-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="text-xs font-bold text-text-secondary uppercase">
            {results.length} Results
          </div>
        </div>

        <aside 
          id="mobile-search-filters"
          className={`lg:w-64 shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan font-mono">Filter Results</h2>
              {(selectedBrands.length > 0 || availability.length > 0 || Object.keys(specFilters).length > 0) && (
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold text-cyan-400 hover:underline uppercase tracking-tighter"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-5 border border-cyan-500/30 rounded-2xl bg-[#0b0f19]/90 flex flex-col gap-6 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl industrial-card-3d font-mono">
              {availableBrands.length > 0 && (
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-white">Manufacturers</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {availableBrands.map((brand: any) => (
                      <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedBrands.includes(brand.id)}
                          onChange={() => toggleBrand(brand.id)}
                          className="w-4 h-4 rounded border-cyan-500/40 bg-black text-cyan-400 focus:ring-cyan-400/20 cursor-pointer"
                        />
                        <span className={`text-xs group-hover:text-cyan-400 transition-colors ${selectedBrands.includes(brand.id) ? 'text-white font-bold' : 'text-slate-400'}`}>
                          {brand.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {Object.entries(technicalSpecs).map(([key, values]: [string, any]) => (
                <div key={key} className="space-y-4 border-t border-cyan-500/20 pt-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-white">{key}</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {Array.from(values).sort().map((val: any) => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={specFilters[key]?.includes(val)}
                          onChange={() => toggleSpec(key, val)}
                          className="w-4 h-4 rounded border-cyan-500/40 bg-black text-cyan-400 focus:ring-cyan-400/20 cursor-pointer"
                        />
                        <span className={`text-xs group-hover:text-cyan-400 transition-colors ${specFilters[key]?.includes(val) ? 'text-white font-bold' : 'text-slate-400'}`}>
                          {val}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-4 border-t border-cyan-500/20 pt-6">
                <div className="text-xs font-bold uppercase tracking-widest text-white">Availability</div>
                <div className="space-y-2">
                  {['In Stock', 'Out of Stock'].map((label) => {
                    const val = label.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <label key={val} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={availability.includes(val)}
                          onChange={() => toggleAvailability(val)}
                          className="w-4 h-4 rounded border-cyan-500/40 bg-black text-cyan-400 focus:ring-cyan-400/20 cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 group-hover:text-cyan-400 transition-colors">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-grow">
          <SectionHeading 
            title={query ? `Search Results for "${query}"` : 'All Products'} 
            subtitle={results.length > 0 ? `We found ${results.length} products matching your criteria.` : 'Try adjusting your search terms or filters.'}
            className="mb-8"
          />

          {(selectedBrands.length > 0 || availability.length > 0 || Object.keys(specFilters).length > 0) && (
            <div className="flex flex-wrap gap-2 mb-6 font-mono">
              {selectedBrands.map(bid => (
                <div key={bid} className="flex items-center gap-1 px-3 py-1 bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Brand: {BRANDS.find(b => b.id === bid)?.name}
                  <button onClick={() => toggleBrand(bid)}><X className="w-3 h-3 ml-1" /></button>
                </div>
              ))}
              {Object.entries(specFilters).map(([key, values]: [string, any]) => 
                values.map((val: string) => (
                  <div key={`${key}-${val}`} className="flex items-center gap-1 px-3 py-1 bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {key}: {val}
                    <button onClick={() => toggleSpec(key, val)}><X className="w-3 h-3 ml-1" /></button>
                  </div>
                ))
              )}
              {availability.map(val => (
                <div key={val} className="flex items-center gap-1 px-3 py-1 bg-teal/10 text-teal border border-teal/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {val.replace('-', ' ')}
                  <button onClick={() => toggleAvailability(val)}><X className="w-3 h-3 ml-1" /></button>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl mb-8 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl font-mono">
                <div className="text-xs font-semibold text-slate-300">
                  Showing <span className="text-cyan-400 font-bold">{results.length}</span> certified products
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 border-r border-cyan-500/20 pr-4 mr-2">
                    <button className="p-2 bg-cyan-500 text-black rounded font-bold"><LayoutGrid className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-cyan-950/40 rounded text-slate-400"><List className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <SortAsc className="w-4 h-4 text-cyan-400" />
                    <select 
                      value={sort}
                      onChange={(e) => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('sort', e.target.value);
                        setSearchParams(newParams);
                      }}
                      className="text-xs font-bold bg-[#07090e] border border-cyan-500/30 rounded px-2 py-1 text-cyan-400 focus:outline-none cursor-pointer"
                    >
                      <option value="relevance">Sort by: Relevance</option>
                      <option value="name">Sort by: Name</option>
                      <option value="price-low">Sort by: Price Low-High</option>
                      <option value="price-high">Sort by: Price High-Low</option>
                      <option value="newest">Sort by: Newest</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {results.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    isNew={product.tags?.includes('featured')}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState 
              title="No Products Found" 
              message={`We couldn't find any products matching "${query}".`}
              action={
                <div className="flex flex-col gap-4 items-center">
                  <p className="text-xs text-text-secondary font-medium">Try these popular technical terms:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Circuit Breaker', 'Cable', 'PLC', 'LED', 'Sensor'].map(term => (
                      <Link 
                        key={term}
                        to={`/search?q=${term}`}
                        className="px-3.5 py-1.5 bg-[#0b0f19] border border-cyan-500/30 rounded text-xs font-bold text-white hover:border-cyan-400 hover:text-cyan-400 transition-all"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                  <PrimaryButton onClick={clearAllFilters} className="mt-4 bg-navy hover:bg-industrial-blue">Reset All Filters</PrimaryButton>
                </div>
              }
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

