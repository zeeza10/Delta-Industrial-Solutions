/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Media Library Page & Selection Modal
 * File uploader with validation, upload progress, preview modal, search/filter, and copy-URL functionality
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MediaAsset, MAX_MEDIA_UPLOAD_SIZE_MB, ALLOWED_MEDIA_TYPES } from '../../types/cms.types';
import { mediaService } from '../../services/mediaService';
import { useAuth } from '../../../context/AuthContext';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Grid, 
  List, 
  FileText, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  X,
  Filter,
  Eye,
  Database
} from 'lucide-react';

interface MediaLibraryProps {
  isModal?: boolean;
  onSelectMedia?: (asset: MediaAsset) => void;
  onCloseModal?: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  isModal = false,
  onSelectMedia,
  onCloseModal,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Uploading states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Preview & Delete Modals
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isStorageActive = mediaService.isStorageConfigured();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getMediaAssets();
      setAssets(data);
    } catch (err: any) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      const fileType = item.contentType || item.fileType || '';
      const matchesSearch = 
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesType = true;
      if (typeFilter === 'svg') matchesType = fileType.includes('svg');
      else if (typeFilter === 'png') matchesType = fileType.includes('png');
      else if (typeFilter === 'jpg') matchesType = fileType.includes('jpeg') || fileType.includes('jpg');
      else if (typeFilter === 'webp') matchesType = fileType.includes('webp');

      return matchesSearch && matchesType;
    });
  }, [assets, searchQuery, typeFilter]);

  // Handle File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError(null);
    setUploadSuccess(null);

    // Validate file
    const validation = mediaService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const newAsset = await mediaService.uploadMediaFile(
        file,
        percent => setUploadProgress(percent),
        user?.uid,
        user?.email || undefined
      );

      setAssets(prev => [newAsset, ...prev]);
      setUploadSuccess(`Successfully uploaded ${file.name}!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload media file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Drag and Drop Zone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validation = mediaService.validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file.');
        return;
      }
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        handleFileChange({ target: fileInputRef.current } as any);
      }
    }
  };

  // Copy URL to Clipboard
  const handleCopyUrl = (asset: MediaAsset) => {
    const targetUrl = asset.downloadURL || asset.url;
    navigator.clipboard.writeText(targetUrl);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete Media
  const handleDeleteConfirm = async () => {
    if (!deletingAsset) return;
    try {
      await mediaService.deleteMediaAsset(deletingAsset, user?.uid, user?.email || undefined);
      setAssets(prev => prev.filter(a => a.id !== deletingAsset.id));
      setDeletingAsset(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`font-mono text-slate-100 ${isModal ? 'p-2 space-y-4' : 'space-y-6'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#22D3EE]" />
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-100">
              Media Library & Asset Storage
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Central repository for industrial imagery, catalog banners, and technical diagrams (Max {MAX_MEDIA_UPLOAD_SIZE_MB}MB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border flex items-center gap-1.5 ${
            isStorageActive 
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
          }`}>
            <Database className="w-3 h-3" />
            <span>{isStorageActive ? 'FIREBASE STORAGE ACTIVE' : 'LOCAL FALLBACK MODE'}</span>
          </span>

          {isModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-1.5 text-slate-400 hover:text-white rounded bg-[#18212D] border border-[#273244]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className="bg-[#121823] border-2 border-dashed border-[#273244] hover:border-[#22D3EE]/60 rounded-xl p-5 text-center space-y-3 transition-colors relative"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MEDIA_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
          id="media-file-upload-input"
        />

        <div className="flex justify-center text-[#22D3EE]">
          <Upload className="w-8 h-8 stroke-1" />
        </div>

        <div>
          <p className="text-xs font-bold text-slate-200">
            Drag & Drop image files here, or{' '}
            <label
              htmlFor="media-file-upload-input"
              className="text-[#22D3EE] underline cursor-pointer hover:text-cyan-300"
            >
              browse from computer
            </label>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Allowed formats: <span className="text-slate-300 font-bold">JPG, JPEG, PNG, WebP, SVG</span> • Max File Size: <span className="text-slate-300 font-bold">{MAX_MEDIA_UPLOAD_SIZE_MB}MB</span>
          </p>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="max-w-xs mx-auto space-y-1.5 pt-2">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>Uploading asset to storage...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#0D1118] rounded-full overflow-hidden border border-[#273244]">
              <div
                className="h-full bg-[#22D3EE] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Feedback Banners */}
        {uploadError && (
          <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>

      {/* Search, Filter & View Mode Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121823] p-3 rounded-xl border border-[#273244]">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media by filename..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
          />
        </div>

        {/* Filter & View Mode */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Format Filter */}
          <div className="flex items-center bg-[#0D1118] p-0.5 rounded-lg border border-[#273244] text-[10px]">
            {['all', 'jpg', 'png', 'webp', 'svg'].map(fmt => (
              <button
                key={fmt}
                onClick={() => setTypeFilter(fmt)}
                className={`px-2 py-1 rounded uppercase font-bold transition-colors ${
                  typeFilter === fmt
                    ? 'bg-[#22D3EE] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Grid vs List View */}
          <div className="flex items-center bg-[#0D1118] p-0.5 rounded-lg border border-[#273244]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#22D3EE] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#22D3EE] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid / List View */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#22D3EE]" />
          <span>Syncing Media Library...</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-12 text-center bg-[#121823] border border-[#273244] rounded-xl text-xs text-slate-400 space-y-2">
          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
          <p className="font-bold text-slate-300">No media assets found</p>
          <p className="text-[11px] text-slate-500">
            {searchQuery || typeFilter !== 'all' ? 'Try adjusting your search query or file type filter.' : 'Upload your first image to populate the media library.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map(asset => {
            const assetUrl = asset.downloadURL || asset.url;
            const assetType = asset.contentType || asset.fileType || 'IMAGE';
            const assetSize = asset.size || asset.fileSize || 0;

            return (
              <div
                key={asset.id}
                className="bg-[#121823] border border-[#273244] hover:border-[#22D3EE]/50 rounded-xl overflow-hidden group shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-[#0D1118] overflow-hidden flex items-center justify-center">
                  <img
                    src={assetUrl}
                    alt={asset.altText || asset.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay Quick Actions */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {isModal && onSelectMedia ? (
                      <button
                        onClick={() => onSelectMedia(asset)}
                        className="px-2.5 py-1 bg-[#22D3EE] text-slate-950 font-bold text-[10px] uppercase rounded shadow"
                      >
                        Select Asset
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="p-1.5 bg-[#18212D] text-slate-200 hover:text-[#22D3EE] rounded border border-[#273244]"
                          title="Preview Asset"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyUrl(asset)}
                          className="p-1.5 bg-[#18212D] text-slate-200 hover:text-[#22D3EE] rounded border border-[#273244]"
                          title="Copy Asset URL"
                        >
                          {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeletingAsset(asset)}
                          className="p-1.5 bg-red-950/80 text-red-300 hover:text-red-100 rounded border border-red-500/30"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-2.5 border-t border-[#273244] bg-[#0D1118]">
                  <p className="text-[11px] font-bold text-slate-200 truncate" title={asset.fileName}>
                    {asset.fileName}
                  </p>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
                    <span className="uppercase">{assetType.split('/')[1] || 'IMAGE'}</span>
                    <span>{formatFileSize(assetSize)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-[#121823] border border-[#273244] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0D1118] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Uploaded Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-slate-300">
              {filteredAssets.map(asset => {
                const assetUrl = asset.downloadURL || asset.url;
                const assetType = asset.contentType || asset.fileType || 'image/jpeg';
                const assetSize = asset.size || asset.fileSize || 0;
                const dateStr = asset.uploadedAt || asset.createdAt || new Date().toISOString();

                return (
                  <tr key={asset.id} className="hover:bg-[#18212D]/60 transition-colors">
                    <td className="px-4 py-2">
                      <img src={assetUrl} alt={asset.fileName} className="w-10 h-10 object-cover rounded border border-[#273244]" />
                    </td>
                    <td className="px-4 py-2 font-bold text-slate-200">{asset.fileName}</td>
                    <td className="px-4 py-2 uppercase text-[10px] text-slate-400">{assetType}</td>
                    <td className="px-4 py-2 text-slate-400">{formatFileSize(assetSize)}</td>
                    <td className="px-4 py-2 text-slate-400">{new Date(dateStr).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        {isModal && onSelectMedia ? (
                          <button
                            onClick={() => onSelectMedia(asset)}
                            className="px-2 py-1 bg-[#22D3EE] text-slate-950 font-bold text-[10px] uppercase rounded"
                          >
                            Select
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleCopyUrl(asset)}
                              className="p-1 text-slate-400 hover:text-[#22D3EE]"
                              title="Copy URL"
                            >
                              {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setDeletingAsset(asset)}
                              className="p-1 text-slate-400 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-2xl p-5 max-w-xl w-full space-y-4 font-mono relative">
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-100 uppercase pr-8 truncate">
              {previewAsset.fileName}
            </h3>
            <div className="max-h-80 bg-[#0D1118] rounded-xl overflow-hidden flex items-center justify-center border border-[#273244]">
              <img src={previewAsset.downloadURL || previewAsset.url} alt={previewAsset.fileName} className="max-h-80 object-contain" />
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>Storage Path: <span className="text-[#22D3EE] font-mono">{previewAsset.storagePath || 'N/A'}</span></div>
              <div>Type: <span className="text-slate-200 font-bold">{previewAsset.contentType || previewAsset.fileType}</span></div>
              <div>Size: <span className="text-slate-200 font-bold">{formatFileSize(previewAsset.size || previewAsset.fileSize)}</span></div>
              <div>Uploaded: <span className="text-slate-200 font-bold">{new Date(previewAsset.uploadedAt || previewAsset.createdAt || new Date()).toLocaleString()}</span></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#273244]">
              <button
                onClick={() => handleCopyUrl(previewAsset)}
                className="px-3 py-1.5 bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs font-bold text-slate-200 rounded flex items-center gap-1.5"
              >
                {copiedId === previewAsset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#22D3EE]" />}
                <span>{copiedId === previewAsset.id ? 'Copied!' : 'Copy Asset URL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-red-500/40 rounded-2xl p-5 max-w-md w-full space-y-4 font-mono">
            <h3 className="text-sm font-bold text-red-400 uppercase">
              Confirm Asset Deletion
            </h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete <strong className="text-white">{deletingAsset.fileName}</strong> from storage and Firestore?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#273244]">
              <button
                onClick={() => setDeletingAsset(null)}
                className="px-3 py-1.5 bg-[#18212D] text-xs text-slate-400 hover:text-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
