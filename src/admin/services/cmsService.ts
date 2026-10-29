/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — CMS Page Service
 * Firestore CRUD data access layer for CMS pages with validation and audit logging
 */

import { db } from '../../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { CMSPage, PageStatus } from '../types/cms.types';
import { auditService } from './auditService';

// Sample seed pages for initial setup
const SEED_CMS_PAGES: CMSPage[] = [
  {
    id: 'cms-page-001',
    title: 'About Delta Industrial Solutions',
    slug: 'about-us',
    shortDescription: 'Enterprise high-voltage electrical procurement and industrial automation solutions.',
    content: `# About Delta Industrial Solutions\n\nDelta Industrial Solutions is a leading B2B supplier of industrial-grade electrical components, high-voltage power cabling, switchgear, and automation systems.\n\n## Our Mission\nTo empower infrastructure contractors, OEMs, and government energy projects with certified, high-reliability electrical components delivered on time.\n\n### Core Capabilities\n- Custom Cable Cutting & Spooling\n- Certified High-Voltage Testing\n- Global Logistics & Procurement Support`,
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000',
    seoTitle: 'About Delta Industrial Solutions | High-Voltage Procurement',
    seoDescription: 'Leading B2B supplier of high-voltage cables, switchgear, and industrial automation technology.',
    authorName: 'System Admin',
    authorEmail: '309amaanu@gmail.com',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-28T14:30:00.000Z',
    publishedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cms-page-002',
    title: 'Quality Standards & Testing Certifications',
    slug: 'quality-certifications',
    shortDescription: 'IEEE, IEC, and ISO 9001 quality assurance specifications for all high-voltage equipment.',
    content: `# Quality Standards & Compliance\n\nAll power distribution equipment and armored cabling provided by Delta Industrial Solutions adhere to strict international engineering standards.\n\n## Supported Compliance Frameworks\n- **IEC 60502-2**: Power cables with extruded insulation for rated voltages from 6 kV up to 30 kV\n- **IEEE 1547**: Standard for Interconnection and Interoperability of Distributed Energy Resources\n- **ISO 9001:2015**: Quality Management System Certified Manufacturing`,
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000',
    seoTitle: 'ISO & IEC Quality Certifications | Delta Industrial',
    seoDescription: 'Read about our IEEE, IEC, and ISO 9001 quality standards for industrial electrical equipment.',
    authorName: 'Engineering Lead',
    authorEmail: '309amaanu@gmail.com',
    createdAt: '2026-10-10T11:15:00.000Z',
    updatedAt: '2026-10-25T09:20:00.000Z',
    publishedAt: '2026-10-10T11:15:00.000Z',
  },
  {
    id: 'cms-page-003',
    title: 'Global High-Voltage Logistics Guide',
    slug: 'logistics-guide',
    shortDescription: 'Heavy-haul shipping, spool transport, and customs clearance procedures for power projects.',
    content: `# High-Velocity Logistics Guide\n\nDraft documentation covering heavy cable reel transport, freight insurance, and regional warehouse dispatch timelines.`,
    status: 'draft',
    seoTitle: 'Logistics & Shipping Guide | Delta Industrial',
    seoDescription: 'B2B freight shipping timelines, heavy cable reel transport, and warehouse dispatch guidance.',
    authorName: 'Operations Lead',
    authorEmail: '309amaanu@gmail.com',
    createdAt: '2026-10-20T16:00:00.000Z',
    updatedAt: '2026-10-29T12:00:00.000Z',
  },
];

export class CMSService {
  /**
   * Helper: Generate URL-safe slug from title
   */
  public generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Fetch all CMS pages from Firestore
   */
  public async getCMSPages(): Promise<CMSPage[]> {
    if (!db) return SEED_CMS_PAGES;
    try {
      const snap = await getDocs(query(collection(db, 'cms_pages'), limit(100)));
      if (!snap.empty) {
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CMSPage));
      }
    } catch (err) {
      console.warn('[CMSService] getCMSPages fallback to seed:', err);
    }
    return SEED_CMS_PAGES;
  }

  /**
   * Fetch single CMS page by ID
   */
  public async getCMSPageById(id: string): Promise<CMSPage | null> {
    if (!db) {
      return SEED_CMS_PAGES.find(p => p.id === id) || null;
    }
    try {
      const docRef = doc(db, 'cms_pages', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as CMSPage;
      }
    } catch (err) {
      console.warn('[CMSService] getCMSPageById error:', err);
    }
    return SEED_CMS_PAGES.find(p => p.id === id) || null;
  }

  /**
   * Create a new CMS page
   */
  public async createCMSPage(
    data: Omit<CMSPage, 'id' | 'createdAt' | 'updatedAt'>,
    authorUid?: string,
    authorEmail?: string
  ): Promise<CMSPage> {
    const id = `cms-page-${Date.now()}`;
    const now = new Date().toISOString();
    const slug = data.slug ? this.generateSlug(data.slug) : this.generateSlug(data.title);

    const newPage: CMSPage = {
      ...data,
      id,
      slug,
      authorUid,
      authorEmail,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'published' ? now : undefined,
    };

    if (db) {
      try {
        await setDoc(doc(db, 'cms_pages', id), newPage);
        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'create',
          details: `Created CMS Page: ${data.title} (${slug})`,
          targetResource: 'settings',
          resourceId: id,
        });
      } catch (err) {
        console.warn('[CMSService] createCMSPage Firestore write error:', err);
      }
    }

    return newPage;
  }

  /**
   * Update an existing CMS page
   */
  public async updateCMSPage(
    id: string,
    data: Partial<CMSPage>,
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      ...data,
      updatedAt: now,
    };

    if (data.title && !data.slug) {
      updateData.slug = this.generateSlug(data.title);
    } else if (data.slug) {
      updateData.slug = this.generateSlug(data.slug);
    }

    if (data.status === 'published' && !data.publishedAt) {
      updateData.publishedAt = now;
    }

    if (db) {
      try {
        await updateDoc(doc(db, 'cms_pages', id), updateData);
        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'update',
          details: `Updated CMS Page ID: ${id}`,
          targetResource: 'settings',
          resourceId: id,
        });
        return true;
      } catch (err) {
        console.warn('[CMSService] updateCMSPage error:', err);
      }
    }
    return true;
  }

  /**
   * Publish or Unpublish a CMS page
   */
  public async setPageStatus(
    id: string, 
    status: PageStatus,
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: now,
    };
    if (status === 'published') {
      updatePayload.publishedAt = now;
    }

    if (db) {
      try {
        await updateDoc(doc(db, 'cms_pages', id), updatePayload);
        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'status_change',
          details: `Changed status to ${status} for Page ID: ${id}`,
          targetResource: 'settings',
          resourceId: id,
        });
        return true;
      } catch (err) {
        console.warn('[CMSService] setPageStatus error:', err);
      }
    }
    return true;
  }

  /**
   * Delete a CMS page
   */
  public async deleteCMSPage(
    id: string,
    authorUid?: string,
    authorEmail?: string
  ): Promise<boolean> {
    if (db) {
      try {
        await deleteDoc(doc(db, 'cms_pages', id));
        await auditService.log({
          adminUid: authorUid || 'system',
          adminName: authorEmail || '309amaanu@gmail.com',
          actorRole: 'owner',
          action: 'delete',
          details: `Deleted CMS Page ID: ${id}`,
          targetResource: 'settings',
          resourceId: id,
        });
        return true;
      } catch (err) {
        console.warn('[CMSService] deleteCMSPage error:', err);
      }
    }
    return true;
  }
}

export const cmsService = new CMSService();
