/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { PageContainer, SectionHeading, SecondaryButton, PrimaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { ProductCard } from '../components/ui/Cards';
import { EmptyState } from '../components/ui/States';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { BRANDS } from '../data/brands';
import { searchProducts, SortOption, FilterOptions } from '../utils/search';
import { Filter, SortAsc, LayoutGrid, List, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategories, getProductsByCategory, getBrands } from '../utils/dbQueries';
import { Category, Product, Brand } from '../types';
import { SEO } from '../components/common/SEO';

export const CategoryListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const localCategory = CATEGORIES.find(c => c.slug === id) || 
                        CATEGORIES.flatMap(c => c.subcategories || []).find((sc: any) => sc.slug === id) ||
                        CATEGORIES[0];

  const getFilteredProducts = (cat: any, slug: string) => {
    if (!cat && !slug) return PRODUCTS;
    const targetSubcategory = CATEGORIES.flatMap(c => c.subcategories || []).find((sc: any) => sc.slug === slug || sc.id === slug);
    const targetCategory = CATEGORIES.find(c => c.slug === slug || c.id === slug || c.slug === cat?.slug || c.id === cat?.id);

    return PRODUCTS.filter(p => {
      if (targetSubcategory) {
        return p.categoryId === targetSubcategory.id || 
               p.categoryId === slug || 
               p.tags?.includes(targetSubcategory.id) || 
               p.tags?.includes(slug) ||
               p.slug?.includes(slug);
      } else if (targetCategory) {
        const subCategoryIds = targetCategory.subcategories ? targetCategory.subcategories.map((sc: any) => sc.id) : [];
        return p.categoryId === targetCategory.id || 
               subCategoryIds.includes(p.categoryId) || 
               p.tags?.includes(targetCategory.id) || 
               p.tags?.includes(targetCategory.slug);
      }
      return p.categoryId === slug || p.tags?.includes(slug);
    });
  };

  const [category, setCategory] = useState<Category | null>(localCategory as any);
  const [products, setProducts] = useState<Product[]>(getFilteredProducts(localCategory, id || ''));
  const [allBrands, setAllBrands] = useState<Brand[]>(BRANDS);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!id) return;
      try {
        const categories = await getCategories();
        let found = categories.find(c => c.slug === id);
        
        if (!found) {
          const local = CATEGORIES.find(c => c.slug === id) || 
                        CATEGORIES.flatMap(c => c.subcategories || []).find((sc: any) => sc.slug === id);
          if (local) found = local as any;
        }

        if (found) {
          setCategory(found);
          const catProducts = await getProductsByCategory(found.id);
          const fallback = getFilteredProducts(found, id);
          setProducts(catProducts.length > 0 ? [...catProducts, ...fallback.filter(p => !catProducts.some(cp => cp.id === p.id))] : fallback);
          const brands = await getBrands();
          if (brands.length > 0) setAllBrands(brands);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };
    fetchCategoryData();
  }, [id]);

  if (!category) {
    return (
      <PageContainer>
        <EmptyState 
          title="Category Not Found" 
          message="The category you are looking for does not exist or has been moved." 
          action={<Link to="/categories"><SecondaryButton>Browse All Categories</SecondaryButton></Link>}
        />
      </PageContainer>
    );
  }

  // URL States
  const sort = (searchParams.get('sort') as SortOption) || 'relevance';
  const selectedBrands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const availability = searchParams.get('availability')?.split(',').filter(Boolean) || [];

  const toggleBrand = (brandId: string) => {
    let newBrands = [...selectedBrands];
    if (newBrands.includes(brandId)) {
      newBrands = newBrands.filter(bid => bid !== brandId);
    } else {
      newBrands.push(brandId);
    }
    
    const newParams = new URLSearchParams(searchParams);
    if (newBrands.length > 0) newParams.set('brands', newBrands.join(','));
    else newParams.delete('brands');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({ sort });
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

  const filters: FilterOptions = {
    category: category.slug,
    brand: selectedBrands,
    minPrice,
    maxPrice,
    availability,
    specifications: specFilters
  };

  const results = searchProducts(products, '', filters, sort);

  // Derive Dynamic Filters
  const availableBrands = Array.from(new Set(products.map(p => p.brandId)))
    .map(bid => allBrands.find(b => b.id === bid))
    .filter(Boolean);

  const technicalSpecs = products.reduce((acc: any, p) => {
    if (p.specifications) {
      Object.entries(p.specifications).forEach(([key, val]) => {
        if (!acc[key]) acc[key] = new Set();
        acc[key].add(val);
      });
    }
    return acc;
  }, {});

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: category.name, path: `/categories/${category.slug}` }
  ];

  const categoryStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": crumb.label,
      "item": crumb.path.startsWith('http') ? crumb.path : `${typeof window !== 'undefined' ? window.location.origin : ''}${crumb.path}`
    }))
  };

  return (
    <PageContainer>
      <SEO 
        title={`${category.name} | Industrial Electrical Equipment`}
        description={`Explore our selection of ${category.name}. Technical specifications, stock availability, and manufacturer warranty guaranteed.`}
        structuredData={categoryStructuredData}
      />
      <Breadcrumbs items={breadcrumbs} className="mb-6" />
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#0b0f19] border border-cyan-500/30 rounded-lg mb-4">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            aria-expanded={showMobileFilters}
            aria-controls="mobile-category-filters"
            className="flex items-center gap-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="text-xs font-bold text-text-secondary uppercase">
            {results.length} Products
          </div>
        </div>

        <aside 
          id="mobile-category-filters"
          className={`lg:w-64 shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan font-mono">Refine Results</h2>
              {(selectedBrands.length > 0 || minPrice || maxPrice || availability.length > 0 || Object.keys(specFilters).length > 0) && (
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold text-cyan-400 hover:underline uppercase tracking-tighter"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-5 border border-cyan-500/30 rounded-2xl bg-[#0b0f19]/90 flex flex-col gap-6 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl industrial-card-3d font-mono">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-white flex items-center justify-between">
                  Subcategories
                  <ChevronDown className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  {CATEGORIES.find(c => c.id === category.id)?.subcategories?.map((sc: any) => (
                    <Link 
                      key={sc.id} 
                      to={`/categories/${sc.slug}`}
                      className={`flex items-center justify-between text-xs transition-colors ${id === sc.slug ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-cyan-400'}`}
                    >
                      {sc.name}
                    </Link>
                  ))}
                </div>
              </div>

              {availableBrands.length > 0 && (
                <div className="space-y-4 border-t border-cyan-500/20 pt-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-white">Brands</div>
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
            title={category.name} 
            subtitle={`Explore our comprehensive selection of ${category.name.toLowerCase()} for industrial and commercial projects.`}
            className="mb-6"
          />

          {/* Responsive Child Category Tabs Bar */}
          {(() => {
            const parentCat = CATEGORIES.find(c => 
              c.id === category?.id || c.subcategories?.some((sc: any) => sc.slug === id || sc.id === category?.id)
            );
            const childList = parentCat?.subcategories || (category as any)?.subcategories || [];

            if (childList.length === 0) return null;

            return (
              <div className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-3 mb-8 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl font-mono">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2 px-1">
                  {parentCat?.name || category.name} Subcategories:
                </div>
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {parentCat && (
                    <Link
                      to={`/categories/${parentCat.slug}`}
                      className={`px-3.5 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                        category.slug === parentCat.slug
                          ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                          : 'bg-[#07090e] text-slate-300 border-cyan-500/30 hover:border-cyan-400 hover:text-cyan-400'
                      }`}
                    >
                      All {parentCat.name}
                    </Link>
                  )}
                  {childList.map((sub: any) => {
                    const isCurrent = id === sub.slug || category.slug === sub.slug;
                    return (
                      <Link
                        key={sub.id}
                        to={`/categories/${sub.slug}`}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                          isCurrent
                            ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                            : 'bg-[#07090e] text-slate-300 border-cyan-500/30 hover:border-cyan-400 hover:text-cyan-400'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}

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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl mb-8 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl font-mono">
            <div className="text-xs font-semibold text-slate-300">
              Showing <span className="text-cyan-400 font-bold">{results.length}</span> certified components
            </div>
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
              <div className="hidden sm:flex items-center gap-1 border-r border-cyan-500/20 pr-3 mr-1">
                <button className="p-2 bg-cyan-500 text-black rounded font-bold"><LayoutGrid className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-cyan-950/40 rounded text-slate-400"><List className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2 text-slate-300 w-full sm:w-auto">
                <SortAsc className="w-4 h-4 text-cyan-400 shrink-0" />
                <select 
                  value={sort}
                  onChange={(e) => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('sort', e.target.value);
                    setSearchParams(newParams);
                  }}
                  className="text-xs font-bold bg-[#07090e] border border-cyan-500/30 rounded px-2.5 py-1.5 text-cyan-400 focus:outline-none cursor-pointer w-full sm:w-auto"
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

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {results.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  isNew={product.tags?.includes('featured')}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No Matching Components Found" 
              message="There are currently no products matching your active filters. Try adjusting your specifications." 
              action={<PrimaryButton onClick={clearAllFilters}>Reset All Filters</PrimaryButton>}
            />
          )}

          {results.length > 0 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button className="px-4 py-2 border border-border rounded text-xs font-bold text-text-secondary disabled:opacity-50" disabled>Previous</button>
              <button className="w-9 h-9 bg-navy text-white rounded text-xs font-bold shadow-md">1</button>
              <button className="w-9 h-9 hover:bg-slate-50 border border-border rounded text-xs font-bold transition-all">2</button>
              <button className="px-4 py-2 border border-border rounded text-xs font-bold text-text-secondary hover:bg-slate-50 transition-all">Next</button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

