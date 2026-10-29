/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { 
  Info, 
  Mail, 
  Newspaper, 
  ShieldCheck, 
  Layers, 
  Tag, 
  Users, 
  Settings 
} from 'lucide-react';
import { PlaceholderPage } from '../components/ui/PlaceholderPage';

// Performance: Route-level code splitting using React.lazy
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const CategoryListing = lazy(() => import('../pages/CategoryListing').then(m => ({ default: m.CategoryListing })));
const CategoryDirectory = lazy(() => import('../pages/CategoryDirectory').then(m => ({ default: m.CategoryDirectory })));
const BrandDirectory = lazy(() => import('../pages/BrandDirectory').then(m => ({ default: m.BrandDirectory })));
const SearchResults = lazy(() => import('../pages/SearchResults').then(m => ({ default: m.SearchResults })));
const ProductDetail = lazy(() => import('../pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import('../pages/Cart').then(m => ({ default: m.Cart })));
const Wishlist = lazy(() => import('../pages/Wishlist').then(m => ({ default: m.Wishlist })));
const QuoteList = lazy(() => import('../pages/QuoteList').then(m => ({ default: m.QuoteList })));
const BulkQuote = lazy(() => import('../pages/BulkQuote').then(m => ({ default: m.BulkQuote })));
const ProjectEnquiry = lazy(() => import('../pages/ProjectEnquiry').then(m => ({ default: m.ProjectEnquiry })));
const CableEnquiry = lazy(() => import('../pages/CableEnquiry').then(m => ({ default: m.CableEnquiry })));
const About = lazy(() => import('../pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('../pages/Contact').then(m => ({ default: m.Contact })));
const Account = lazy(() => import('../pages/Account').then(m => ({ default: m.Account })));
const StyleShowcase = lazy(() => import('../pages/StyleShowcase').then(m => ({ default: m.StyleShowcase })));
const NotFound = lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound })));

// Admin Lazy Routes
const VIPAdminLayout = lazy(() => import('../admin/components/layout/VIPAdminLayout').then(m => ({ default: m.VIPAdminLayout })));
const VIPDashboard = lazy(() => import('../admin/pages/VIPDashboard').then(m => ({ default: m.VIPDashboard })));
const VIPCategoryManager = lazy(() => import('../admin/pages/VIPCategoryManager').then(m => ({ default: m.VIPCategoryManager })));
const VIPBrandManager = lazy(() => import('../admin/pages/VIPBrandManager').then(m => ({ default: m.VIPBrandManager })));
const VIPUserManager = lazy(() => import('../admin/pages/VIPUserManager').then(m => ({ default: m.VIPUserManager })));
const VIPAnalytics = lazy(() => import('../admin/pages/VIPAnalytics').then(m => ({ default: m.VIPAnalytics })));
const VIPSettingsManager = lazy(() => import('../admin/pages/VIPSettingsManager').then(m => ({ default: m.VIPSettingsManager })));
const AdminProducts = lazy(() => import('../pages/admin/Products').then(m => ({ default: m.AdminProducts })));
const AdminEnquiries = lazy(() => import('../pages/admin/Enquiries').then(m => ({ default: m.AdminEnquiries })));

// Accessible loading fallback
const PageFallback: React.FC = () => (
  <div 
    className="flex items-center justify-center min-h-[400px] w-full"
    role="status"
    aria-label="Loading page content"
  >
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" aria-hidden="true"></div>
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Loading content...</span>
    </div>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
);

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: withSuspense(Home),
      },
      {
        path: 'products',
        element: withSuspense(SearchResults),
      },
      {
        path: 'products/:id',
        element: withSuspense(ProductDetail),
      },
      {
        path: 'categories',
        element: withSuspense(CategoryDirectory),
      },
      {
        path: 'categories/:id',
        element: withSuspense(CategoryListing),
      },
      {
        path: 'brands',
        element: withSuspense(BrandDirectory),
      },
      {
        path: 'brands/:id',
        element: withSuspense(CategoryListing),
      },
      {
        path: 'search',
        element: withSuspense(SearchResults),
      },
      {
        path: 'cart',
        element: withSuspense(Cart),
      },
      {
        path: 'wishlist',
        element: withSuspense(Wishlist),
      },
      {
        path: 'quotes',
        element: withSuspense(QuoteList),
      },
      {
        path: 'bulk-quote',
        element: withSuspense(BulkQuote),
      },
      {
        path: 'project-enquiry',
        element: withSuspense(ProjectEnquiry),
      },
      {
        path: 'cable-enquiry',
        element: withSuspense(CableEnquiry),
      },
      {
        path: 'about',
        element: withSuspense(About),
      },
      {
        path: 'contact',
        element: withSuspense(Contact),
      },
      {
        path: 'account',
        element: withSuspense(Account),
      },
      {
        path: 'blog',
        element: <PlaceholderPage title="Industrial Blog" icon={Newspaper} />,
      },
      {
        path: 'style-showcase',
        element: withSuspense(StyleShowcase),
      },
      {
        path: 'policies',
        element: <PlaceholderPage title="Policies" icon={ShieldCheck} />,
      },
      {
        path: '*',
        element: withSuspense(NotFound),
      },
    ],
  },
  {
    path: '/admin',
    element: withSuspense(VIPAdminLayout),
    children: [
      {
        index: true,
        element: withSuspense(VIPDashboard),
      },
      {
        path: 'products',
        element: withSuspense(AdminProducts),
      },
      {
        path: 'enquiries',
        element: withSuspense(AdminEnquiries),
      },
      {
        path: 'categories',
        element: withSuspense(VIPCategoryManager),
      },
      {
        path: 'brands',
        element: withSuspense(VIPBrandManager),
      },
      {
        path: 'users',
        element: withSuspense(VIPUserManager),
      },
      {
        path: 'analytics',
        element: withSuspense(VIPAnalytics),
      },
      {
        path: 'settings',
        element: withSuspense(VIPSettingsManager),
      },
    ],
  },
];
