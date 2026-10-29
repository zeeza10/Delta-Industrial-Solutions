/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { PageContainer, PrimaryButton, SecondaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Heart, 
  Package, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Loader2,
  FileCheck,
  Send,
  Eye,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface EnquiryRecord {
  id: string;
  type: 'bulk' | 'project' | 'cable' | 'quote';
  status: 'pending' | 'reviewing' | 'quoted' | 'closed';
  customerInfo: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    region?: string;
    deliveryLocation?: string;
  };
  data: Record<string, any>;
  createdAt?: any;
}

export const Account: React.FC = () => {
  const { 
    user, 
    profile, 
    isOwner,
    isAdmin,
    loading: authLoading, 
    signOut, 
    updateUserProfile, 
    sendEmailVerificationLink,
    openAuthModal 
  } = useAuth();
  const { wishlist, removeFromCart, addToCart } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Form state
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [taxId, setTaxId] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  
  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Email verification feedback
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  // Enquiries & Quotes state
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);

  // Wishlist products fetched
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Populate profile fields
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setCompany(profile.company || '');
      setPhone(profile.phone || '');
      setJobTitle(profile.jobTitle || '');
      setTaxId(profile.taxId || '');
      if (profile.shippingAddress) {
        setStreet(profile.shippingAddress.street || '');
        setCity(profile.shippingAddress.city || '');
        setState(profile.shippingAddress.state || '');
        setPostalCode(profile.shippingAddress.postalCode || '');
        setCountry(profile.shippingAddress.country || 'United States');
      }
    } else if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [profile, user]);

  // Load enquiries for this customer only
  const fetchEnquiries = async () => {
    if (!user || !db) return;
    setLoadingEnquiries(true);
    try {
      const q = query(
        collection(db, 'enquiries'),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const records: EnquiryRecord[] = [];
      snap.forEach((docSnap) => {
        records.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Sort client-side by date
      records.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setEnquiries(records);
    } catch (err) {
      console.error('Error fetching customer enquiries:', err);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    if (user && (activeTab === 'enquiries' || activeTab === 'quotes')) {
      fetchEnquiries();
    }
  }, [user, activeTab]);

  // Load wishlist items
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0 || !db) {
        setWishlistProducts([]);
        return;
      }
      setLoadingWishlist(true);
      try {
        const productsRef = collection(db, 'products');
        const snap = await getDocs(productsRef);
        const matched: any[] = [];
        snap.forEach((d) => {
          if (wishlist.includes(d.id)) {
            matched.push({ id: d.id, ...d.data() });
          }
        });
        setWishlistProducts(matched);
      } catch (e) {
        console.error('Error loading wishlist items:', e);
      } finally {
        setLoadingWishlist(false);
      }
    };

    if (activeTab === 'wishlist') {
      fetchWishlistProducts();
    }
  }, [wishlist, activeTab]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const res = await updateUserProfile({
      displayName,
      company,
      phone,
      jobTitle,
      taxId,
      shippingAddress: {
        street,
        city,
        state,
        postalCode,
        country
      }
    });

    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setSaveError(res.error || 'Failed to update profile.');
    }
  };

  const handleSendVerification = async () => {
    setIsVerifying(true);
    setVerifyNotice(null);
    const res = await sendEmailVerificationLink();
    setIsVerifying(false);
    if (res.success) {
      setVerifyNotice('Verification email sent! Please check your inbox.');
    } else {
      setVerifyNotice(res.error || 'Failed to send verification email.');
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Recently';
    if (ts.toDate) {
      return ts.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    if (typeof ts === 'string') {
      return new Date(ts).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return 'Recently';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-500" />
            Technical Review
          </span>
        );
      case 'quoted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Proposal Ready
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bulk':
        return 'Bulk Equipment Quotation';
      case 'project':
        return 'Project Specification';
      case 'cable':
        return 'Cable Schedule Procurement';
      case 'quote':
        return 'Catalog Item Quotation';
      default:
        return 'Procurement Enquiry';
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <PageContainer>
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading your account...</p>
        </div>
      </PageContainer>
    );
  }

  // Protected route state: Unauthenticated user
  if (!user) {
    return (
      <PageContainer>
        <SEO title="Commercial Customer Portal" noIndex={true} />
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Customer Portal', path: '/account' }]} className="mb-8" />
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Commercial Customer Portal</h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Please sign in to access your organization's technical proposals, custom quotations, enquiry status tracking, and account settings.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton 
              onClick={() => openAuthModal('signin')}
              className="w-full sm:w-auto px-8"
              leftIcon={<User className="w-4 h-4" />}
            >
              Sign In
            </PrimaryButton>
            <SecondaryButton 
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-8"
            >
              Register Company
            </SecondaryButton>
          </div>
          <p className="text-xs text-slate-400">
            Delta Industrial Solutions respects confidentiality for industrial tenders and procurement data.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SEO title="Customer Account" noIndex={true} />
      <Breadcrumbs 
        items={[
          { label: 'Home', path: '/' }, 
          { label: 'Customer Account', path: '/account' }
        ]} 
        className="mb-6" 
      />

      {/* Top Banner with Account Overview */}
      <div className="bg-navy text-white rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-md border border-border-dark">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-teal text-2xl font-bold font-mono">
              {(profile?.displayName || user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {profile?.displayName || user.displayName || 'Authorized Representative'}
                </h1>
                {isOwner ? (
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-900 font-bold text-[10px] rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    System Owner
                  </span>
                ) : isAdmin ? (
                  <span className="px-2 py-0.5 bg-teal text-navy font-bold text-[10px] rounded uppercase tracking-wider">
                    Administrator
                  </span>
                ) : null}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-1">
                <span>{user.email}</span>
                {profile?.company && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="font-semibold text-slate-200">{profile.company}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3.5 py-2 bg-gradient-to-r from-teal to-cyan-500 hover:from-cyan-400 hover:to-teal text-navy font-bold rounded-lg text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>VIP Admin Panel</span>
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 border border-white/15 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Email Verification Banner */}
        {!user.emailVerified && (
          <div className="mt-6 p-4 bg-teal/15 border border-teal/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <AlertCircle className="w-4 h-4 text-teal shrink-0" />
              <span>
                Your email address is pending verification. Please verify your address for priority commercial quote processing.
              </span>
            </div>
            <button
              onClick={handleSendVerification}
              disabled={isVerifying}
              className="text-xs font-bold text-teal hover:text-white underline whitespace-nowrap disabled:opacity-50"
            >
              {isVerifying ? 'Sending link...' : 'Resend Verification Link'}
            </button>
          </div>
        )}
        {verifyNotice && (
          <div className="mt-2 text-xs text-teal font-medium">
            {verifyNotice}
          </div>
        )}
      </div>

      {/* Main Layout: Tabs Nav + Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 font-mono">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <nav className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-xl p-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-1">
            <button
              onClick={() => setSearchParams({ tab: 'profile' })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400'
              }`}
            >
              <span className="flex items-center gap-3">
                <User className="w-4 h-4 text-cyan-400" />
                Profile & Company
              </span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setSearchParams({ tab: 'enquiries' })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400'
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-cyan-400" />
                Enquiry History
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'enquiries' ? 'bg-black/30 text-black' : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'}`}>
                {enquiries.length}
              </span>
            </button>

            <button
              onClick={() => setSearchParams({ tab: 'quotes' })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'quotes'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400'
              }`}
            >
              <span className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-cyan-400" />
                Quotations & Proposals
              </span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setSearchParams({ tab: 'wishlist' })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400'
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-purple-400" />
                Saved Wishlist
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'wishlist' ? 'bg-black/30 text-black' : 'bg-purple-950 text-purple-300 border border-purple-500/30'}`}>
                {wishlist.length}
              </span>
            </button>

            <button
              onClick={() => setSearchParams({ tab: 'orders' })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400'
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4 text-cyan-400" />
                Order Records
              </span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </nav>

          <div className="bg-[#0b0f19]/80 border border-cyan-500/20 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] text-glow-cyan">
              Procurement Helpdesk
            </div>
            <p className="leading-relaxed">
              Have an urgent industrial tender or need custom switchgear engineering?
            </p>
            <div className="pt-1">
              <Link to="/contact" className="text-industrial-blue font-bold hover:underline inline-flex items-center gap-1">
                Contact Specialist <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>


        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* TAB 1: Profile & Company Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Organization & Profile Information</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your authorized company details, billing preferences, and contact information.
                </p>
              </div>

              {saveSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Profile changes have been successfully saved to your Delta Industrial account.</span>
                </div>
              )}

              {saveError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Authorized Representative
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 bg-[#07090e] border border-[#161b22] rounded-lg text-sm text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Work Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email || ''}
                        className="w-full px-3.5 py-2.5 bg-[#0b0f17] border border-[#161b22] rounded-lg text-sm text-slate-500 cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Account email cannot be modified directly.
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Direct Phone / Extension
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3.5 py-2.5 bg-[#07090e] border border-[#161b22] rounded-lg text-sm text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Job Title / Department
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Procurement Engineer"
                        className="w-full px-3.5 py-2.5 bg-[#07090e] border border-[#161b22] rounded-lg text-sm text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Corporate & Tax Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Delta Engineering Inc."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tax ID / VAT Registration #
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="XX-XXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Default Delivery / Site Facility Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Street Address / Industrial Park / Bay
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="450 Industrial Parkway, Suite 100"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Houston"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          State / Province
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="TX"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Postal / Zip Code
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="77001"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="United States"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <PrimaryButton
                    type="submit"
                    disabled={isSaving}
                    leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  >
                    {isSaving ? 'Saving Updates...' : 'Save Profile Changes'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Enquiry History */}
          {activeTab === 'enquiries' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Procurement Enquiries & Requests</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Track the lifecycle and status of all bulk quotes, project tenders, and cable schedules submitted by your account.
                  </p>
                </div>
                <button
                  onClick={fetchEnquiries}
                  disabled={loadingEnquiries}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingEnquiries ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loadingEnquiries ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-xs text-slate-400">Loading your enquiry records...</p>
                </div>
              ) : enquiries.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">No Enquiries Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      You haven't submitted any procurement requests yet. Submit a bill of materials or project specification to request pricing.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Link to="/bulk-quote">
                      <PrimaryButton size="sm">Submit Bulk Quote</PrimaryButton>
                    </Link>
                    <Link to="/project-enquiry">
                      <SecondaryButton size="sm">Project Tender</SecondaryButton>
                    </Link>
                    <Link to="/cable-enquiry">
                      <SecondaryButton size="sm">Cable Schedule</SecondaryButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-primary/40 hover:shadow-sm transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            REF #{item.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {formatTimestamp(item.createdAt)}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {getTypeLabel(item.type)}
                        </h4>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                          {item.customerInfo?.company && (
                            <span>Company: <strong className="text-slate-700">{item.customerInfo.company}</strong></span>
                          )}
                          {item.data?.lines && (
                            <span>Items: <strong className="text-slate-700">{item.data.lines.length} Line items</strong></span>
                          )}
                          {item.data?.cables && (
                            <span>Schedules: <strong className="text-slate-700">{item.data.cables.length} Cable runs</strong></span>
                          )}
                          {item.data?.projectName && (
                            <span>Project: <strong className="text-slate-700">{item.data.projectName}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => setSelectedEnquiry(item)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Quotes & Proposals */}
          {activeTab === 'quotes' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Quotations & Commercial Offers</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Review formal price quotes provided by Delta Industrial engineering specialists.
                </p>
              </div>

              {loadingEnquiries ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-xs text-slate-400">Loading proposals...</p>
                </div>
              ) : (
                (() => {
                  const quoteRecords = enquiries.filter(e => e.status === 'quoted' || e.type === 'quote' || e.type === 'bulk');
                  if (quoteRecords.length === 0) {
                    return (
                      <div className="py-12 text-center space-y-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                          <ClipboardList className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-slate-800">No Formal Quotations Ready</h3>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            When our technical desk completes engineering review of your bill of materials, formal PDF and line-item quotations will be posted here.
                          </p>
                        </div>
                        <div className="pt-2">
                          <Link to="/quotes">
                            <PrimaryButton size="sm">Manage Active Quote Cart</PrimaryButton>
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {quoteRecords.map((item) => (
                        <div key={item.id} className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900">
                                PROPOSAL #{item.id.slice(0, 8).toUpperCase()}
                              </span>
                              {getStatusBadge(item.status)}
                            </div>
                            <span className="text-xs text-slate-400">
                              Submitted: {formatTimestamp(item.createdAt)}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <div className="font-bold text-sm text-slate-900">
                                {getTypeLabel(item.type)}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Technical Representative: Assigned to B2B Industrial Desk
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedEnquiry(item)}
                              className="px-4 py-2 bg-primary hover:bg-primary-deep text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                              <FileCheck className="w-4 h-4" />
                              View Proposal Breakdown
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* TAB 4: Saved Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Saved Equipment Wishlist</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Keep track of components and switchgear for future project specifications.
                  </p>
                </div>
                <Link to="/wishlist" className="text-xs font-bold text-primary hover:underline">
                  Go to Wishlist Page →
                </Link>
              </div>

              {wishlist.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">Your Wishlist is Empty</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Explore our electrical and automation catalog and save items with the bookmark icon.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link to="/products">
                      <PrimaryButton size="sm">Explore Catalog</PrimaryButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-4 flex gap-4 hover:border-slate-300 transition-all">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg p-2 shrink-0 flex items-center justify-center">
                        <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          <Link to={`/products/${p.id}`} className="hover:text-primary">
                            {p.name}
                          </Link>
                        </h4>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {p.sku}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-primary text-white text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Order Records */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Purchase Orders & Shipments</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Official commercial procurement orders and delivery fulfillment status.
                </p>
              </div>

              {/* Authentic B2B Order Flow Notice (No fake orders invented) */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal/10 text-teal rounded-lg flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">B2B Purchase Order Processing</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      As an industrial equipment distributor, Delta Industrial Solutions handles commercial procurement orders against verified quotations, signed purchase orders (PO), or credit terms. We do not generate mock consumer credit card orders.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block mb-1">1. Request Quotation</span>
                    <span className="text-slate-500 text-[11px]">Submit your required BOM or project specs for engineering review.</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block mb-1">2. Approve Proposal</span>
                    <span className="text-slate-500 text-[11px]">Receive firm pricing, lead times, and freight terms from your assigned engineer.</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block mb-1">3. Issue Purchase Order</span>
                    <span className="text-slate-500 text-[11px]">Issue your formal corporate PO to order@deltaindustrial.com for fulfillment.</span>
                  </div>
                </div>
              </div>

              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">No Active Commercial Orders</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Once a signed PO is matched to your account, live fulfillment tracking, bill of lading (BOL), and dispatch updates will appear here.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enquiry Detail Drawer / Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase text-teal font-bold">
                    REF #{selectedEnquiry.id.slice(0, 10).toUpperCase()}
                  </span>
                  {getStatusBadge(selectedEnquiry.status)}
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {getTypeLabel(selectedEnquiry.type)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submitted: {formatTimestamp(selectedEnquiry.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer Contact */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Contact Information
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div><strong>Name:</strong> {selectedEnquiry.customerInfo?.name || 'N/A'}</div>
                  <div><strong>Company:</strong> {selectedEnquiry.customerInfo?.company || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedEnquiry.customerInfo?.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {selectedEnquiry.customerInfo?.phone || 'N/A'}</div>
                </div>
              </div>

              {/* Data payload according to type */}
              {selectedEnquiry.data?.lines && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Line Items ({selectedEnquiry.data.lines.length})
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Description / Specification</th>
                          <th className="p-3">Brand</th>
                          <th className="p-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedEnquiry.data.lines.map((l: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="p-3 font-medium text-slate-800">{l.description || 'Custom line'}</td>
                            <td className="p-3 text-slate-600">{l.brand || 'Any compliant'}</td>
                            <td className="p-3 text-right font-bold text-slate-900">{l.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedEnquiry.data?.cables && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Cable Specifications ({selectedEnquiry.data.cables.length})
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Cores / Size</th>
                          <th className="p-2.5">Voltage</th>
                          <th className="p-2.5">Length</th>
                          <th className="p-2.5 text-right">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedEnquiry.data.cables.map((c: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-slate-800">{c.type || 'Standard'}</td>
                            <td className="p-2.5 text-slate-700">{c.cores}C x {c.size} mm²</td>
                            <td className="p-2.5 text-slate-700">{c.voltage || '600/1000V'}</td>
                            <td className="p-2.5 text-slate-700">{c.length} meters</td>
                            <td className="p-2.5 text-right font-bold text-slate-900">{c.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedEnquiry.data?.projectName && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Project Scope & Details
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-slate-700">
                    <div><strong>Project:</strong> {selectedEnquiry.data.projectName}</div>
                    <div><strong>Type:</strong> {selectedEnquiry.data.projectType}</div>
                    <div><strong>Location:</strong> {selectedEnquiry.data.location || 'N/A'}</div>
                    <div><strong>Timeline:</strong> {selectedEnquiry.data.timeline}</div>
                  </div>
                  {selectedEnquiry.data.scope && (
                    <div className="pt-2 text-slate-600">
                      <strong>Scope:</strong> {selectedEnquiry.data.scope}
                    </div>
                  )}
                </div>
              )}

              {selectedEnquiry.data?.notes && (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
                  <strong>Notes:</strong> {selectedEnquiry.data.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                To update this request, reply to your assigned project coordinator with your REF ID.
              </span>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
