/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Media Library Service
 * Firebase Storage file uploader & asset manager supporting JPG, PNG, WebP, SVG validation, size checks, and Firestore metadata storage
 */

import { db, storage } from '../../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  MediaAsset, 
  ALLOWED_MEDIA_TYPES, 
  MAX_MEDIA_UPLOAD_SIZE_BYTES, 
  MAX_MEDIA_UPLOAD_SIZE_MB 
} from '../types/cms.types';
import { auditService } from './auditService';

// Seed sample media items for initial setup
const SEED_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-001',
    fileName: 'high_voltage_transformer_substation.jpg',
    storagePath: 'admin/media/media-001_high_voltage_transformer.jpg',
    downloadURL: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
    contentType: 'image/jpeg',
    fileType: 'image/jpeg',
    size: 2450000,
    fileSize: 2450000,
    altText: 'Industrial high voltage power transformer substation',
    tags: ['substation', 'transformer', 'high-voltage'],
    uploadedBy: '309amaanu@gmail.com',
    uploadedByEmail: '309amaanu@gmail.com',
    uploadedAt: '2026-10-15T10:00:00.000Z',
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'media-002',
    fileName: 'armored_power_cable_spool.jpg',
    storagePath: 'admin/media/media-002_armored_cable.jpg',
    downloadURL: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    contentType: 'image/jpeg',
    fileType: 'image/jpeg',
    size: 1850000,
    fileSize: 1850000,
    altText: 'Heavy duty armored copper power cable drum spool',
    tags: ['cable', 'copper', 'armored'],
    uploadedBy: '309amaanu@gmail.com',
    uploadedByEmail: '309amaanu@gmail.com',
    uploadedAt: '2026-10-18T14:20:00.000Z',
    createdAt: '2026-10-18T14:20:00.000Z',
  },
  {
    id: 'media-003',
    fileName: 'automation_plc_control_panel.jpg',
    storagePath: 'admin/media/media-003_plc_panel.jpg',
    downloadURL: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    contentType: 'image/jpeg',
    fileType: 'image/jpeg',
    size: 3120000,
    fileSize: 3120000,
    altText: 'PLC automation control panel wiring cabinet',
    tags: ['automation', 'plc', 'switchgear'],
    uploadedBy: '309amaanu@gmail.com',
    uploadedByEmail: '309amaanu@gmail.com',
    uploadedAt: '2026-10-22T09:15:00.000Z',
    createdAt: '2026-10-22T09:15:00.000Z',
  },
  {
    id: 'media-004',
    fileName: 'delta_industrial_logo_emblem.svg',
    storagePath: 'admin/media/media-004_logo.svg',
    downloadURL: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    contentType: 'image/svg+xml',
    fileType: 'image/svg+xml',
    size: 45000,
    fileSize: 45000,
    altText: 'Delta Industrial corporate emblem logo vector',
    tags: ['branding', 'logo', 'svg'],
    uploadedBy: '309amaanu@gmail.com',
    uploadedByEmail: '309amaanu@gmail.com',
    uploadedAt: '2026-10-25T11:45:00.000Z',
    createdAt: '2026-10-25T11:45:00.000Z',
  },
];

export class MediaService {
  /**
   * Check if Firebase Storage is active
   */
  public isStorageConfigured(): boolean {
    return Boolean(storage);
  }

