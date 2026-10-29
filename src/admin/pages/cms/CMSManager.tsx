/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — CMS Overview & Pages List
 * Centralized list and status workflow for all public content pages
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CMSPage, PageStatus } from '../../types/cms.types';
import { cmsService } from '../../services/cmsService';
import { useAuth } from '../../../context/AuthContext';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Globe, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Loader2, 
  ExternalLink,
  X
} from 'lucide-react';

export const CMSManager: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Preview & Delete Modals
  const [previewPage, setPreviewPage] = useState<CMSPage | null>(null);
  const [deletingPage, setDeletingPage] = useState<CMSPage | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await cmsService.getCMSPages();
      setPages(data);
    } catch (err: any) {
      console.error('Error fetching CMS pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Filtered Pages
  const filteredPages = useMemo(() => {
    return pages.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pages, searchQuery, statusFilter]);

  // Publish / Unpublish Toggle
  const handleTogglePublish = async (page: CMSPage) => {
    const nextStatus: PageStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      await cmsService.setPageStatus(page.id, nextStatus, user?.uid, user?.email || undefined);
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: nextStatus } : p));
    } catch (err: any) {
      console.error('Failed to change page status:', err);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingPage) return;
    try {
      await cmsService.deleteCMSPage(deletingPage.id, user?.uid, user?.email || undefined);
      setPages(prev => prev.filter(p => p.id !== deletingPage.id));
      setDeletingPage(null);
    } catch (err: any) {
      console.error('Failed to delete CMS page:', err);
    }
  };

  // Metrics
  const publishedCount = pages.filter(p => p.status === 'published').length;
  const draftCount = pages.filter(p => p.status === 'draft').length;
  const archivedCount = pages.filter(p => p.status === 'archived').length;

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#22D3EE]" />
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-100">
              Content Management System (CMS)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish, edit, and manage public informational pages and SEO content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/media"
            className="px-3 py-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Media Library</span>
          </Link>

          <Link
            to="/admin/cms/new"
            className="px-4 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Create New Page</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121823] border border-[#273244] rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Total CMS Pages</div>
          <div className="text-xl font-bold text-slate-100">{pages.length}</div>
        </div>
        <div className="bg-[#121823] border border-[#273244] rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Published</div>
          <div className="text-xl font-bold text-emerald-400">{publishedCount}</div>
        </div>
        <div className="bg-[#121823] border border-[#273244] rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Drafts</div>
          <div className="text-xl font-bold text-amber-400">{draftCount}</div>
        </div>
        <div className="bg-[#121823] border border-[#273244] rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Archived</div>
          <div className="text-xl font-bold text-slate-400">{archivedCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121823] p-3 rounded-xl border border-[#273244]">
        {/* Status Filter Tabs */}
        <div className="flex items-center bg-[#0D1118] p-0.5 rounded-lg border border-[#273244] text-[10px] w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Pages' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'archived', label: 'Archived' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded font-bold uppercase transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#22D3EE] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
          />
        </div>
      </div>

      {/* Pages Data Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#22D3EE]" />
          <span>Syncing CMS Pages...</span>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="p-12 text-center bg-[#121823] border border-[#273244] rounded-xl text-xs text-slate-400 space-y-2">
          <FileText className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
          <p className="font-bold text-slate-300">No CMS pages found</p>
          <p className="text-[11px] text-slate-500">
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search query or filter tab.' : 'Create your first page to publish content.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#121823] border border-[#273244] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0D1118] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                  <th className="px-4 py-3">Page Title</th>
                  <th className="px-4 py-3">URL Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#273244]/60 text-slate-300">
                {filteredPages.map(page => (
                  <tr key={page.id} className="hover:bg-[#18212D]/60 transition-colors group">
                    <td className="px-4 py-3 font-bold text-slate-100">{page.title}</td>
                    <td className="px-4 py-3 font-mono text-[#22D3EE]">/pages/{page.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        page.status === 'published'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                          : page.status === 'draft'
                          ? 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{page.authorName || 'System Admin'}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(page.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewPage(page)}
                          className="p-1 text-slate-400 hover:text-[#22D3EE] rounded"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(page)}
                          className="p-1 text-slate-400 hover:text-emerald-400 rounded"
                          title={page.status === 'published' ? 'Unpublish to Draft' : 'Publish Page'}
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/admin/cms/edit/${page.id}`}
                          className="p-1 text-slate-400 hover:text-cyan-300 rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeletingPage(page)}
                          className="p-1 text-slate-400 hover:text-red-400 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Page Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 font-sans">
          <div className="bg-[#090B10] border border-[#273244] rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 text-slate-100 relative">
            <button
              onClick={() => setPreviewPage(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded bg-[#18212D] border border-[#273244]"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono font-bold text-[#22D3EE] bg-[#18212D] px-2 py-0.5 rounded border border-[#273244]">
              PUBLIC PAGE PREVIEW
            </span>

            {previewPage.featuredImage && (
              <img src={previewPage.featuredImage} alt={previewPage.title} className="w-full h-48 object-cover rounded-xl border border-[#273244]" />
            )}

            <h1 className="text-2xl font-bold text-white">{previewPage.title}</h1>
            {previewPage.shortDescription && <p className="text-xs text-slate-400 italic">{previewPage.shortDescription}</p>}

            <div className="prose prose-invert max-w-none text-xs text-slate-200 border-t border-[#273244] pt-4 whitespace-pre-line leading-relaxed font-mono">
              {previewPage.content}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingPage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 font-mono">
          <div className="bg-[#121823] border border-red-500/40 rounded-2xl p-5 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-red-400 uppercase">Confirm Page Deletion</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete <strong className="text-white">{deletingPage.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#273244]">
              <button
                onClick={() => setDeletingPage(null)}
                className="px-3 py-1.5 bg-[#18212D] text-xs text-slate-400 hover:text-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded"
              >
                Delete Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
