/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageContainer, SectionHeading, PrimaryButton, SecondaryButton } from '../components/ui/Base';
import { Breadcrumbs, PriceDisplay } from '../components/ui/Display';
import { QuantitySelector } from '../components/ui/Forms';
import { useStore } from '../context/StoreContext';
import { Trash2, ArrowLeft, ShoppingBag, ShieldCheck, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '../components/ui/States';
import { SEO } from '../components/common/SEO';
import { CheckoutModal } from '../components/cart/CheckoutModal';
import { generateQuotationPDF } from '../utils/pdfExport';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, cartTotal, clearCart, lastOrder, setLastOrder } = useStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Shopping Cart', path: '/cart' }
  ];

  if (cart.length === 0) {
    if (lastOrder) {
      return (
        <PageContainer>
          <SEO title="Order Booked Successfully | Delta Industrial" description="Your industrial procurement order has been successfully booked." />
          <Breadcrumbs items={breadcrumbs} className="mb-8" />
          
          <div className="max-w-2xl mx-auto bg-[#0b0f19] border border-cyan-500/30 rounded-2xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.9)] font-mono text-center space-y-6">
            <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/40 rounded-full flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan">YOUR ORDER IS BOOKED</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Reference #{lastOrder.reference}</h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto font-sans">
                Your order has been officially booked in the Delta Industrial Solutions Private Limited dispatch system on {lastOrder.date}.
              </p>
            </div>

            <div className="p-4 bg-[#07090e] border border-cyan-500/20 rounded-xl text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400">Total Order Amount:</span>
                <PriceDisplay amount={lastOrder.total} className="text-cyan-400 font-bold" />
              </div>
              <div className="flex justify-between border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400">Items Ordered:</span>
                <span className="text-white font-medium">{lastOrder.items.length} SKU(s)</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Ordered Products:</span>
                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                  {lastOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300 text-[11px] border-b border-white/5 pb-1">
                      <span className="truncate max-w-[220px]">{it.product.name} (x{it.quantity})</span>
                      <PriceDisplay amount={it.product.price * it.quantity} className="text-cyan-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <PrimaryButton 
                onClick={() => {
                  setLastOrder(null);
                  navigate('/account?tab=orders');
                }}
                className="w-full sm:w-auto px-6 h-12 text-xs uppercase tracking-wider"
              >
                View Account Orders
              </PrimaryButton>
              <SecondaryButton 
                onClick={() => {
                  setLastOrder(null);
                  navigate('/products');
                }}
                className="w-full sm:w-auto px-6 h-12 text-xs uppercase tracking-wider"
              >
                Start New Order / Browse
              </SecondaryButton>
            </div>
          </div>
        </PageContainer>
      );
    }

    return (
      <PageContainer>
        <SEO title="Shopping Cart | Delta Industrial" description="Review items selected for your industrial electrical order or quote." />
        <Breadcrumbs items={breadcrumbs} className="mb-8" />
        <EmptyState 
          title="Your cart is empty" 
          message="You haven't added any products to your cart yet. Explore our catalog to find industrial electrical solutions for your project."
          action={<Link to="/products"><PrimaryButton>Browse Products</PrimaryButton></Link>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SEO title={`Shopping Cart (${cart.length} items) | Delta Industrial`} description="Review and manage items in your industrial procurement cart." />
      <Breadcrumbs items={breadcrumbs} className="mb-8" />
      
      <div className="flex flex-col lg:flex-row gap-12 font-mono">
        {/* Left: Items */}
        <div className="flex-grow space-y-8">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <h1 className="text-2xl font-bold text-cyan-400 text-glow-cyan">SECURE CART ({cart.length} ITEMS)</h1>
            <button 
              onClick={clearCart}
              className="text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors uppercase tracking-wider"
            >
              Clear Cart
            </button>
          </div>

          <div className="divide-y divide-cyan-500/10">
            {cart.map((item) => (
              <div key={item.productId} className="py-8 flex flex-col sm:flex-row gap-8">
                <div className="w-32 h-32 bg-[#07090e] border border-cyan-500/30 rounded-lg p-4 shrink-0 flex items-center justify-center relative overflow-hidden group">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                </div>
                
                <div className="flex-grow space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white hover:text-cyan-400 transition-colors">
                        <Link to={`/products/${item.productId}`}>{item.product.name}</Link>
                      </h3>
                      <p className="text-xs font-mono text-cyan-400/80 mt-1 uppercase">SKU: {item.product.sku}</p>
                    </div>
                    <PriceDisplay amount={item.product.price} size="lg" className="text-cyan-400" />
                  </div>

                  <div className="flex items-center justify-between gap-8 pt-4">
                    <QuantitySelector 
                      value={item.quantity} 
                      onChange={(val) => updateCartQuantity(item.productId, val)} 
                    />
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      aria-label={`Remove ${item.product.name} from cart`}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 rounded"
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Right: Summary */}
        <div className="lg:w-[400px] shrink-0">
          <div className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 sticky top-24 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <h3 className="text-sm font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-glow-cyan">ORDER SUMMARY</h3>
            
            <div className="space-y-4 mb-8 text-slate-300">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <PriceDisplay amount={cartTotal} className="text-white font-bold" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className="text-cyan-400 font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Estimated Tax</span>
                <span className="text-cyan-400 font-medium">Calculated at checkout</span>
              </div>
              <div className="pt-4 border-t border-cyan-500/20 flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total</span>
                <PriceDisplay amount={cartTotal} size="lg" className="text-cyan-400 text-glow-cyan" />
              </div>
            </div>

            <div className="space-y-4">
              <PrimaryButton 
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full h-14 text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] uppercase tracking-wider" 
                leftIcon={<ShoppingBag className="w-5 h-5 text-black" />}
              >
                Proceed to Order Booking
              </PrimaryButton>
              <SecondaryButton
                onClick={() => generateQuotationPDF(cart)}
                className="w-full h-12 text-xs uppercase tracking-wider gap-2 text-cyan-400 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10"
                leftIcon={<FileText className="w-4 h-4 text-cyan-400" />}
              >
                Download Quotation PDF
              </SecondaryButton>
              <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-lg flex gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  <strong className="text-cyan-400">ISO 9001 COMPLIANT:</strong> All items in your order are backed by manufacturer warranty certificates and rapid logistics dispatch.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-cyan-500/20 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Encrypted B2B Industrial Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </PageContainer>
  );
};
