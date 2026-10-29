/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Product } from '../../types';
import { PRODUCTS as demoProducts } from '../../data/products';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Package, 
  Eye, 
  X,
  Layers
} from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';
import { formatAdminCurrency } from '../utils/adminFormatters';

export const VIPProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromFirestore, setIsFromFirestore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!db) {
        setProducts(demoProducts);
        setIsFromFirestore(false);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Product[];
        
        if (fetched.length > 0) {
          setProducts(fetched);
          setIsFromFirestore(true);
        } else {
          setProducts(demoProducts);
          setIsFromFirestore(false);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
        setProducts(demoProducts);
        setIsFromFirestore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = Array.from(new Set(products.map(p => p.categoryId)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brandId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">CATALOG REGISTRY</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              {isFromFirestore ? 'LIVE FIRESTORE REGISTRY' : 'LOCAL CATALOG REPOSITORY'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Products & SKU Management</h1>
          <p className="text-xs text-slate-400">Supervise certified electrical inventory, specs, stock quantities, and availability.</p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors shadow-sm focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add SKU Item</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#273244] flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs w-full md:w-80 focus-within:border-[#22D3EE] transition-colors">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input 
              type="text"
              placeholder="Search by SKU, name, or OEM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-slate-200 text-xs focus:border-[#22D3EE] outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap pl-2">
              {filteredProducts.length} items
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-4 py-3.5">Product & Brand</th>
                <th className="px-4 py-3.5">SKU ID</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price (USD)</th>
                <th className="px-4 py-3.5">In Stock</th>
                <th className="px-4 py-3.5">Availability</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-8 bg-[#18212D] rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No products found matching query.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#18212D]/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-[#18212D] border border-[#273244] flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-100 truncate max-w-[220px]">{product.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{product.brandId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300 font-bold">{product.sku}</td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{product.categoryId}</td>
                    <td className="px-4 py-3 font-bold text-slate-100">
                      {product.price ? formatAdminCurrency(product.price) : 'Contact'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{product.stock}</td>
                    <td className="px-4 py-3">
                      {product.isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                          <CheckCircle2 size={13} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-semibold">
                          <XCircle size={13} /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="px-2.5 py-1 rounded bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-slate-300 hover:text-[#22D3EE] text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Inspection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#22D3EE]" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">SKU Specification Record</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Product Name</span>
                <span className="text-slate-100 font-bold max-w-[260px] text-right">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">SKU Code</span>
                <span className="text-[#22D3EE] font-bold font-mono">{selectedProduct.sku}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">OEM Manufacturer</span>
                <span className="text-slate-200">{selectedProduct.brandId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Taxonomy Category</span>
                <span className="text-slate-200 capitalize">{selectedProduct.categoryId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Unit Benchmark Price</span>
                <span className="text-emerald-400 font-bold">{selectedProduct.price ? formatAdminCurrency(selectedProduct.price) : 'Quote Only'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Available Stock</span>
                <span className="text-slate-200">{selectedProduct.stock} units</span>
              </div>

              {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Technical Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#090B10] border border-[#273244]">
                    {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-[10px] text-slate-400 block capitalize">{key}</span>
                        <span className="text-slate-200 font-mono text-xs">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-1.5 rounded-lg bg-[#18212D] border border-[#273244] hover:bg-[#1E293B] text-slate-200 text-xs transition-colors"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
