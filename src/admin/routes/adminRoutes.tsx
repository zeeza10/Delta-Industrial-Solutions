/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Admin Views code-splitting
const AdminLayout = lazy(() => import('../layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const VIPDashboard = lazy(() => import('../pages/VIPDashboard').then(m => ({ default: m.VIPDashboard })));
const VIPCategoryManager = lazy(() => import('../pages/VIPCategoryManager').then(m => ({ default: m.VIPCategoryManager })));
const VIPBrandManager = lazy(() => import('../pages/VIPBrandManager').then(m => ({ default: m.VIPBrandManager })));
const VIPUserManager = lazy(() => import('../pages/VIPUserManager').then(m => ({ default: m.VIPUserManager })));
const VIPAnalytics = lazy(() => import('../pages/VIPAnalytics').then(m => ({ default: m.VIPAnalytics })));
const VIPSettingsManager = lazy(() => import('../pages/VIPSettingsManager').then(m => ({ default: m.VIPSettingsManager })));

const VIPProductManager = lazy(() => import('../pages/VIPProductManager').then(m => ({ default: m.VIPProductManager })));
const VIPEnquiryManager = lazy(() => import('../pages/VIPEnquiryManager').then(m => ({ default: m.VIPEnquiryManager })));
const VIPAdminLogin = lazy(() => import('../pages/VIPAdminLogin').then(m => ({ default: m.VIPAdminLogin })));
const VIPGmailHub = lazy(() => import('../pages/VIPGmailHub').then(m => ({ default: m.VIPGmailHub })));
const VIPInventoryDashboard = lazy(() => import('../pages/VIPInventoryDashboard').then(m => ({ default: m.VIPInventoryDashboard })));

// CMS & Media Library Modules
const CMSManager = lazy(() => import('../pages/cms/CMSManager').then(m => ({ default: m.CMSManager })));
const CMSPageEditor = lazy(() => import('../pages/cms/CMSPageEditor').then(m => ({ default: m.CMSPageEditor })));
const MediaLibrary = lazy(() => import('../pages/cms/MediaLibrary').then(m => ({ default: m.MediaLibrary })));

// Accessible loading fallback for admin sub-routes
const AdminFallback: React.FC = () => (
  <div 
    className="flex items-center justify-center min-h-[400px] w-full"
    role="status"
    aria-label="Loading admin module"
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
      <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
        Loading Admin Module...
      </span>
    </div>
  </div>
);

const withAdminSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<AdminFallback />}>
    <Component />
  </Suspense>
);

/**
 * Dedicated Admin Panel Route Configuration.
 * Mounted under `/admin` in the main router.
 */
export const adminRoutes: RouteObject = {
  path: '/admin',
  element: withAdminSuspense(AdminLayout),
  children: [
    {
      index: true,
      element: withAdminSuspense(VIPDashboard),
    },
    {
      path: 'login',
      element: withAdminSuspense(VIPAdminLogin),
    },
    {
      path: 'products',
      element: withAdminSuspense(VIPProductManager),
    },
    {
      path: 'products/new',
      element: withAdminSuspense(VIPProductManager),
    },
    {
      path: 'products/:id',
      element: withAdminSuspense(VIPProductManager),
    },
    {
      path: 'products/:id/edit',
      element: withAdminSuspense(VIPProductManager),
    },
    {
      path: 'enquiries',
      element: withAdminSuspense(VIPEnquiryManager),
    },
    {
      path: 'gmail',
      element: withAdminSuspense(VIPGmailHub),
    },
    {
      path: 'inventory',
      element: withAdminSuspense(VIPInventoryDashboard),
    },
    {
      path: 'categories',
      element: withAdminSuspense(VIPCategoryManager),
    },
    {
      path: 'brands',
      element: withAdminSuspense(VIPBrandManager),
    },
    {
      path: 'cms',
      element: withAdminSuspense(CMSManager),
    },
    {
      path: 'cms/pages',
      element: withAdminSuspense(CMSManager),
    },
    {
      path: 'cms/new',
      element: withAdminSuspense(CMSPageEditor),
    },
    {
      path: 'cms/pages/new',
      element: withAdminSuspense(CMSPageEditor),
    },
    {
      path: 'cms/edit/:id',
      element: withAdminSuspense(CMSPageEditor),
    },
    {
      path: 'cms/pages/:id/edit',
      element: withAdminSuspense(CMSPageEditor),
    },
    {
      path: 'media',
      element: withAdminSuspense(MediaLibrary),
    },
    {
      path: 'cms/media',
      element: withAdminSuspense(MediaLibrary),
    },
    {
      path: 'users',
      element: withAdminSuspense(VIPUserManager),
    },
    {
      path: 'analytics',
      element: withAdminSuspense(VIPAnalytics),
    },
    {
      path: 'settings',
      element: withAdminSuspense(VIPSettingsManager),
    },
  ],
};
