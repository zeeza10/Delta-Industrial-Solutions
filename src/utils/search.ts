/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';
import { CATEGORIES } from '../data/categories';
import { BRANDS } from '../data/brands';

export interface FilterOptions {
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: string[];
  specifications?: Record<string, string[]>;
}

export type SortOption = 'relevance' | 'name' | 'price-low' | 'price-high' | 'newest';

export const normalizeString = (str: string) => {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
};

export const searchProducts = (
  products: Product[],
  query: string,
  filters: FilterOptions = {},
  sort: SortOption = 'relevance'
) => {
  let filtered = [...products];

  // 1. Search Query
  if (query.trim()) {
    const normalizedQuery = normalizeString(query);
    filtered = filtered.filter(p => {
      const name = normalizeString(p.name);
      const sku = normalizeString(p.sku);
      const desc = normalizeString(p.description);
      const brand = normalizeString(BRANDS.find(b => b.id === p.brandId)?.name || '');
      const category = normalizeString(CATEGORIES.find(c => c.id === p.categoryId)?.name || '');
      
      const specsMatch = Object.values(p.specifications).some(val => 
        normalizeString(val).includes(normalizedQuery)
      );

      return name.includes(normalizedQuery) || 
             sku.includes(normalizedQuery) || 
             desc.includes(normalizedQuery) ||
             brand.includes(normalizedQuery) ||
             category.includes(normalizedQuery) ||
             specsMatch;
    });
  }

  // 2. Filters
  if (filters.category) {
    const targetSubcategory = CATEGORIES.flatMap(c => c.subcategories || []).find((sc: any) => sc.slug === filters.category || sc.id === filters.category);
    const targetCategory = CATEGORIES.find(c => c.slug === filters.category || c.id === filters.category);
    
    if (targetSubcategory) {
      filtered = filtered.filter(p => 
        p.categoryId === targetSubcategory.id || 
        p.categoryId === filters.category ||
        p.tags?.includes(targetSubcategory.id) ||
        p.tags?.includes(filters.category || '') ||
        p.slug?.includes(filters.category || '')
      );
    } else if (targetCategory) {
      const subCategoryIds = targetCategory.subcategories ? targetCategory.subcategories.map(sc => sc.id) : [];
      filtered = filtered.filter(p => 
        p.categoryId === targetCategory.id || 
        subCategoryIds.includes(p.categoryId) ||
        p.tags?.includes(targetCategory.id) ||
        p.tags?.includes(targetCategory.slug)
      );
    }
  }

  if (filters.brand && filters.brand.length > 0) {
    filtered = filtered.filter(p => filters.brand?.includes(p.brandId));
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= (filters.minPrice || 0));
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= (filters.maxPrice || Infinity));
  }

  if (filters.availability && filters.availability.length > 0) {
    filtered = filtered.filter(p => {
      if (filters.availability?.includes('in-stock')) return p.isAvailable && p.stock > 0;
      if (filters.availability?.includes('out-of-stock')) return !p.isAvailable || p.stock === 0;
      return true;
    });
  }

  if (filters.specifications) {
    Object.entries(filters.specifications).forEach(([key, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter(p => {
          const productSpecVal = p.specifications[key];
          return productSpecVal && values.includes(productSpecVal);
        });
      }
    });
  }

  // 3. Sorting
  filtered.sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'relevance':
      default:
        // Simple relevance for now: exact matches on SKU or name start higher
        if (query) {
          const nq = normalizeString(query);
          const aExact = normalizeString(a.sku) === nq || normalizeString(a.name).startsWith(nq);
          const bExact = normalizeString(b.sku) === nq || normalizeString(b.name).startsWith(nq);
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
        }
        return 0;
    }
  });

  return filtered;
};
