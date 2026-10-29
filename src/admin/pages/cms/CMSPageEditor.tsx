/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — CMS Page Creator & Editor
 * Full content management editor with Markdown toolbar, image insertion picker, SEO meta, and live preview modal
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CMSPage, PageStatus } from '../../types/cms.types';
import { cmsService } from '../../services/cmsService';
import { MediaLibrary } from './MediaLibrary';
import { useAuth } from '../../../context/AuthContext';
import { 
  FileText, 
  Save, 
  Eye, 
  Globe, 
  ArrowLeft, 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  X
} from 'lucide-react';

export const CMSPageEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = Boolean(id);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PageStatus>('draft');
  const [featuredImage, setFeaturedImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // UI Modals & Feedback
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'content' | 'featured'>('content');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing page if editing
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      cmsService.getCMSPageById(id).then(page => {
        if (page) {
          setTitle(page.title);
          setSlug(page.slug);
          setShortDescription(page.shortDescription || '');
          setContent(page.content || '');
          setStatus(page.status);
          setFeaturedImage(page.featuredImage || '');
          setSeoTitle(page.seoTitle || '');
          setSeoDescription(page.seoDescription || '');
        } else {
          setErrorMessage('CMS page not found.');
        }
        setIsLoading(false);
      });
    }
  }, [id]);

  // Auto-generate slug when title changes in create mode
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode || !slug) {
      setSlug(cmsService.generateSlug(val));
    }
    if (!seoTitle) {
      setSeoTitle(val);
    }
  };

  // Content Editor Toolbar Helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    setContent(prev => prev + `${prefix}text${suffix}`);
  };

  const handleSelectMediaAsset = (asset: { url: string; altText?: string }) => {
    if (mediaPickerTarget === 'featured') {
      setFeaturedImage(asset.url);
    } else {
      const imgMarkdown = `\n![${asset.altText || 'CMS Image'}](${asset.url})\n`;
      setContent(prev => prev + imgMarkdown);
    }
    setIsMediaModalOpen(false);
  };

  // Save Page Handler
  const handleSavePage = async (targetStatus?: PageStatus) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Validation
    if (!title.trim()) {
      setErrorMessage('Page title cannot be empty.');
      return;
    }

    if (!slug.trim()) {
      setErrorMessage('Page URL slug cannot be empty.');
      return;
    }

    const finalStatus = targetStatus || status;
    setIsSaving(true);

    try {
      if (isEditMode && id) {
        await cmsService.updateCMSPage(
          id,
          {
            title: title.trim(),
            slug: cmsService.generateSlug(slug),
            shortDescription: shortDescription.trim(),
            content,
            status: finalStatus,
            featuredImage,
            seoTitle: seoTitle.trim(),
            seoDescription: seoDescription.trim(),
          },
          user?.uid,
          user?.email || undefined
        );
        setSuccessMessage('CMS page updated successfully!');
      } else {
        const newPage = await cmsService.createCMSPage(
          {
            title: title.trim(),
            slug: cmsService.generateSlug(slug),
            shortDescription: shortDescription.trim(),
            content,
            status: finalStatus,
            featuredImage,
            seoTitle: seoTitle.trim(),
            seoDescription: seoDescription.trim(),
            authorName: user?.displayName || 'System Admin',
            authorEmail: user?.email || '309amaanu@gmail.com',
          },
          user?.uid,
          user?.email || undefined
        );
        setSuccessMessage('CMS page created successfully!');
        setTimeout(() => navigate(`/admin/cms/edit/${newPage.id}`), 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save CMS page.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#22D3EE]" />
        <span>Loading CMS Page Editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/cms')}
            className="p-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-slate-300 hover:text-white transition-colors"
            title="Return to CMS Manager"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#22D3EE]" />
              <span>{isEditMode ? 'Edit CMS Page' : 'Create New CMS Page'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft, edit, and publish SEO-optimized industrial content pages.
            </p>
          </div>
        </div>

        {/* Save & Preview Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3 py-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Preview Page</span>
          </button>

          <button
            type="button"
            onClick={() => handleSavePage('draft')}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSavePage('published')}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            <span>Publish Page</span>
          </button>
        </div>
      </div>

      {/* Banners */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Content Editor (Left) & Metadata Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Page Content Editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title & Slug */}
          <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Page Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. About Delta Industrial Solutions"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0D1118] border border-[#273244] rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                URL Slug <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center bg-[#0D1118] border border-[#273244] rounded-lg px-3 py-2 text-xs text-slate-400">
                <span className="text-slate-500 select-none">/pages/</span>
                <input
                  type="text"
                  placeholder="about-us"
                  value={slug}
                  onChange={e => setSlug(cmsService.generateSlug(e.target.value))}
                  className="w-full bg-transparent text-slate-200 focus:outline-none ml-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Short Description / Subtitle
              </label>
              <input
                type="text"
                placeholder="Brief summary used in index listings and cards..."
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
          </div>

          {/* Main Content Markdown / Rich Formatting Editor */}
          <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#273244] pb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Main Page Content (Markdown Supported)
              </label>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 bg-[#0D1118] p-1 rounded-lg border border-[#273244]">
                <button
                  type="button"
                  onClick={() => insertFormatting('# ')}
                  className="p-1 text-slate-400 hover:text-[#22D3EE] rounded"
                  title="Heading 1"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('## ')}
                  className="p-1 text-slate-400 hover:text-[#22D3EE] rounded"
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('### ')}
                  className="p-1 text-slate-400 hover:text-[#22D3EE] rounded"
                  title="Heading 3"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="p-1 text-slate-400 hover:text-[#22D3EE] rounded"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="p-1 text-slate-400 hover:text-[#22D3EE] rounded"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('- ')}
                  className="p-1 text-slate-400 hover:text-[#22D3EE] rounded"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[Link Title](', ')')}
                  className="p-1 text-slate-400 hover:text-[#22D3EE] rounded"
                  title="Insert Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerTarget('content');
                    setIsMediaModalOpen(true);
                  }}
                  className="p-1 text-[#22D3EE] hover:bg-[#18212D] rounded flex items-center gap-1 font-bold text-[10px]"
                  title="Insert Image from Media Library"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Insert Image</span>
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              placeholder="Write main page content in Markdown or HTML..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-3.5 bg-[#0D1118] border border-[#273244] rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE] custom-scrollbar leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Page Metadata, Status, Featured Image & SEO */}
        <div className="space-y-5">
          {/* Status Settings */}
          <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-[#273244] pb-2">
              Publishing Status
            </h3>

            <div className="space-y-2 text-xs">
              {(['draft', 'published', 'archived'] as PageStatus[]).map(st => (
                <label key={st} className="flex items-center gap-2 cursor-pointer capitalize">
                  <input
                    type="radio"
                    name="page-status"
                    checked={status === st}
                    onChange={() => setStatus(st)}
                    className="accent-[#22D3EE]"
                  />
                  <span className={status === st ? 'text-[#22D3EE] font-bold' : 'text-slate-400'}>
                    {st}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Featured Image Selection */}
          <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-[#273244] pb-2">
              Featured Image
            </h3>

            {featuredImage ? (
              <div className="relative aspect-video bg-[#0D1118] rounded-lg overflow-hidden border border-[#273244] group">
                <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 p-1 bg-red-950/80 text-red-300 rounded border border-red-500/40"
                  title="Remove Featured Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-[#0D1118] border border-dashed border-[#273244] rounded-lg text-center space-y-2">
                <ImageIcon className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-[11px] text-slate-500">No featured image selected</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMediaPickerTarget('featured');
                setIsMediaModalOpen(true);
              }}
              className="w-full py-2 bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs font-bold text-slate-200 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Select from Media Library</span>
            </button>
          </div>

          {/* SEO Metadata */}
          <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-[#273244] pb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Search Engine Optimization (SEO)</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-400">SEO Title</label>
              <input
                type="text"
                placeholder="Title tag for search engines..."
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                className="w-full p-2 bg-[#0D1118] border border-[#273244] rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-400">Meta Description</label>
              <textarea
                rows={3}
                placeholder="Meta description for Google search snippets..."
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                className="w-full p-2 bg-[#0D1118] border border-[#273244] rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Selection Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <MediaLibrary
              isModal={true}
              onSelectMedia={handleSelectMediaAsset}
              onCloseModal={() => setIsMediaModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Live Page Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#090B10] border border-[#273244] rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 font-sans text-slate-100 relative">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded bg-[#18212D] border border-[#273244]"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono font-bold text-[#22D3EE] bg-[#18212D] px-2 py-0.5 rounded border border-[#273244]">
              STOREFRONT LIVE PREVIEW
            </span>

            {featuredImage && (
              <img src={featuredImage} alt={title} className="w-full h-56 object-cover rounded-xl border border-[#273244]" />
            )}

            <h1 className="text-2xl font-bold text-white">{title || 'Untitled Page'}</h1>
            {shortDescription && <p className="text-sm text-slate-400 italic">{shortDescription}</p>}

            <div className="prose prose-invert max-w-none text-sm text-slate-200 border-t border-[#273244] pt-4 whitespace-pre-line leading-relaxed">
              {content || 'No content written yet.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
