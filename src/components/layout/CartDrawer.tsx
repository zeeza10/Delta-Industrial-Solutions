/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PriceDisplay } from '../ui/Display';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    isCartDrawerOpen, 
    closeCartDrawer, 
    removeFromCart, 
    updateCartQuantity, 
    cartTotal 
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    if (isCartDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCartDrawerOpen, closeCartDrawer]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden" aria-modal="true" role="dialog" aria-label="Shopping Cart Drawer">
      {/* Semi-transparent Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" 
        onClick={closeCartDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0f19] border-l border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right font-mono text-slate-200">
          
          {/* Drawer Header */}
          <div className="p-5 bg-[#07090e] text-white flex items-center justify-between border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded border border-cyan-500/40 text-cyan-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-cyan-400 text-glow-cyan leading-tight">INDUSTRIAL PROCUREMENT CART</h2>
                <p className="text-[11px] text-slate-400">{cart.length} {cart.length === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>

            <button
              onClick={closeCartDrawer}
              aria-label="Close cart drawer"
              className="p-2 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Items List */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar divide-y divide-cyan-500/10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-[#07090e] border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your industrial cart is empty</h3>
                  <p className="text-xs text-slate-400 mt-1">Explore our product catalog to select certified industrial electrical equipment.</p>
                </div>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/products');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs rounded hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const img = item.product?.images?.[0] || '/src/assets/images/placeholder.jpg';
                const name = item.product?.name || 'Industrial Product';
                const price = item.product?.price || 0;
                const sku = item.product?.sku;

                return (
                  <div key={item.productId} className="py-4 flex gap-4 items-start first:pt-0">
                    <div className="w-20 h-20 bg-[#07090e] border border-cyan-500/20 rounded p-2 shrink-0 flex items-center justify-center relative overflow-hidden group">
                      <img 
                        src={img} 
                        alt={name} 
                        loading="lazy"
                        decoding="async"
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 line-clamp-2 hover:text-cyan-400 transition-colors">
                            <Link 
                              to={`/products/${item.productId}`} 
                              onClick={closeCartDrawer}
                            >
                              {name}
                            </Link>
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            aria-label={`Remove ${name} from cart`}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {sku && <p className="text-[10px] text-cyan-400/70 mt-0.5">SKU: {sku}</p>}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-3">
                        <div className="flex items-center border border-cyan-500/30 rounded bg-[#07090e] overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold font-mono text-cyan-400">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <PriceDisplay amount={price * item.quantity} size="sm" className="font-bold text-cyan-400" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#07090e] border-t border-cyan-500/20 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <PriceDisplay amount={cartTotal} size="md" className="font-bold text-slate-200" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Freight & Logistics</span>
                  <span className="text-[11px] font-medium text-cyan-400">Calculated at Checkout</span>
                </div>
                <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-sm font-bold text-white">
                  <span>Estimated Total</span>
                  <PriceDisplay amount={cartTotal} size="lg" className="text-cyan-400 text-glow-cyan" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/cart');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-black rounded text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.7)] flex items-center justify-center gap-2"
                >
                  <span>Proceed to Full Cart & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/bulk-quote');
                  }}
                  className="w-full py-2.5 bg-[#0b0f19] border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 rounded text-xs font-bold transition-colors text-center"
                >
                  Convert Cart to RFQ
                </button>
              </div>

              <div className="pt-2 border-t border-cyan-500/20 flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>ISO 9001 Industrial Certified Industrial Procurement</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