  /**
   * Validate file format and volumetric size limits
   */
  public validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected.' };
    }

    if (!ALLOWED_MEDIA_TYPES.includes(file.type.toLowerCase())) {
      return { 
        valid: false, 
        error: `Invalid file format (${file.type}). Only JPG, JPEG, PNG, WebP, and SVG files are allowed.` 
      };
    }

    if (file.size > MAX_MEDIA_UPLOAD_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return { 
        valid: false, 
        error: `File size (${fileSizeMB} MB) exceeds maximum allowed limit of ${MAX_MEDIA_UPLOAD_SIZE_MB} MB.` 
      };
    }

    return { valid: true };
  }

  /**
   * Fetch all media assets from Firestore
   */
  public async getMediaAssets(): Promise<MediaAsset[]> {
    if (!db) return SEED_MEDIA_ASSETS;
    try {
      const snap = await getDocs(query(collection(db, 'media_assets'), limit(100)));
      if (!snap.empty) {
        return snap.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            fileName: data.fileName,
            storagePath: data.storagePath || `admin/media/${docSnap.id}`,
            downloadURL: data.downloadURL || data.url,
            url: data.downloadURL || data.url,
            contentType: data.contentType || data.fileType || 'image/jpeg',
            fileType: data.contentType || data.fileType || 'image/jpeg',
            size: data.size || data.fileSize || 0,
            fileSize: data.size || data.fileSize || 0,
            altText: data.altText,
            tags: data.tags,
            uploadedBy: data.uploadedBy || data.uploadedByEmail || 'system',
            uploadedByUid: data.uploadedByUid,
            uploadedByEmail: data.uploadedByEmail,
            uploadedAt: data.uploadedAt || data.createdAt || new Date().toISOString(),
            createdAt: data.uploadedAt || data.createdAt || new Date().toISOString(),
          } as MediaAsset;
        });
      }
    } catch (err) {
      console.warn('[MediaService] getMediaAssets fallback to seed:', err);
    }
    return SEED_MEDIA_ASSETS;
  }

  /**
   * Upload file to Firebase Storage & store metadata in Firestore
   */
  public async uploadMediaFile(
    file: File,
    onProgress?: (percent: number) => void,
    uploadedByUid?: string,
    uploadedByEmail?: string
  ): Promise<MediaAsset> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const id = `media-${Date.now()}`;
    const now = new Date().toISOString();
    const storagePath = `admin/media/${id}_${file.name}`;

    let downloadURL = '';

    // Attempt Firebase Storage Upload if Storage instance is configured
    if (storage) {
      try {
        const fileRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(fileRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            snapshot => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) onProgress(Math.round(progress));
            },
            error => reject(error),
            async () => {
              downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } catch (storageErr) {
        console.warn('[MediaService] Firebase Storage upload error, falling back to data URL preview:', storageErr);
      }
    }

    // Fallback Data URL generation if Firebase Storage wasn't reached
    if (!downloadURL) {
      if (onProgress) onProgress(50);
      downloadURL = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
      if (onProgress) onProgress(100);
    }

    const newAsset: MediaAsset = {
      id,
      fileName: file.name,
      storagePath,
      downloadURL,
      url: downloadURL,
      contentType: file.type,
      fileType: file.type,
      size: file.size,
      fileSize: file.size,
      altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      uploadedBy: uploadedByEmail || 'system',
      uploadedByUid,
      uploadedByEmail,
      uploadedAt: now,
      createdAt: now,
    };

    if (db) {
      try {
        await setDoc(doc(db, 'media_assets', id), newAsset);
        await auditService.log({
          adminUid: uploadedByUid || 'system',
          adminName: uploadedByEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'create',
          details: `Uploaded media file: ${file.name} (${(file.size / 1024).toFixed(1)} KB) to ${storagePath}`,
          targetResource: 'settings',
          resourceId: id,
        });
      } catch (err) {
        console.warn('[MediaService] uploadMediaFile Firestore write error:', err);
      }
    }

    return newAsset;
  }

  /**
   * Delete media asset from Storage & Firestore
   */
  public async deleteMediaAsset(
    asset: MediaAsset,
    uploadedByUid?: string,
    uploadedByEmail?: string
  ): Promise<boolean> {
    // Delete from Storage if storagePath exists and storage is active
    if (storage && asset.storagePath) {
      try {
        const fileRef = ref(storage, asset.storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('[MediaService] Storage object delete error:', err);
      }
    }

    if (db) {
      try {
        await deleteDoc(doc(db, 'media_assets', asset.id));
        await auditService.log({
          adminUid: uploadedByUid || 'system',
          adminName: uploadedByEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'delete',
          details: `Deleted media asset ID: ${asset.id} (${asset.fileName})`,
          targetResource: 'settings',
          resourceId: asset.id,
        });
        return true;
      } catch (err) {
        console.warn('[MediaService] deleteMediaAsset Firestore error:', err);
      }
    }
    return true;
  }
}

export const mediaService = new MediaService();
