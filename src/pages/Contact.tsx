/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageContainer, SectionHeading, PrimaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { TextInput, SelectInput } from '../components/ui/Forms';
import { SEO } from '../components/common/SEO';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { EnquirySuccess } from '../components/ui/EnquirySuccess';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export const Contact: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
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
          type: 'contact',
          userId: user.uid,
          status: 'pending',
          customerInfo: {
            name: formData.fullName,
            company: formData.companyName,
            email: formData.email,
            phone: formData.phone
          },
          data: {
            subject: formData.subject,
            message: formData.message
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setReference(docRef.id);
      } else {
        setReference(`CN-${Math.floor(100000 + Math.random() * 900000)}`);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setIsSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Contact Us', path: '/contact' }
  ];

  if (isSubmitted) {
    return (
      <PageContainer>
        <EnquirySuccess 
          reference={reference} 
          type="contact enquiry" 
          onReset={() => {
            setIsSubmitted(false);
            setFormData({ fullName: '', companyName: '', email: '', phone: '', subject: 'general', message: '' });
          }} 
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SEO 
        title="Contact Us | Delta Industrial Solutions Private Limited" 
        description="Get in touch with Delta Industrial Solutions Private Limited. Contact our technical desk at Tree House, Garden Town, Cantt Multan or call +92 311 6226139." 
      />
      <Breadcrumbs items={breadcrumbs} className="mb-8" />

      <SectionHeading 
        title="Contact Technical & Commercial Desk" 
        subtitle="Connect directly with our engineering support staff and procurement specialists."
        tag="24/7 SUPPORT DESK"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 font-mono">
        {/* Left Column: Official Contact Card & Interactive Map */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl industrial-card-3d space-y-6">
            <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Official Headquarters</h3>
                <p className="text-[10px] text-cyan-400 font-mono">Delta Industrial Solutions Private Limited</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Facility Address</div>
                  <div className="text-slate-400 mt-0.5">Tree House, Garden Town, Cantt Multan</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Direct Mobile / WhatsApp</div>
                  <a href="tel:+923116226139" className="text-cyan-400 font-bold hover:underline mt-0.5 block">+92 311 6226139</a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Commercial Email</div>
                  <a href="mailto:info@deltaindustrial.com" className="text-cyan-400 font-bold hover:underline mt-0.5 block">info@deltaindustrial.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Operating Hours</div>
                  <div className="text-slate-400 mt-0.5">Mon - Sat: 08:30 - 18:00 (PKT)</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-cyan-950/40 border border-cyan-500/20 rounded-xl flex items-center gap-3 text-[11px] text-slate-300">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>ISO 9001 Certified Electrical Distribution Network</span>
            </div>
          </div>

          {/* Interactive Google Map Card */}
          <div className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl industrial-card-3d space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-widest px-2">
              <span>Headquarters Location</span>
              <span className="text-[9px] text-slate-400 font-mono">Multan, Pakistan</span>
            </div>
            <div className="w-full h-64 rounded-xl overflow-hidden border border-cyan-500/20 relative">
              <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyC4AnOrnnsK1WV0v96zd0syCT8tK7T4o5g"}>
                <Map
                  defaultCenter={{ lat: 30.1984, lng: 71.4687 }}
                  defaultZoom={15}
                  mapId="DEMO_MAP_ID"
                  style={{ width: '100%', height: '100%' }}
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                >
                  <AdvancedMarker position={{ lat: 30.1984, lng: 71.4687 }}>
                    <Pin background={'#00f0ff'} borderColor={'#004852'} glyphColor={'#000000'} />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan border-b border-cyan-500/20 pb-4">
              Send Direct Communication
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput 
                label="Full Name" 
                placeholder="Your name" 
                required 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <TextInput 
                label="Company Name" 
                placeholder="Company / Organization" 
                required 
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
              <TextInput 
                label="Business Email" 
                type="email" 
                placeholder="name@company.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextInput 
                label="Phone / Mobile" 
                placeholder="+92 311 6226139" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <SelectInput 
              label="Inquiry Category" 
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: (e as React.ChangeEvent<HTMLSelectElement>).target.value })}
              options={[
                { label: 'General Procurement Inquiry', value: 'general' },
                { label: 'Switchgear & Panel Consultation', value: 'switchgear' },
                { label: 'Power Cable Schedule Tender', value: 'cables' },
                { label: 'Custom B2B Project Pricing', value: 'pricing' },
                { label: 'After-Sales Technical Support', value: 'support' }
              ]} 
            />

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider text-glow-cyan">
                Message / Technical Scope
              </label>
              <textarea 
                required
                className="w-full p-4 bg-[#07090e] border border-cyan-500/30 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 min-h-[140px] focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none font-mono"
                placeholder="Describe your electrical requirement, SKU quantities, or project details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <PrimaryButton 
              type="submit" 
              className="w-full h-14 text-sm font-bold uppercase tracking-wider gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              isLoading={isLoading}
              leftIcon={<Send className="w-5 h-5 text-black" />}
            >
              Dispatch Inquiry
            </PrimaryButton>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};
