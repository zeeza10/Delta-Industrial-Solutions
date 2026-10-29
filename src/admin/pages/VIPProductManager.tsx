/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, Brand } from '../../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { BRANDS } from '../../data/brands';
import { ProductFormModal } from '../components/catalog/ProductFormModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  Layers,
  Archive,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  CheckSquare,
  Square,
  Tag,
  DollarSign,
  History
} from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';
import { formatAdminCurrency } from '../utils/adminFormatters';
import { StockAdjustmentModal } from '../components/inventory/StockAdjustmentModal';

export const VIPProductManager: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'sku' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals & Selections
  const [selectedProductForInspect, setSelectedProductForInspect] = useState<Product | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productForStock, setProductForStock] = useState<Product | null>(null);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      setProducts(prodRes.products);
      setIsLive(prodRes.isLive);
      setCategories(catRes.categories);
    } catch (err) {
      console.error('[VIPProductManager] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Route-based Modals
  useEffect(() => {
    if (loading) return;

    if (location.pathname === '/admin/products/new') {
      setSelectedProductForEdit(null);
      setIsFormModalOpen(true);
    } else if (id) {
      const prod = products.find(p => p.id === id);
      if (prod) {
        if (location.pathname.endsWith('/edit')) {
          setSelectedProductForEdit(prod);
          setIsFormModalOpen(true);
        } else {
          setSelectedProductForInspect(prod);
        }
      }
    } else {
      setIsFormModalOpen(false);
      setSelectedProductForEdit(null);
      setSelectedProductForInspect(null);
    }
  }, [id, location.pathname, products, loading]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.brandId && p.brandId.toLowerCase().includes(term));
      
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = p.status === 'active' || p.isAvailable === true;
      else if (statusFilter === 'draft') matchesStatus = p.status === 'draft';
      else if (statusFilter === 'archived') matchesStatus = p.status === 'archived';

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (sortBy === 'price' || sortBy === 'stock') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Bulk Selection Handlers
  const handleSelectAllOnPage = () => {
    const pageIds = paginatedProducts.map(p => p.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (status: 'active' | 'draft' | 'archived') => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await productService.bulkUpdateStatus(selectedIds, status, user?.uid, user?.email || undefined);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      console.error('[VIPProductManager] Bulk status change error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await productService.bulkDeleteProducts(selectedIds, user?.uid, user?.email || undefined);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('[VIPProductManager] Bulk delete error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Single Action Handlers
  const handleArchive = async (product: Product) => {
    if (window.confirm(`Are you sure you want to archive SKU ${product.sku}? It will be hidden from the active storefront.`)) {
      setIsProcessing(true);
      try {
        await productService.archiveProduct(product.id, user?.uid, user?.email || undefined);
        await loadData();
      } catch (err) {
        console.error('[VIPProductManager] Archive error:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDeleteSingle = async () => {
    if (!productToDelete) return;
    setIsProcessing(true);
    try {
      await productService.deleteProduct(productToDelete.id, user?.uid, user?.email || undefined);
      setProductToDelete(null);
      await loadData();
    } catch (err) {
      console.error('[VIPProductManager] Delete error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenAddModal = () => {
    navigate('/admin/products/new');
  };

  const handleOpenEditModal = (product: Product) => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleCloseModal = () => {
    navigate('/admin/products');
  };

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  return (
    <div className="space-y-6 font-mono selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">CATALOG REGISTRY</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              {isLive ? 'LIVE FIRESTORE REGISTRY' : 'LOCAL CATALOG REPOSITORY'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Products & SKU Management</h1>
          <p className="text-xs text-slate-400">Supervise certified electrical inventory, technical specs, stock levels, and commercial pricing.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-slate-300 hover:text-white transition-colors"
            title="Refresh Catalog Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#22D3EE]' : ''}`} />
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors shadow-sm focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add SKU Item</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#273244] space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs w-full md:w-80 focus-within:border-[#22D3EE] transition-colors">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input 
                type="text"
                placeholder="Search SKU, name, or brand..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-slate-200 text-xs focus:border-[#22D3EE] outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-slate-200 text-xs focus:border-[#22D3EE] outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Sort:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-slate-200 text-xs focus:border-[#22D3EE] outline-none"
                >
                  <option value="updatedAt-desc">Recently Updated</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock-asc">Stock: Low to High</option>
                  <option value="stock-desc">Stock: High to Low</option>
                  <option value="sku-asc">SKU Code</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Action Controls Bar */}
          {selectedIds.length > 0 && (
            <div className="p-2.5 rounded-lg bg-[#18212D] border border-[#22D3EE]/40 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-[#22D3EE]/20 text-[#22D3EE] font-bold">
                  {selectedIds.length} Selected
                </span>
                <span className="text-slate-300">Bulk Actions:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 text-xs font-bold transition-colors"
                >
                  Set Active
                </button>
                <button
                  onClick={() => handleBulkStatusChange('draft')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 text-xs font-bold transition-colors"
                >
                  Set Draft
                </button>
                <button
                  onClick={() => handleBulkStatusChange('archived')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 text-xs font-bold transition-colors"
                >
                  Archive
                </button>
                <button
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900/60 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected</span>
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-slate-400 hover:text-white px-2"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-4 py-3.5 w-10 text-center">
                  <button
                    onClick={handleSelectAllOnPage}
                    className="text-slate-400 hover:text-[#22D3EE]"
                    title="Select/Deselect page items"
                  >
                    {paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id)) ? (
                      <CheckSquare className="w-4 h-4 text-[#22D3EE]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Product Name & OEM</th>
                <th className="px-4 py-3.5">SKU Code</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Benchmark Price</th>
                <th className="px-4 py-3.5">In Stock</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-8 bg-[#18212D] rounded"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No SKU products found matching the query criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const isLowStock = product.stock <= (product.lowStockThreshold || 5);
                  const categoryName = categoryMap[product.categoryId] || product.categoryId;

                  return (
                    <tr 
                      key={product.id} 
                      className={`transition-colors ${isSelected ? 'bg-[#18212D]' : 'hover:bg-[#18212D]/70'}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleSelect(product.id)}
                          className="text-slate-400 hover:text-[#22D3EE]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#22D3EE]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-[#090B10] border border-[#273244] flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={16} className="text-slate-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-100 truncate max-w-[220px]">{product.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{product.brandId || 'Generic'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-[#22D3EE] font-bold">{product.sku}</td>

                      <td className="px-4 py-3 text-slate-300 capitalize">{categoryName}</td>

                      <td className="px-4 py-3 font-bold text-emerald-400">
                        {product.price ? formatAdminCurrency(product.price) : 'Quote Only'}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${isLowStock ? 'text-amber-400' : 'text-slate-200'}`}>
                          {product.stock} {product.unitOfMeasure || 'units'}
                        </span>
                        {isLowStock && (
                          <span className="block text-[9px] text-amber-400 uppercase tracking-widest font-bold">
                            Low Stock
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {product.status === 'active' || (product.isAvailable && product.status !== 'archived') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : product.status === 'archived' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-500/30">
                            <Archive size={12} /> Archived
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-600/40">
                            <XCircle size={12} /> Draft
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => navigate(`/admin/products/${product.id}`)}
                            className="p-1.5 rounded bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-slate-300 hover:text-[#22D3EE] text-xs transition-colors"
                            title="Inspect Specification Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            onClick={() => setProductForStock(product)}
                            className="p-1.5 rounded bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-slate-300 hover:text-[#22D3EE] text-xs transition-colors"
                            title="Manage Inventory"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-slate-300 hover:text-[#22D3EE] text-xs transition-colors"
                            title="Edit Product SKU"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {product.status !== 'archived' && (
                            <button 
                              onClick={() => handleArchive(product)}
                              className="p-1.5 rounded bg-[#18212D] border border-[#273244] hover:border-amber-500/50 text-slate-400 hover:text-amber-400 text-xs transition-colors"
                              title="Archive SKU"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button 
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 rounded bg-[#18212D] border border-[#273244] hover:border-red-500/50 text-slate-400 hover:text-red-400 text-xs transition-colors"
                            title="Delete SKU"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-[#273244] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 bg-[#0D1118]">
          <div className="flex items-center gap-3">
            <span>Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 rounded bg-[#121823] border border-[#273244] text-slate-200 outline-none"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-[#121823] border border-[#273244] text-slate-300 disabled:opacity-40 hover:border-[#22D3EE]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-[#121823] border border-[#273244] text-slate-300 disabled:opacity-40 hover:border-[#22D3EE]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <ProductFormModal
          product={selectedProductForEdit}
          categories={categories}
          brands={BRANDS}
          onClose={handleCloseModal}
          onSaveSuccess={() => {
            handleCloseModal();
            loadData();
          }}
        />
      )}

      {/* Product Inspection Modal */}
      {selectedProductForInspect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#22D3EE]" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">SKU Specification Record</h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedProductForInspect.images?.[0] && (
                <div className="aspect-video bg-[#0D1118] rounded-lg border border-[#273244] overflow-hidden mb-3">
                  <img src={selectedProductForInspect.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Product Name</span>
                <span className="text-slate-100 font-bold max-w-[260px] text-right">{selectedProductForInspect.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">SKU Code</span>
                <span className="text-[#22D3EE] font-bold font-mono">{selectedProductForInspect.sku}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">OEM Manufacturer</span>
                <span className="text-slate-200">{selectedProductForInspect.brandId || 'Generic'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Taxonomy Category</span>
                <span className="text-slate-200 capitalize">{categoryMap[selectedProductForInspect.categoryId] || selectedProductForInspect.categoryId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Unit Benchmark Price</span>
                <span className="text-emerald-400 font-bold">{selectedProductForInspect.price ? formatAdminCurrency(selectedProductForInspect.price) : 'Quote Only'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Available Stock</span>
                <span className="text-slate-200">{selectedProductForInspect.stock} {selectedProductForInspect.unitOfMeasure || 'units'}</span>
              </div>
              {selectedProductForInspect.seoTitle && (
                <div className="flex justify-between py-1 border-b border-[#273244]/50">
                  <span className="text-slate-400">SEO Title</span>
                  <span className="text-slate-300 font-sans">{selectedProductForInspect.seoTitle}</span>
                </div>
              )}

              {selectedProductForInspect.specifications && Object.keys(selectedProductForInspect.specifications).length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Technical Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#090B10] border border-[#273244]">
                    {Object.entries(selectedProductForInspect.specifications).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-[10px] text-slate-400 block capitalize">{key}</span>
                        <span className="text-slate-200 font-mono text-xs">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleOpenEditModal(selectedProductForInspect);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#22D3EE] text-slate-950 font-bold text-xs"
              >
                Edit Specification
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-1.5 rounded-lg bg-[#18212D] border border-[#273244] hover:bg-[#1E293B] text-slate-200 text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-red-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Confirm Permanent Deletion</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete product SKU <strong className="text-[#22D3EE]">{productToDelete.sku}</strong> ({productToDelete.name})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-3.5 py-1.5 rounded bg-[#18212D] border border-[#273244] text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSingle}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase"
              >
                {isProcessing ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-red-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Bulk Delete Products</h3>
            </div>
            <p className="text-xs text-slate-300">
              You are about to permanently delete <strong className="text-red-400">{selectedIds.length}</strong> selected catalog products. Are you sure?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-3.5 py-1.5 rounded bg-[#18212D] border border-[#273244] text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase"
              >
                {isProcessing ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {productForStock && (
        <StockAdjustmentModal
          product={productForStock}
          onClose={() => setProductForStock(null)}
          onSuccess={() => {
            setProductForStock(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

