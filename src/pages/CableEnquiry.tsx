/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageContainer, SectionHeading, PrimaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { TextInput, SelectInput } from '../components/ui/Forms';
import { Trash2, Plus, Send, AlertCircle, Zap, MapPin, Layers } from 'lucide-react';
import { EnquirySuccess } from '../components/ui/EnquirySuccess';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SEO } from '../components/common/SEO';

interface CableRow {
  id: string;
  type: string;
  cores: string;
  size: string; // Cross-sectional area
  voltage: string;
  length: string;
  quantity: string;
}

export const CableEnquiry: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    deliveryLocation: '',
    conductorMaterial: 'cu',
    insulation: 'xlpe',
    standard: 'iec',
    specialNotes: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile?.displayName || user.displayName || '',
        company: prev.company || profile?.company || '',
        email: prev.email || user.email || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [user, profile]);

  const [rows, setRows] = useState<CableRow[]>([
    { id: '1', type: '', cores: '', size: '', voltage: '', length: '', quantity: '1' }
  ]);

  const addRow = () => {
    setRows([...rows, { 
      id: Math.random().toString(36).substr(2, 9), 
      type: '', 
      cores: '', 
      size: '', 
      voltage: '', 
      length: '', 
      quantity: '1' 
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof CableRow, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
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
          type: 'cable',
          userId: user.uid,
          status: 'pending',
          customerInfo: {
            name: formData.fullName,
            company: formData.company,
            email: formData.email,
            phone: formData.phone,
            deliveryLocation: formData.deliveryLocation
          },
          data: {
            cables: rows.map(r => ({ ...r })),
            conductorMaterial: formData.conductorMaterial,
            insulation: formData.insulation,
            standard: formData.standard,
            specialNotes: formData.specialNotes
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setReference(docRef.id);
      } else {
        setReference(`CE-${Math.floor(100000 + Math.random() * 900000)}`);
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
          type="cable quotation request" 
          onReset={() => {
            setIsSubmitted(false);
            setRows([{ id: '1', type: '', cores: '', size: '', voltage: '', length: '', quantity: '1' }]);
          }} 
        />
      </PageContainer>
    );
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Cable Enquiry', path: '/cable-enquiry' }
  ];

  return (
    <PageContainer>
      <SEO 
        title="Specialist Cable Quotations & Schedules | Industrial Cabling"
        description="Technical specifications, drum cut lengths, and pricing for MV/LV power, armoured SWA, and instrumentation cables."
      />
      <Breadcrumbs items={breadcrumbs} className="mb-8" />
      
      <div className="max-w-6xl mx-auto">
        <SectionHeading 
          title="Specialist Cable Enquiry" 
          subtitle="Get technical pricing for MV/LV power, instrumentation, and control cables."
        />

        <form onSubmit={handleSubmit} className="space-y-12 font-mono">
          {/* Section 1: Contact Information */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-glow-cyan flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> 1. CONTACT & LOGISTICS
            </h3>
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
                placeholder="Organization / Contractor" 
                required 
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                placeholder="+92 347 1980150" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="md:col-span-2">
                <TextInput 
                  label="Delivery Location / Port" 
                  placeholder="City, Country or Project Site Address" 
                  required 
                  value={formData.deliveryLocation}
                  onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Cable Specifications */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-cyan-500/20 pb-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> 2. CABLE SPECIFICATIONS
              </h3>
              <button 
                type="button" 
                onClick={addRow}
                className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 hover:text-cyan-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Cable Row
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-8 px-8 pb-4">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="text-left border-b border-cyan-500/20">
                    <th className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-3 w-1/4">Cable Type / Description</th>
                    <th className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-3 px-2">Cores</th>
                    <th className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-3 px-2">Size (mm²)</th>
                    <th className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-3 px-2">Voltage</th>
                    <th className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-3 px-2">Length (m)</th>
                    <th className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-3 px-2">Qty</th>
                    <th className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {rows.map((row) => (
                    <tr key={row.id} className="group">
                      <td className="py-2 pr-2">
                        <input 
                          className="w-full h-10 px-3 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          placeholder="e.g. XLPE/SWA/PVC"
                          value={row.type}
                          onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                          required
                        />
                      </td>
                      <td className="py-2 px-2 w-24">
                        <input 
                          className="w-full h-10 px-3 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          placeholder="e.g. 4C"
                          value={row.cores}
                          onChange={(e) => updateRow(row.id, 'cores', e.target.value)}
                          required
                        />
                      </td>
                      <td className="py-2 px-2 w-24">
                        <input 
                          className="w-full h-10 px-3 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          placeholder="e.g. 35"
                          value={row.size}
                          onChange={(e) => updateRow(row.id, 'size', e.target.value)}
                          required
                        />
                      </td>
                      <td className="py-2 px-2 w-32">
                        <select 
                          className="w-full h-10 px-3 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                          value={row.voltage}
                          onChange={(e) => updateRow(row.id, 'voltage', e.target.value)}
                          required
                        >
                          <option value="" className="bg-[#0b0f19]">Select...</option>
                          <option value="600/1000V" className="bg-[#0b0f19]">600/1000V</option>
                          <option value="6/10kV" className="bg-[#0b0f19]">6/10kV</option>
                          <option value="12/20kV" className="bg-[#0b0f19]">12/20kV</option>
                          <option value="18/30kV" className="bg-[#0b0f19]">18/30kV</option>
                          <option value="Special" className="bg-[#0b0f19]">Other / Special</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 w-28">
                        <input 
                          type="number"
                          className="w-full h-10 px-3 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          placeholder="Length"
                          value={row.length}
                          onChange={(e) => updateRow(row.id, 'length', e.target.value)}
                          required
                        />
                      </td>
                      <td className="py-2 px-2 w-20">
                        <input 
                          type="number"
                          className="w-full h-10 px-3 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                          required
                        />
                      </td>
                      <td className="py-2 pl-2">
                        <button 
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="h-10 w-10 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Technical Details */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-glow-cyan flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> 3. ADDITIONAL REQUIREMENTS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <SelectInput 
                  label="Conductor Material" 
                  value={formData.conductorMaterial}
                  onChange={(e) => setFormData({ ...formData, conductorMaterial: (e as React.ChangeEvent<HTMLSelectElement>).target.value })}
                  options={[
                    { label: 'Copper (Cu)', value: 'cu' },
                    { label: 'Aluminum (Al)', value: 'al' },
                    { label: 'Tinned Copper', value: 'tinned' }
                  ]} 
                />
                <SelectInput 
                  label="Insulation / Sheath" 
                  value={formData.insulation}
                  onChange={(e) => setFormData({ ...formData, insulation: (e as React.ChangeEvent<HTMLSelectElement>).target.value })}
                  options={[
                    { label: 'PVC', value: 'pvc' },
                    { label: 'XLPE', value: 'xlpe' },
                    { label: 'LSZH (Low Smoke Zero Halogen)', value: 'lszh' },
                    { label: 'EPR Rubber', value: 'epr' }
                  ]} 
                />
                <SelectInput 
                  label="Standard" 
                  value={formData.standard}
                  onChange={(e) => setFormData({ ...formData, standard: (e as React.ChangeEvent<HTMLSelectElement>).target.value })}
                  options={[
                    { label: 'IEC Standards', value: 'iec' },
                    { label: 'BS (British Standards)', value: 'bs' },
                    { label: 'UL (Underwriters Laboratories)', value: 'ul' },
                    { label: 'VDE (German Standards)', value: 'vde' }
                  ]} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-200">Special Notes / Armouring / Screening</label>
                <textarea 
                  className="w-full p-4 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 min-h-[180px] focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none font-mono"
                  placeholder="Specify SWA/AWA requirement, individual/overall screening, or specific jacket colors..."
                  value={formData.specialNotes}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-6 pt-4">
            <PrimaryButton 
              type="submit" 
              className="h-14 text-base gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] uppercase tracking-wider"
              isLoading={isLoading}
              leftIcon={<Send className="w-5 h-5 text-black" />}
            >
              Submit Cable Schedule
            </PrimaryButton>
            
            <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-[11px] text-slate-300 leading-relaxed font-medium">
                <strong className="text-cyan-400">CABLE DESK SERVICE:</strong> Our certified cable technical specialists evaluate all conductor sizing, insulation ratings, and drum cut schedules. Formal written quotes dispatched within 2-4 business hours.
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

