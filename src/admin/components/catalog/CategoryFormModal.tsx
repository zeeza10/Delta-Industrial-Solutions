/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Category Taxonomy Form Modal
 * Category creator and editor with circular parent dependency prevention, slug validation, and Media Library integration
 */

import React, { useState, useEffect } from 'react';
import { Category } from '../../../types';
import { categoryService } from '../../services/categoryService';
import { MediaLibrary } from '../../pages/cms/MediaLibrary';
import { useAuth } from '../../../context/AuthContext';
import { 
  Layers, 
  X, 
  Save, 
  Image as ImageIcon, 
  AlertCircle, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

interface CategoryFormModalProps {
  category?: Category | null;
  allCategories: Category[];
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  allCategories,
  onClose,
  onSaveSuccess,
}) => {
  const { user } = useAuth();
  const isEditMode = Boolean(category);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [sortOrder, setSortOrder] = useState<number>(1);

  // Modals & UI States
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setDescription(category.description || '');
      setParentId(category.parentId || '');
      setImage(category.image || '');
      setStatus(category.status || 'active');
      setSortOrder(category.sortOrder || 1);
    }
  }, [category]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode || !slug) {
      setSlug(categoryService.generateSlug(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    if (!slug.trim()) {
      setErrorMessage('Category slug is required.');
      return;
    }

    // Circular Parent Check
    if (isEditMode && category && parentId) {
      if (categoryService.isCircularParent(category.id, parentId, allCategories)) {
        setErrorMessage('Cannot select parent category: circular dependency detected.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const payload = {
        name: name.trim(),
        slug: categoryService.generateSlug(slug || name),
        description: description.trim(),
        parentId: parentId || undefined,
        image,
        status,
        sortOrder: Number(sortOrder),
      };

      if (isEditMode && category) {
        await categoryService.updateCategory(
          category.id,
          payload,
          allCategories,
          user?.uid,
          user?.email || undefined
        );
      } else {
        await categoryService.createCategory(
          payload,
          user?.uid,
          user?.email || undefined
        );
      }

      onSaveSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  // Available parent options (exclude self)
  const availableParents = allCategories.filter(c => !category || c.id !== category.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
      <div className="bg-[#121823] border border-[#273244] rounded-2xl max-w-lg w-full font-mono text-slate-100 shadow-2xl overflow-hidden space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#273244] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              {isEditMode ? `Edit Category: ${category?.name}` : 'New Category Taxonomy'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded bg-[#18212D] border border-[#273244]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name & Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. High-Voltage Power Cables"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              URL Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="high-voltage-power-cables"
              value={slug}
              onChange={e => setSlug(categoryService.generateSlug(e.target.value))}
              className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-[#22D3EE] font-mono focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          {/* Parent & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Parent Taxonomy
              </label>
              <select
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="">None (Top-Level Category)</option>
                {availableParents.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Short taxonomy summary..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          {/* Image Field with Media Picker */}
          <div className="space-y-2 p-3 bg-[#0D1118] border border-[#273244] rounded-xl">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Category Image</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Image URL..."
                value={image}
                onChange={e => setImage(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#121823] border border-[#273244] rounded text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
              />
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-2.5 py-1.5 bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs font-bold text-[#22D3EE] rounded whitespace-nowrap"
              >
                Pick Media
              </button>
            </div>
            {image && (
              <img src={image} alt="Category" className="w-full h-24 object-cover rounded border border-[#273244] mt-2" />
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-[#273244]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#18212D] text-xs text-slate-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs uppercase rounded flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </div>

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <MediaLibrary
              isModal={true}
              onSelectMedia={(asset) => {
                setImage(asset.downloadURL || asset.url);
                setIsMediaPickerOpen(false);
              }}
              onCloseModal={() => setIsMediaPickerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
