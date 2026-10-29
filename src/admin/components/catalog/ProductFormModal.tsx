/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Product Form Modal / Drawer
 * Full specification editor supporting SKU uniqueness, pricing, stock levels, images with Media Library picker, and SEO fields
 */

import React, { useState, useEffect } from 'react';
import { Product, Category, Brand } from '../../../types';
import { productService } from '../../services/productService';
import { MediaLibrary } from '../../pages/cms/MediaLibrary';
import { useAuth } from '../../../context/AuthContext';
import { 
  Package, 
  X, 
  Save, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Trash2, 
  Globe, 
  DollarSign, 
  Layers, 
  Tag, 
  ShieldCheck,
  Star
} from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  brands,
  onClose,
  onSaveSuccess,
}) => {
  const { user, isOwner, isAdmin } = useAuth();
  const isEditMode = Boolean(product);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [unitOfMeasure, setUnitOfMeasure] = useState('unit');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [trackInventory, setTrackInventory] = useState(true);

  // Modals & UI States
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing product
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setSlug(product.slug || '');
      setDescription(product.description || '');
      setCategoryId(product.categoryId || (categories[0]?.id || ''));
      setBrandId(product.brandId || (brands[0]?.id || ''));
      setPrice(product.price !== undefined ? product.price : '');
      setCostPrice(product.costPrice !== undefined ? product.costPrice : '');
      setStock(product.stock !== undefined ? product.stock : 0);
      setTrackInventory(product.trackInventory !== undefined ? product.trackInventory : true);
      setLowStockThreshold(product.lowStockThreshold || 5);
      setUnitOfMeasure(product.unitOfMeasure || 'unit');
      setStatus(product.status || (product.isAvailable ? 'active' : 'draft'));
      setImages(product.images || []);
      setSeoTitle(product.seoTitle || '');
      setSeoDescription(product.seoDescription || '');
    } else {
      if (categories.length > 0) setCategoryId(categories[0].id);
      if (brands.length > 0) setBrandId(brands[0].id);
    }
  }, [product, categories, brands]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode || !slug) {
      setSlug(productService.generateSlug(val));
    }
    if (!seoTitle) setSeoTitle(val);
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }

    if (!sku.trim()) {
      setErrorMessage('SKU code is required.');
      return;
    }

    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      setErrorMessage('Please enter a valid non-negative benchmark price.');
      return;
    }

    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
      setErrorMessage('Please enter a valid stock quantity.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select a valid catalog category.');
      return;
    }

    setIsSaving(true);

    try {
      const productPayload: any = {
        name: name.trim(),
        sku: sku.toUpperCase().trim(),
        slug: productService.generateSlug(slug || name),
        description: description.trim(),
        categoryId,
        brandId: brandId || 'Generic',
        price: Number(price),
        currency: 'USD',
        stock: Number(stock),
        trackInventory,
        lowStockThreshold: Number(lowStockThreshold),
        unitOfMeasure,
        status,
        isAvailable: status === 'active',
        images,
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        tags: [categoryId, brandId, unitOfMeasure].filter(Boolean),
        specifications: product?.specifications || {
          'Standard': 'IEC Certified',
          'Unit': unitOfMeasure,
        },
      };

      // Only include costPrice if user is authorized and it has a value
      if (isOwner || (isAdmin && costPrice !== '')) {
        productPayload.costPrice = Number(costPrice);
      }

      if (isEditMode && product) {
        await productService.updateProduct(
          product.id,
          productPayload,
          user?.uid,
          user?.email || undefined
        );
      } else {
        await productService.createProduct(
          productPayload,
          user?.uid,
          user?.email || undefined
        );
      }

      onSaveSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save product specification.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
      <div className="bg-[#121823] border border-[#273244] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col font-mono text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#273244] flex items-center justify-between shrink-0 bg-[#0D1118]">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              {isEditMode ? `Edit Specification: ${product?.sku}` : 'Add New Product SKU'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded bg-[#18212D] border border-[#273244]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Core Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 15kV Armored XLPE Copper Power Cable"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22D3EE]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                SKU / Product Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CBL-15KV-3C240"
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-[#22D3EE] font-bold focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
          </div>

          {/* Taxonomies Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Taxonomy Category <span className="text-red-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                OEM Manufacturer / Brand
              </label>
              <select
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="Generic">Generic / Direct Import</option>
                {brands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Commercial Pricing & Inventory Row */}
          <div className="p-4 bg-[#0D1118] border border-[#273244] rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Commercial Pricing & Inventory Controls</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Unit Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#121823] border border-[#273244] rounded text-xs font-bold text-emerald-400 focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              {(isOwner || isAdmin) && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-red-400">Cost Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={e => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#121823] border border-[#273244] rounded text-xs font-bold text-red-300 focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                  value={stock}
                  onChange={e => setStock(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#121823] border border-[#273244] rounded text-xs text-slate-100 focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Low-Stock Alert</label>
                <input
                  type="number"
                  min="0"
                  placeholder="5"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#121823] border border-[#273244] rounded text-xs text-amber-300 focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Unit of Measure</label>
                <select
                  value={unitOfMeasure}
                  onChange={e => setUnitOfMeasure(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#121823] border border-[#273244] rounded text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
                >
                  <option value="meter">Meter (m)</option>
                  <option value="unit">Unit / Piece</option>
                  <option value="box">Box / Pack</option>
                  <option value="spool">Spool / Reel</option>
                  <option value="kilogram">Kilogram (kg)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={trackInventory}
                  onChange={e => setTrackInventory(e.target.checked)}
                  className="w-4 h-4 rounded border-[#273244] bg-[#0D1118] text-[#22D3EE] focus:ring-[#22D3EE]/20"
                />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-200 transition-colors">
                  Track Inventory Levels
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-[#273244] bg-[#0D1118] text-[#22D3EE] focus:ring-[#22D3EE]/20"
                />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-200 transition-colors">
                  Featured Product
                </span>
              </label>
            </div>
          </div>

          {/* Status & Featured Toggle Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Catalog Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="active">Active (Visible on Storefront)</option>
                <option value="draft">Draft (Hidden from Catalog)</option>
                <option value="archived">Archived (Discontinued)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                URL Slug
              </label>
              <input
                type="text"
                placeholder="15kv-armored-power-cable"
                value={slug}
                onChange={e => setSlug(productService.generateSlug(e.target.value))}
                className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-300 font-mono focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
          </div>

          {/* SEO & Meta Section */}
          <div className="p-4 bg-[#0D1118] border border-[#273244] rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Search Engine Optimization (SEO)</span>
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">SEO Meta Title</label>
                <input
                  type="text"
                  placeholder="Custom browser title..."
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121823] border border-[#273244] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">SEO Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary for search results..."
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121823] border border-[#273244] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#22D3EE]"
                />
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Technical Description
            </label>
            <textarea
              rows={4}
              placeholder="Engineering specifications, voltage ratings, conductor sizing, and application guidelines..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          {/* Product Image Gallery Management */}
          <div className="space-y-3 p-4 bg-[#0D1118] border border-[#273244] rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#22D3EE]" />
                <span>Product Images ({images.length})</span>
              </label>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-2.5 py-1 bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-[11px] font-bold text-[#22D3EE] rounded flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Select from Media Library</span>
              </button>
            </div>

            {/* Existing Image Thumbnails */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-square bg-[#121823] rounded-lg overflow-hidden border border-[#273244] group">
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1 bg-[#22D3EE] text-slate-950 font-extrabold text-[8px] uppercase rounded">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="p-1 bg-[#18212D] text-[#22D3EE] rounded text-[9px]"
                          title="Set Primary Image"
                        >
                          Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 bg-red-950 text-red-300 rounded"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Direct Image URL input */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Or paste direct image URL (https://...)"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#121823] border border-[#273244] rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs font-bold text-slate-200 rounded"
              >
                Add Image
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-[#273244]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#18212D] border border-[#273244] hover:bg-[#1E293B] text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isEditMode ? 'Save Changes' : 'Create Product SKU'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Media Library Modal Picker */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <MediaLibrary
              isModal={true}
              onSelectMedia={(asset) => {
                setImages(prev => [...prev, asset.downloadURL || asset.url]);
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
