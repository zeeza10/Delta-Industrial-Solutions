/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, PrimaryButton, SecondaryButton } from '../components/ui/Base';
import { Breadcrumbs, PriceDisplay } from '../components/ui/Display';
import { QuantitySelector, TextInput } from '../components/ui/Forms';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ClipboardList, Trash2, ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '../components/ui/States';
import { EnquirySuccess } from '../components/ui/EnquirySuccess';
import { SEO } from '../components/common/SEO';

export const QuoteList: React.FC = () => {
  const { quotes, removeFromQuote, updateQuoteQuantity, updateQuoteNotes, clearQuote } = useStore();
  const { user, profile, openAuthModal } = useAuth();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    requirements: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile?.displayName || user.displayName || '',
        companyName: prev.companyName || profile?.company || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user, profile]);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Quotation List', path: '/quotes' }
  ];

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal('signin');
      return;
    }

    setIsLoading(true);

    try {
      if (db) {
        const docRef = await addDoc(collection(db, 'enquiries'), {
          type: 'quote',
          userId: user.uid,
          status: 'pending',
          customerInfo: {
            name: formData.fullName,
            company: formData.companyName,
            email: formData.email
          },
          data: {
            lines: quotes.map(item => ({
              productId: item.productId,
              name: item.product.name,
              sku: item.product.sku,
              quantity: item.quantity,
              unitPrice: item.product.price || null,
              notes: item.notes || ''
            })),
            requirements: formData.requirements
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setReference(docRef.id);
      } else {
        setReference(`QT-${Math.floor(100000 + Math.random() * 900000)}`);
      }

      setIsSubmitted(true);
      clearQuote();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <PageContainer>
        <EnquirySuccess
          reference={reference}
          type="formal quotation request"
          onReset={() => setIsSubmitted(false)}
        />
      </PageContainer>
    );
  }

  if (quotes.length === 0) {
    return (
      <PageContainer>
        <SEO title="Project Quotation List" description="Review items selected for formal commercial quotation." />
        <Breadcrumbs items={breadcrumbs} className="mb-8" />
        <EmptyState 
          title="Your quotation list is empty" 
          message="Need pricing for a project? Add items to your quote list to request a formal proposal from our technical team."
          action={<Link to="/products"><PrimaryButton>Browse Catalog</PrimaryButton></Link>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SEO title={`Quotation List (${quotes.length} Items)`} description="Submit your project quotation request to Delta Industrial." />
      <Breadcrumbs items={breadcrumbs} className="mb-8" />
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Items */}
        <div className="flex-grow space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-text-primary">Quotation List ({quotes.length} Items)</h1>
            <button 
              onClick={clearQuote}
              className="text-xs font-bold text-text-secondary hover:text-error transition-colors uppercase tracking-wider"
            >
              Clear List
            </button>
          </div>

          <div className="divide-y divide-border">
            {quotes.map((item) => (
              <div key={item.productId} className="py-8 space-y-6">
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="w-24 h-24 bg-white border border-border rounded-lg p-3 shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-text-primary hover:text-primary transition-colors text-sm sm:text-base">
                          <Link to={`/products/${item.productId}`}>{item.product.name}</Link>
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">SKU: {item.product.sku}</p>
                      </div>
                      <PriceDisplay amount={item.product.price} size="md" className="text-slate-400" />
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Quantity</label>
                        <QuantitySelector 
                          value={item.quantity} 
                          onChange={(val) => updateQuoteQuantity(item.productId, val)} 
                        />
                      </div>
                      <button 
                        onClick={() => removeFromQuote(item.productId)}
                        className="p-2 text-slate-300 hover:text-error transition-colors self-end mb-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#07090e] p-4 rounded-lg">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">Item-specific project notes</label>
                  <textarea 
                    className="w-full p-3 bg-[#0b0f19] border border-cyan-500/20 rounded text-sm text-white min-h-[60px] focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                    placeholder="e.g. Requires custom cable length, specific voltage rating, or expedited delivery..."
                    value={item.notes || ''}
                    onChange={(e) => updateQuoteNotes(item.productId, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Add More Items
          </Link>
        </div>

        {/* Right: Submission Form */}
        <div className="lg:w-[400px] shrink-0">
          <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-8 sticky top-24 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-xs">Request Quotation</h3>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Submit your list for technical review. Our engineers will provide a formal commercial proposal within 24 business hours.
            </p>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <TextInput 
                label="Full Name" 
                required
                placeholder="Contact person" 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <TextInput 
                label="Work Email" 
                type="email" 
                required
                placeholder="professional@company.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextInput 
                label="Company Name" 
                placeholder="Your organization" 
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-white">General Project Requirements</label>
                <textarea 
                  className="w-full p-4 bg-[#0b0f19] border border-cyan-500/20 rounded-md text-sm text-white min-h-[120px] focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                  placeholder="Tell us more about your project timeline and any specific compliance needs..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>

              {!user && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span>You'll be prompted to sign in so this quote is tracked in your customer portal.</span>
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-4">
                <PrimaryButton 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 text-base" 
                  leftIcon={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                >
                  {isLoading ? 'Submitting Proposal Request...' : 'Submit Quote Request'}
                </PrimaryButton>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                    This request will be sent directly to our B2B procurement desk. No payment is required to submit a quote.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
