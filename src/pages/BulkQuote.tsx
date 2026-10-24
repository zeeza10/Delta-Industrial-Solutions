/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageContainer, SectionHeading, PrimaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { TextInput, SelectInput } from '../components/ui/Forms';
import { Trash2, Plus, Send, AlertCircle, Upload, FileText } from 'lucide-react';
import { EnquirySuccess } from '../components/ui/EnquirySuccess';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SEO } from '../components/common/SEO';

interface QuoteLine {
  id: string;
  description: string;
  quantity: string;
  brand?: string;
}

export const BulkQuote: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [lines, setLines] = useState<QuoteLine[]>([
    { id: '1', description: '', quantity: '1' }
  ]);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    region: 'us',
    notes: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile?.displayName || user.displayName || '',
        companyName: prev.companyName || profile?.company || '',
        email: prev.email || user.email || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [user, profile]);

  const addLine = () => {
    setLines([...lines, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: '1' }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof QuoteLine, value: string) => {
    setLines(lines.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }

    setIsLoading(true);

    try {
      if (db) {
        const docRef = await addDoc(collection(db, 'enquiries'), {
          type: 'bulk',
          userId: user.uid,
          status: 'pending',
          customerInfo: {
            name: formData.fullName,
            company: formData.companyName,
            email: formData.email,
            phone: formData.phone,
            region: formData.region
          },
          data: {
            lines: lines.map(l => ({ description: l.description, quantity: l.quantity, brand: l.brand })),
            notes: formData.notes,
            attachment: attachedFile
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setReference(docRef.id);
      } else {
        // Fallback for demo
        setReference(`BQ-${Math.floor(100000 + Math.random() * 900000)}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setIsSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <PageContainer>
        <EnquirySuccess 
          reference={reference} 
          type="bulk quotation request" 
          onReset={() => {
            setIsSubmitted(false);
            setLines([{ id: '1', description: '', quantity: '1' }]);
            setAttachedFile(null);
          }} 
        />
      </PageContainer>
    );
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Bulk Quote', path: '/bulk-quote' }
  ];

  return (
    <PageContainer>
      <SEO 
        title="Bulk Quotation Request | B2B Procurement" 
        description="Submit complete bills of materials and high-volume electrical equipment lists for competitive contractor pricing." 
      />
      <Breadcrumbs items={breadcrumbs} className="mb-8" />
      
      <div className="max-w-4xl mx-auto">
        <SectionHeading 
          title="Bulk Quotation Request" 
          subtitle="Submit a list of products for volume pricing and technical review."
        />

        <form onSubmit={handleSubmit} className="space-y-12 font-mono">
          {/* Section 1: Contact */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-glow-cyan">1. CONTACT INFORMATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput 
                label="Full Name" 
                placeholder="Contact person" 
                required 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <TextInput 
                label="Company Name" 
                placeholder="Organization" 
                required 
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
              <TextInput 
                label="Business Email" 
                type="email" 
                placeholder="professional@company.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextInput 
                label="Phone Number" 
                placeholder="+1 (555) 000-0000" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <SelectInput 
                label="Region / Country" 
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: (e as React.ChangeEvent<HTMLSelectElement>).target.value })}
                options={[
                  { label: 'United States', value: 'us' },
                  { label: 'Canada', value: 'ca' },
                  { label: 'United Kingdom', value: 'uk' },
                  { label: 'Other', value: 'other' }
                ]} 
              />
            </div>
          </section>

          {/* Section 2: Product List */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6 border-b border-cyan-500/20 pb-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan">2. REQUIRED PRODUCTS</h3>
              <button 
                type="button" 
                onClick={addLine}
                className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add Line
              </button>
            </div>
            
            <div className="space-y-4">
              {lines.map((line, idx) => (
                <div key={line.id} className="flex flex-col sm:flex-row gap-4 items-end animate-in slide-in-from-left-2 duration-200">
                  <div className="flex-grow min-w-0 w-full">
                    {idx === 0 ? (
                      <label htmlFor={`bulk-desc-${line.id}`} className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">Product Description / SKU</label>
                    ) : (
                      <label htmlFor={`bulk-desc-${line.id}`} className="sr-only">{`Item ${idx + 1} Description`}</label>
                    )}
                    <input 
                      id={`bulk-desc-${line.id}`}
                      className="w-full h-11 px-4 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      placeholder="e.g. MCB 16A 3-Pole Type C"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      aria-label={`Product description for item ${idx + 1}`}
                      required
                    />
                  </div>
                  <div className="w-full sm:w-24 shrink-0">
                    {idx === 0 ? (
                      <label htmlFor={`bulk-qty-${line.id}`} className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">Qty</label>
                    ) : (
                      <label htmlFor={`bulk-qty-${line.id}`} className="sr-only">{`Item ${idx + 1} Quantity`}</label>
                    )}
                    <input 
                      id={`bulk-qty-${line.id}`}
                      type="number"
                      min="1"
                      className="w-full h-11 px-4 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                      aria-label={`Quantity for item ${idx + 1}`}
                      required
                    />
                  </div>
                  <div className="w-full sm:w-40 shrink-0">
                    {idx === 0 ? (
                      <label htmlFor={`bulk-brand-${line.id}`} className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">Pref. Brand</label>
                    ) : (
                      <label htmlFor={`bulk-brand-${line.id}`} className="sr-only">{`Item ${idx + 1} Preferred Brand`}</label>
                    )}
                    <input 
                      id={`bulk-brand-${line.id}`}
                      className="w-full h-11 px-4 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      placeholder="Optional"
                      value={line.brand}
                      onChange={(e) => updateLine(line.id, 'brand', e.target.value)}
                      aria-label={`Preferred brand for item ${idx + 1}`}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeLine(line.id)}
                    aria-label={`Remove item ${idx + 1}`}
                    className="h-11 px-3 text-slate-500 hover:text-rose-400 transition-colors flex items-center justify-center border border-cyan-500/20 hover:border-rose-500/40 rounded-lg shrink-0 self-end"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Notes & Files */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-glow-cyan">3. TECHNICAL NOTES & ATTACHMENTS</h3>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-200">Additional Requirements</label>
                <textarea 
                  className="w-full p-4 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 min-h-[120px] focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                  placeholder="Tell us more about project deadlines, certificates needed, or packaging requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="relative p-8 border-2 border-dashed border-cyan-500/30 rounded-xl bg-[#07090e] flex flex-col items-center justify-center text-center group hover:border-cyan-400 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachedFile(file.name);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  aria-label="Upload BOM or specification file"
                />
                <div className="w-12 h-12 bg-cyan-950/50 rounded-lg flex items-center justify-center shadow-sm mb-4 border border-cyan-500/30">
                  <Upload className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {attachedFile ? `Attached File: ${attachedFile}` : 'Upload BOM / Specifications'}
                </h4>
                <p className="text-xs text-slate-400">
                  {attachedFile ? 'Click or drop another file to replace' : 'Drag and drop your PDF or Excel file here, or click to browse.'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  <FileText className="w-3 h-3" /> {attachedFile ? 'FILE ATTACHED & READY' : 'MAX 10MB'}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-6 pt-4">
            <PrimaryButton 
              type="submit" 
              className="h-14 text-base gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              isLoading={isLoading}
              leftIcon={<Send className="w-5 h-5 text-black" />}
            >
              Submit Quotation Request
            </PrimaryButton>
            
            <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-[11px] text-slate-300 leading-relaxed font-medium">
                <strong className="text-cyan-400">INDUSTRIAL ENGINEERING DESK:</strong> Your formal quotation request will be evaluated by our senior electrical procurement team. Written quotes are dispatched within 24 business hours.
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

