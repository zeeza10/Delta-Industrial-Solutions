/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Plus, Search, ChevronDown, ChevronRight, CheckCircle2, XCircle, Edit, Trash2, RefreshCw, AlertTriangle, Package, Image as ImageIcon } from 'lucide-react';
import { Category } from '../../types';
import { categoryService } from '../services/categoryService';
import { CategoryFormModal } from '../components/catalog/CategoryFormModal';
import { useAuth } from '../../context/AuthContext';
import { AdminBadge } from '../components/common/AdminBadge';

export const VIPCategoryManager: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null);
  
  // Delete Safety Guard State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [assignedProductCount, setAssignedProductCount] = useState<number | null>(null);
  const [isCheckingCount, setIsCheckingCount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.categories);
      setIsLive(res.isLive);
    } catch (err) {
      console.error('[VIPCategoryManager] Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const toggleExpand = (catId: string) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleOpenAdd = () => {
    setSelectedCategoryForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategoryForEdit(category);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteConfirm = async (category: Category) => {
    setCategoryToDelete(category);
    setIsCheckingCount(true);
    try {
      const count = await categoryService.getCategoryProductCount(category.id);
      setAssignedProductCount(count);
    } catch (err) {
      console.error('[VIPCategoryManager] Error checking product count:', err);
      setAssignedProductCount(0);
    } finally {
      setIsCheckingCount(false);
    }
  };

  const handleDeleteExecute = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id, true, user?.uid, user?.email || undefined);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Top-level categories & hierarchy organization
  const { topLevelCategories, subcategoryMap } = useMemo(() => {
    const top: Category[] = [];
    const subsMap: Record<string, Category[]> = {};

    categories.forEach(c => {
      if (!c.parentId) {
        top.push(c);
      } else {
        if (!subsMap[c.parentId]) subsMap[c.parentId] = [];
        subsMap[c.parentId].push(c);
      }
    });

    return { topLevelCategories: top, subcategoryMap: subsMap };
  }, [categories]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return topLevelCategories;
    const term = searchTerm.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term)
    );
  }, [categories, topLevelCategories, searchTerm]);

  return (
    <div className="space-y-6 font-mono selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">TAXONOMY MATRIX</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              {isLive ? 'LIVE FIRESTORE TAXONOMIES' : 'OFFICIAL SYSTEM TAXONOMY'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Product Categories & Hierarchies</h1>
          <p className="text-xs text-slate-400">Structured industrial electrical taxonomies and multi-tier subcategory trees with product dependency safety guards.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCategories}
            disabled={loading}
            className="p-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-slate-300 hover:text-white transition-colors"
            title="Refresh Taxonomies"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#22D3EE]' : ''}`} />
          </button>
          <button 
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors shadow-sm focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        <div className="p-4 border-b border-[#273244] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs w-full sm:max-w-md focus-within:border-[#22D3EE] transition-colors">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search taxonomies by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
            />
          </div>
          <span className="text-xs text-slate-400 hidden sm:block whitespace-nowrap">
            {categories.length} Total Classifications
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-5 py-3.5">Slug ID</th>
                <th className="px-5 py-3.5">Subcategories</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-7 bg-[#18212D] rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    No taxonomy categories found.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => {
                  const isExpanded = !!expandedCats[cat.id];
                  const childCategories = subcategoryMap[cat.id] || cat.subcategories || [];
                  const subCount = childCategories.length;

                  return (
                    <React.Fragment key={cat.id}>
                      <tr className="hover:bg-[#18212D]/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-100 flex items-center gap-2">
                            {subCount > 0 ? (
                              <button
                                onClick={() => toggleExpand(cat.id)}
                                className="p-1 hover:text-[#22D3EE] transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded"
                                aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                              >
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#22D3EE]" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            ) : (
                              <div className="w-5" />
                            )}
                            {cat.image ? (
                              <img src={cat.image} alt="" className="w-6 h-6 rounded object-cover border border-[#273244] shrink-0" />
                            ) : (
                              <Layers className="w-4 h-4 text-[#22D3EE] shrink-0" />
                            )}
                            <span className="truncate max-w-[220px]">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">{cat.slug}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded bg-[#18212D] border border-[#273244] text-[#22D3EE] text-[10px] font-bold">
                            {subCount} subcategories
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {cat.status === 'inactive' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-600/40">
                              <XCircle className="w-3 h-3" />
                              <span>Inactive</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 rounded bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-slate-300 hover:text-[#22D3EE] transition-colors"
                              title="Edit Category"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteConfirm(cat)}
                              className="p-1.5 rounded bg-[#18212D] border border-[#273244] hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Subcategories expansion row */}
                      {isExpanded && subCount > 0 && (
                        <tr className="bg-[#090B10]/80 border-b border-[#273244]/80">
                          <td colSpan={5} className="px-8 py-3">
                            <div className="space-y-1.5 pl-6 border-l-2 border-[#22D3EE]/30">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                Subcategories ({subCount})
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {childCategories.map((sub: any) => (
                                  <div key={sub.id || sub.slug} className="p-2.5 rounded-lg bg-[#121823] border border-[#273244] flex items-center justify-between text-xs">
                                    <div>
                                      <span className="text-slate-200 font-bold block">{sub.name}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">{sub.slug}</span>
                                    </div>
                                    <button
                                      onClick={() => handleOpenEdit(sub as Category)}
                                      className="p-1 text-slate-400 hover:text-[#22D3EE]"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <CategoryFormModal
          category={selectedCategoryForEdit}
          allCategories={categories}
          onClose={() => { setIsFormModalOpen(false); setSelectedCategoryForEdit(null); }}
          onSaveSuccess={() => {
            setIsFormModalOpen(false);
            setSelectedCategoryForEdit(null);
            loadCategories();
          }}
        />
      )}

      {/* Delete Category Safety Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
          <div className="bg-[#121823] border border-red-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Confirm Category Deletion</h3>
            </div>

            <p className="text-xs text-slate-300">
              Deleting category <strong className="text-[#22D3EE]">{categoryToDelete.name}</strong> ({categoryToDelete.slug}).
            </p>

            {isCheckingCount ? (
              <div className="p-3 rounded bg-[#090B10] border border-[#273244] text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#22D3EE]" />
                <span>Auditing active catalog product dependencies...</span>
              </div>
            ) : assignedProductCount && assignedProductCount > 0 ? (
              <div className="p-3 rounded bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Package className="w-4 h-4 shrink-0" />
                  <span>Dependency Guard Block</span>
                </div>
                <p>
                  <strong>{assignedProductCount}</strong> products in the catalog are currently assigned to this category. You cannot delete this category until those products are reassigned or deleted.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                Safety audit passed. No catalog products are currently assigned to this category.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#273244]">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-3.5 py-1.5 rounded bg-[#18212D] border border-[#273244] text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExecute}
                disabled={Boolean(assignedProductCount && assignedProductCount > 0) || isCheckingCount || isDeleting}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase disabled:opacity-40 disabled:hover:bg-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

