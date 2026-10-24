/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, SectionHeading, PrimaryButton, SecondaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { ProductCard } from '../components/ui/Cards';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { EmptyState } from '../components/ui/States';
import { SEO } from '../components/common/SEO';

export const Wishlist: React.FC = () => {
  const { wishlist, addToCart, toggleWishlist } = useStore();

  const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistProducts.forEach(prod => addToCart(prod, 1));
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Wishlist', path: '/wishlist' }
  ];

  if (wishlist.length === 0) {
    return (
      <PageContainer>
        <SEO title="Saved Wishlist | Delta Industrial" description="Manage saved industrial electrical components." />
        <Breadcrumbs items={breadcrumbs} className="mb-8" />
        <EmptyState 
          title="Your wishlist is empty" 
          message="Save components you are evaluating by clicking the heart icon on any product card."
          action={<Link to="/products"><PrimaryButton className="bg-navy hover:bg-industrial-blue">Explore Catalog</PrimaryButton></Link>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SEO title={`Saved Wishlist (${wishlist.length} items) | Delta Industrial`} description="Review and manage saved electrical equipment for future procurement." />
      <Breadcrumbs items={breadcrumbs} className="mb-8" />
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-border">
        <div>
          <div className="text-xs font-bold text-teal uppercase tracking-widest font-mono mb-1">
            Saved Components
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryButton 
            onClick={handleAddAllToCart}
            className="bg-navy hover:bg-industrial-blue text-xs font-bold gap-2"
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Add All Saved Items to Cart
          </PrimaryButton>

          <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-industrial-blue hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistProducts.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </PageContainer>
  );
};

