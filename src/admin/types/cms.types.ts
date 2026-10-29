/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — CMS & Media Library Data Contracts
 */

export type PageStatus = 'draft' | 'published' | 'archived';

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  excerpt?: string; // Short summary
  shortDescription?: string; // Alias
  content: string; // Markdown or HTML content
  status: PageStatus;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdBy?: string;
  updatedBy?: string;
  authorUid?: string;
  authorEmail?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface MediaAsset {
  id: string;
  fileName: string;
  storagePath: string;
  downloadURL: string;
  url: string; // Alias for downloadURL
  contentType: string;
  fileType?: string; // Alias
  size: number; // File size in bytes
  fileSize?: number; // Alias
  altText?: string;
  tags?: string[];
  uploadedBy?: string;
  uploadedByUid?: string;
  uploadedByEmail?: string;
  uploadedAt: string;
  createdAt?: string;
}

// Configurable media upload constants
export const MAX_MEDIA_UPLOAD_SIZE_MB = 10;
export const MAX_MEDIA_UPLOAD_SIZE_BYTES = MAX_MEDIA_UPLOAD_SIZE_MB * 1024 * 1024;
export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];
