/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageContainer, SectionHeading, PrimaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { TextInput, SelectInput } from '../components/ui/Forms';
import { Send, AlertCircle, Upload, FileText } from 'lucide-react';
import { EnquirySuccess } from '../components/ui/EnquirySuccess';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SEO } from '../components/common/SEO';

export const ProjectEnquiry: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState('');
  
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'commercial',
    location: '',
    startDate: '',
    timeline: 'immediate',
    scope: '',
    fullName: '',
    companyName: '',
    email: '',
    phone: ''
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
          type: 'project',
          userId: user.uid,
          status: 'pending',
          customerInfo: {
            name: formData.fullName,
            company: formData.companyName,
            email: formData.email,
            phone: formData.phone
          },
          data: {
            projectName: formData.projectName,
            projectType: formData.projectType,
            location: formData.location,
            startDate: formData.startDate,
            timeline: formData.timeline,
            scope: formData.scope
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setReference(docRef.id);
      } else {
        setReference(`PE-${Math.floor(100000 + Math.random() * 900000)}`);
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
          type="project enquiry" 
          onReset={() => setIsSubmitted(false)} 
        />
      </PageContainer>
    );
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Project Enquiry', path: '/project-enquiry' }
  ];

  return (
    <PageContainer>
      <SEO 
        title="Project Quotations & Enquiries | B2B Solutions" 
        description="Comprehensive technical pricing and engineering schedules for commercial developments and infrastructure packages." 
      />
      <Breadcrumbs items={breadcrumbs} className="mb-8" />
      
      <div className="max-w-4xl mx-auto">
        <SectionHeading 
          title="Project Enquiry" 
          subtitle="Submit technical specifications for large-scale industrial or commercial developments."
        />

        <form onSubmit={handleSubmit} className="space-y-12 font-mono">
          {/* Section 1: Project Overview */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-glow-cyan">1. PROJECT DETAILS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <TextInput 
                  label="Project Name" 
                  placeholder="e.g. Skyline Office Tower Phase 2" 
                  required 
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>
              <SelectInput 
                label="Project Type" 
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: (e as React.ChangeEvent<HTMLSelectElement>).target.value })}
                options={[
                  { label: 'Commercial Construction', value: 'commercial' },
                  { label: 'Industrial / Manufacturing', value: 'industrial' },
                  { label: 'Utility / Infrastructure', value: 'utility' },
                  { label: 'Residential Development', value: 'residential' },
                  { label: 'Oil & Gas', value: 'oil-gas' }
                ]} 
              />
              <TextInput 
                label="Project Location" 
                placeholder="City, State/Region" 
                required 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <TextInput 
                label="Target Start Date" 
                type="date" 
                required 
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <SelectInput 
                label="Timeline / Urgency" 
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: (e as React.ChangeEvent<HTMLSelectElement>).target.value })}
                options={[
                  { label: 'Immediate (1-3 months)', value: 'immediate' },
                  { label: 'Short Term (3-6 months)', value: 'short' },
                  { label: 'Medium Term (6-12 months)', value: 'medium' },
                  { label: 'Planning Phase (12+ months)', value: 'planning' }
                ]} 
              />
            </div>
          </section>

          {/* Section 2: Requirements */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-glow-cyan">2. TECHNICAL SCOPE</h3>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-200">Scope of Supply & Required Components</label>
                <textarea 
                  className="w-full p-4 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 min-h-[160px] focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                  placeholder="Describe the electrical packages required (e.g. MV/LV Switchgear, Cable Containment, External Lighting...)"
                  required
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                />
              </div>

              <div className="p-8 border-2 border-dashed border-cyan-500/30 rounded-xl bg-[#07090e] flex flex-col items-center justify-center text-center group hover:border-cyan-400 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-cyan-950/50 rounded-lg flex items-center justify-center shadow-sm mb-4 border border-cyan-500/30">
                  <Upload className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Upload Project Documentation</h4>
                <p className="text-xs text-slate-400">Attach single-line diagrams, specification sheets, or BOQs (PDF/ZIP).</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  <FileText className="w-3 h-3" /> MAX 50MB
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Contact */}
          <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-4 uppercase tracking-widest text-glow-cyan">3. ORGANIZATION CONTACT</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput 
                label="Contact Full Name" 
                placeholder="Project Manager / Lead Engineer" 
                required 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <TextInput 
                label="Company Name" 
                placeholder="Engineering Firm / Contractor" 
                required 
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
              <TextInput 
                label="Professional Email" 
                type="email" 
                placeholder="name@company.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextInput 
                label="Direct Phone" 
                placeholder="+92 347 1980150" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </section>

          <div className="flex flex-col gap-6 pt-4">
            <PrimaryButton 
              type="submit" 
              className="h-14 text-base gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              isLoading={isLoading}
              leftIcon={<Send className="w-5 h-5 text-black" />}
            >
              Submit Project Enquiry
            </PrimaryButton>
            
            <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-[11px] text-slate-300 leading-relaxed font-medium">
                <strong className="text-cyan-400">PROJECT DESK GUARANTEE:</strong> Senior electrical engineering managers review all tender documents and single-line diagrams. Written bid proposals are dispatched within 24 business hours.
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

