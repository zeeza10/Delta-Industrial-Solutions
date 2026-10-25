/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-black bg-industrial-grid">
      {/* Accessibility: Skip to Main Content Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-2xl focus:ring-2 focus:ring-teal font-bold text-xs uppercase tracking-wider outline-none"
      >
        Skip to main content
      </a>

      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none pt-[110px]">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <CartDrawer />
    </div>
  );
};

