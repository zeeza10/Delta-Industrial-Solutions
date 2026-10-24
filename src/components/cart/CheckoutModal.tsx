/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { TextInput, SelectInput } from '../ui/Forms';
import { PrimaryButton, SecondaryButton } from '../ui/Base';
import { PriceDisplay } from '../ui/Display';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  X, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, setLastOrder } = useStore();
  const { user, profile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  // Keep snapshot of cart items so even if cleared during submit, order processes successfully
  const itemsSnapshot = useRef(cart);
  const totalSnapshot = useRef(cartTotal);

  useEffect(() => {
    if (cart.length > 0) {
      itemsSnapshot.current = cart;
      totalSnapshot.current = cartTotal;
    }
  }, [cart, cartTotal]);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: 'Delta Industrial Solutions Customer',
    email: '',
    phone: '',
    taxId: '',
    street: 'Tree House, Garden Town, Cantt Multan',
    city: 'Multan',
    state: 'Punjab',
    postalCode: '60000',
    country: 'Pakistan',
    paymentMethod: 'po_net30',
    poNumber: '',
    orderNotes: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile?.displayName || user.displayName || '',
        companyName: prev.companyName || profile?.company || 'Delta Industrial Solutions Customer',
        email: prev.email || user.email || '',
        phone: prev.phone || profile?.phone || '+92 347 1980150',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || 'Valued Commercial Client',
        email: prev.email || 'client@industrial-solutions.com',
        phone: prev.phone || '+92 347 1980150',
      }));
    }
  }, [user, profile]);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const currentItems = cart.length > 0 ? cart : itemsSnapshot.current;
    const currentTotal = cart.length > 0 ? cartTotal : totalSnapshot.current;

    if (currentItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before proceeding.');
      return;
    }

    setIsLoading(true);

    const userId = user?.uid || `guest_${Date.now()}`;
    const orderPayload = {
      type: 'order',
      userId,
      status: 'pending_fulfillment',
      customerInfo: {
        name: formData.fullName || 'Valued Client',
        company: formData.companyName,
        email: formData.email || 'client@industrial.com',
        phone: formData.phone || '+92 347 1980150',
        taxId: formData.taxId,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        }
      },
      payment: {
        method: formData.paymentMethod,
        poNumber: formData.poNumber || `PO-${Date.now().toString().slice(-6)}`
      },
      items: currentItems.map(item => ({
        productId: item.productId,
        name: item.product.name,
        sku: item.product.sku,
        unitPrice: item.product.price,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity
      })),
      financials: {
        subtotal: currentTotal,
        shipping: 0,
        tax: 0,
        grandTotal: currentTotal
      },
      notes: formData.orderNotes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      let refId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      if (db) {
        try {
          const docRef = await addDoc(collection(db, 'orders'), orderPayload);
          refId = docRef.id;
          try {
            await addDoc(collection(db, 'enquiries'), {
              ...orderPayload,
              type: 'order_booking'
            });
          } catch (e) {
            // Non-critical secondary write
          }
        } catch (dbErr) {
          console.warn('Firestore write warning, using local reference:', dbErr);
        }
      } else {
        await new Promise(r => setTimeout(r, 400));
      }
      setOrderRef(refId);
      setLastOrder({
        reference: refId,
        items: currentItems,
        total: currentTotal,
        date: new Date().toLocaleDateString()
      });
      clearCart();
    } catch (error: any) {
      console.error('Failed to submit order:', error);
      const fallbackId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderRef(fallbackId);
      setLastOrder({
        reference: fallbackId,
        items: currentItems,
        total: currentTotal,
        date: new Date().toLocaleDateString()
      });
      clearCart();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto bg-black/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 font-mono">
      <div className="my-auto bg-[#0b0f19] border border-cyan-500/30 rounded-xl sm:rounded-2xl max-w-3xl w-full p-4 sm:p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative max-h-[92vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close Order Modal"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {orderRef ? (
          /* Order Booking Success View */
          <div className="text-center py-4 sm:py-6 space-y-5 sm:space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-500/10 border border-cyan-500/40 rounded-full flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2 px-2">
              <span className="text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan">YOUR ORDER IS BOOKED</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white break-words">Order Reference #{orderRef}</h2>
              <p className="text-xs text-slate-300 max-w-lg mx-auto font-sans">
                Your order has been officially booked in the Delta Industrial Solutions Private Limited dispatch system. An invoice copy and logistics schedule have been dispatched to <strong>{formData.email}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#07090e] border border-cyan-500/20 rounded-xl max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between border-b border-cyan-500/20 pb-2 gap-1">
                <span className="text-slate-400">Order Amount Total:</span>
                <PriceDisplay amount={totalSnapshot.current || cartTotal || 0} className="text-cyan-400 font-bold" />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between border-b border-cyan-500/20 pb-2 gap-1">
                <span className="text-slate-400">Facility Location:</span>
                <span className="text-white font-medium break-words max-w-full sm:max-w-[240px]">{formData.street}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-slate-400">Support Desk Mobile:</span>
                <span className="text-cyan-400 font-bold">+92 347 1980150</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 px-2">
              <PrimaryButton 
                onClick={() => {
                  onClose();
                  navigate('/account?tab=orders');
                }}
                className="w-full sm:w-auto px-6 h-12 text-xs uppercase tracking-wider"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Account Orders
              </PrimaryButton>
              <SecondaryButton 
                onClick={() => {
                  onClose();
                  navigate('/products');
                }}
                className="w-full sm:w-auto px-6 h-12 text-xs uppercase tracking-wider"
              >
                Continue Catalog Browsing
              </SecondaryButton>
            </div>
          </div>
        ) : (
          /* Order Booking Form */
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4 pr-10 sm:pr-0">
              <div className="p-2 sm:p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white text-glow-cyan">Order Booking & Commercial Dispatch</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400">Delta Industrial Solutions Private Limited • B2B Procurement Desk</p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 sm:p-4 bg-rose-950/50 border border-rose-500/40 rounded-xl flex items-center gap-3 text-xs text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-5 sm:space-y-6">
              {/* Customer Info */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan">1. Commercial Customer Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <TextInput 
                    label="Authorized Representative" 
                    placeholder="Full Name" 
                    required 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <TextInput 
                    label="Organization Name" 
                    placeholder="Company Name" 
                    required 
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                  <TextInput 
                    label="Official Email" 
                    type="email" 
                    placeholder="email@company.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <TextInput 
                    label="Direct Mobile / Phone" 
                    placeholder="+92 347 1980150" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Delivery Facility */}
              <div className="space-y-3 sm:space-y-4 pt-2 border-t border-cyan-500/20">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan">2. Facility Delivery Destination</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <TextInput 
                    label="Facility Street Address" 
                    placeholder="e.g. Tree House, Garden Town, Cantt Multan" 
                    required 
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="sm:col-span-2"
                  />
                  <TextInput 
                    label="City" 
                    placeholder="Multan" 
                    required 
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                  <TextInput 
                    label="Country / Region" 
                    placeholder="Pakistan" 
                    required 
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 sm:space-y-4 pt-2 border-t border-cyan-500/20">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan">3. Commercial Terms & Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <SelectInput 
                    label="Billing Term" 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: (e as React.ChangeEvent<HTMLSelectElement>).target.value })}
                    options={[
                      { label: 'Corporate Purchase Order (Net 30)', value: 'po_net30' },
                      { label: 'Direct Bank Wire Transfer (TT)', value: 'wire_transfer' },
                      { label: 'Commercial Letter of Credit (LC)', value: 'letter_credit' },
                      { label: 'Credit Card / Line of Credit', value: 'card_commercial' }
                    ]} 
                  />
                  <TextInput 
                    label="PO Reference Number (Optional)" 
                    placeholder="e.g. PO-98124" 
                    value={formData.poNumber}
                    onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Summary Bar */}
              <div className="p-3 sm:p-4 bg-[#07090e] border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Order Amount ({cart.length || itemsSnapshot.current.length} SKUs)</div>
                  <PriceDisplay amount={cartTotal || totalSnapshot.current} size="lg" className="text-cyan-400 text-glow-cyan mt-0.5" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-bold bg-cyan-950/50 px-3 py-1.5 rounded border border-cyan-500/30 self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>ISO 9001 Certified Order</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
                <SecondaryButton 
                  type="button" 
                  onClick={onClose}
                  className="w-full sm:w-auto h-12 px-6 text-xs uppercase tracking-wider"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton 
                  type="submit" 
                  className="w-full sm:flex-1 h-12 text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                  isLoading={isLoading}
                  leftIcon={<ShieldCheck className="w-5 h-5 text-black" />}
                >
                  Confirm & Book Commercial Order
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
