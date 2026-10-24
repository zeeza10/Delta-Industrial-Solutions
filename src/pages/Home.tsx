import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Zap, 
  Mail, 
  Briefcase,
  Layers,
  Factory,
  Building2,
  ShieldCheck,
  Award,
  Clock,
  FileCheck2,
  Cpu,
  Radio,
  Terminal,
  Sparkles
} from 'lucide-react';
import { PageContainer, PrimaryButton, SecondaryButton, SectionHeading, Button } from '../components/ui/Base';
import { ProductCard, CategoryCard, BrandTile } from '../components/ui/Cards';
import { Badge } from '../components/ui/Display';
import { getFeaturedProducts } from '../utils/dbQueries';
import { Product, Brand } from '../types';
import { SEO } from '../components/common/SEO';
import { Hero3DCanvas } from '../components/3d/Hero3DCanvas';
import { BRANDS } from '../data/brands';
import { BrandCarousel } from '../components/common/BrandCarousel';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);



  useEffect(() => {
    const fetchFeatured = async () => {
      const defaultProducts = [
        {
          id: 'p1',
          name: 'Molded Case Circuit Breaker - T5 630A High Capacity',
          categoryId: 'circuit-protection',
          price: 849.00,
          currency: 'USD',
          images: ['/src/assets/images/industrial_circuit_breaker_1792848534487.jpg'],
          sku: 'MCCB-T5-630',
          slug: 'mccb-t5-630',
          brandId: 'elecsynchron',
          isAvailable: true,
          tags: ['featured']
        },
        {
          id: 'p2',
          name: 'Industrial Programmable Logic Controller S7-1500',
          categoryId: 'industrial-automation',
          price: 2450.00,
          currency: 'USD',
          images: ['/src/assets/images/prod_industrial_plc_1792851607627.jpg'],
          sku: 'PLC-S7-1500',
          slug: 'plc-s7-1500',
          brandId: 'siemens',
          isAvailable: true,
          tags: ['featured']
        },
        {
          id: 'p3',
          name: 'Heavy-Duty XLPE Armoured Power Cable 300m Reel',
          categoryId: 'cables-wires',
          price: 1890.00,
          currency: 'USD',
          images: ['/src/assets/images/industrial_cable_reel_1792848534820.jpg'],
          sku: 'CBL-XLPE-300',
          slug: 'cbl-xlpe-300',
          brandId: 'prysmian',
          isAvailable: true,
          tags: ['featured']
        },
        {
          id: 'p4',
          name: 'High-Lumen Industrial Explosion-Proof LED Floodlight',
          categoryId: 'lighting-fixtures',
          price: 420.00,
          currency: 'USD',
          images: ['/src/assets/images/prod_led_floodlight_1792851607088.jpg'],
          sku: 'LED-FL-400W',
          slug: 'led-fl-400w',
          brandId: 'schneider',
          isAvailable: true,
          tags: ['featured']
        }
      ];

      try {
        const products = await getFeaturedProducts(4);
        if (products.length >= 4) {
          setFeaturedProducts(products);
        } else if (products.length > 0) {
          const combined = [...products, ...defaultProducts.slice(products.length)];
          setFeaturedProducts(combined as any);
        } else {
          setFeaturedProducts(defaultProducts as any);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts(defaultProducts as any);
      }
    };

    fetchFeatured();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const brandLogos = [
    { name: 'ABB Industrial Solutions', logo: '/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg' },
    { name: 'Schneider Electric Systems', logo: '/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg' },
    { name: 'Siemens Automation', logo: '/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg' },
    { name: 'Eaton Power Distribution', logo: '/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg' },
    { name: 'Legrand B2B Systems', logo: '/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg' },
    { name: 'Prysmian Cable Group', logo: '/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg' },
  ];

  const industryApps = [
    {
      title: 'Manufacturing & Heavy OEM',
      description: 'Reliable switchgear, motor control centers (MCC), and industrial sensors engineered for continuous factory operation.',
      image: '/assets/images/app_manufacturing_systems_1792851607363.jpg',
      icon: Factory
    },
    {
      title: 'Commercial Construction',
      description: 'Certified distribution boards, riser cables, and modular power conduits for commercial high-rises and campuses.',
      image: '/assets/images/app_commercial_construction_1792851606559.jpg',
      icon: Building2
    },
    {
      title: 'Energy & Substation Infrastructure',
      description: 'Heavy-duty high voltage breakers, transformer isolators, and armoured power distribution cabling.',
      image: '/assets/images/industrial_cable_reel_1792848534820.jpg',
      icon: Zap
    }
  ];

  const homeStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Delta Industrial Solutions",
      "url": typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-kwjgku6zrubg63qgirlk7t-437051685915.asia-east1.run.app',
      "description": "International B2B industrial electrical e-commerce platform for contractors, engineers, and facility managers.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English"]
      }
    }
  ];

  return (
    <div className="flex flex-col gap-0 bg-page-bg min-h-screen text-text-primary">
      <SEO 
        title="Delta Industrial Solutions | Next-Gen Industrial B2B E-Commerce"
        description="Direct B2B procurement platform for circuit protection, switchgear, industrial automation, and heavy-duty power cables."
        structuredData={homeStructuredData}
      />

      {/* 1. Industrial 3D Hero Section */}
      <section className="relative min-h-[620px] lg:min-h-[720px] flex items-center overflow-hidden bg-navy text-white border-b border-border-glow">
        <div className="absolute inset-0 bg-industrial-grid opacity-30 pointer-events-none" />
        
        {/* Interactive 3D WebGL Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <Hero3DCanvas />
        </div>

        <PageContainer className="relative z-10 py-12 lg:py-0">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal/10 border border-teal/40 text-teal text-[11px] font-mono font-bold uppercase tracking-widest rounded-full mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Terminal className="w-3.5 h-3.5 text-teal" />
              <span>Next-Gen B2B Electrical Grid</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.08] text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-teal">Precision Power & Industrial Equipment</span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary mb-8 sm:mb-10 leading-relaxed max-w-xl font-medium">
              Direct B2B procurement of certified circuit breakers, PLCs, industrial automation switchgear, and heavy-duty cable systems for global projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="w-full sm:w-auto">
                <Button variant="neon" size="lg" className="w-full sm:w-auto h-13 px-8 text-sm font-black">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/bulk-quote" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-sm font-bold bg-navy/80">
                  Request Volume Quote
                </Button>
              </Link>
            </div>

            {/* Glowing Cyber Metrics Bar */}
            <div className="grid grid-cols-3 gap-6 pt-8 mt-10 border-t border-border-glow max-w-lg text-xs font-mono">
              <div className="p-3 bg-navy/80 rounded-xl border border-border">
                <div className="text-xl sm:text-2xl font-black text-teal text-glow-cyan">15,000+</div>
                <div className="text-[10px] text-text-muted mt-1 uppercase font-bold">SKUs In Stock</div>
              </div>
              <div className="p-3 bg-navy/80 rounded-xl border border-border">
                <div className="text-xl sm:text-2xl font-black text-violet-neon text-glow-violet">&lt;24 hrs</div>
                <div className="text-[10px] text-text-muted mt-1 uppercase font-bold">RFQ Response</div>
              </div>
              <div className="p-3 bg-navy/80 rounded-xl border border-border">
                <div className="text-xl sm:text-2xl font-black text-white">ISO 9001</div>
                <div className="text-[10px] text-text-muted mt-1 uppercase font-bold">IEC Standard</div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. Key Categories Department Showcase */}
      <section className="py-16 sm:py-24 bg-page-bg border-b border-border relative">
        <PageContainer>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-teal uppercase tracking-widest mb-2">
                <Cpu className="w-4 h-4 text-teal" />
                <span>Equipment Divisions</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Industrial Electrical Department Showcase
              </h2>
            </div>
            <Link to="/categories" className="inline-flex items-center gap-2 text-teal font-bold hover:gap-3 transition-all text-sm group">
              <span>View All Divisions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <CategoryCard 
              name="Circuit Protection & Switchgear" 
              count={245} 
              image="/assets/images/industrial_circuit_breaker_1792848534487.jpg"
              onClick={() => navigate('/categories/circuit-protection')}
            />
            <CategoryCard 
              name="Automation, PLCs & VFDs" 
              count={182} 
              image="/assets/images/cat_industrial_automation_1792851607023.jpg"
              onClick={() => navigate('/categories/industrial-automation')}
            />
            <CategoryCard 
              name="Power Cables & Wiring Systems" 
              count={312} 
              image="/assets/images/industrial_cable_reel_1792848534820.jpg"
              onClick={() => navigate('/categories/cables-wires')}
            />
          </div>
        </PageContainer>
      </section>

      {/* 3. Featured Cyber Products */}
      <section className="py-16 sm:py-24 bg-navy/60 border-b border-border relative">
        <div className="absolute inset-0 bg-industrial-dots opacity-20 pointer-events-none" />
        <PageContainer className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-teal uppercase tracking-widest mb-2">
                <Sparkles className="w-4 h-4 text-teal" />
                <span>High-Demand Components</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Featured Equipment
              </h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 text-teal font-bold hover:gap-3 transition-all text-sm group">
              <span>Explore Full Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} isNew={prod.tags?.includes('featured')} />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* 4. Partner Network */}
      <section className="py-16 sm:py-24 bg-navy border-b border-border relative overflow-hidden">
        <PageContainer>
          <div className="mb-8">
            <h2 className="text-sm font-mono font-bold text-teal uppercase tracking-widest mb-2">
              Our Trusted Partners & Manufacturers
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Global Industrial Alliances
            </h3>
            <p className="text-sm text-text-secondary mt-2">
              Official authorized distribution and systems integration partners providing world-class industrial equipment.
            </p>
          </div>

          <BrandCarousel />
        </PageContainer>
      </section>

      {/* 5. Industry Applications */}
      <section className="py-16 sm:py-24 bg-page-bg text-white relative border-b border-border">
        <PageContainer className="relative z-10">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-teal uppercase tracking-widest mb-2">
              <Radio className="w-4 h-4 text-teal" />
              <span>Sector Solutions</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Turnkey Infrastructure Applications
            </h2>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Tailored electrical equipment packages compliant with IEC, CE, and UL standards for severe environment demands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industryApps.map((app, idx) => (
              <div key={idx} className="group bg-navy/80 rounded-xl overflow-hidden border border-border p-6 transition-all hover:border-teal/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] flex flex-col justify-between backdrop-blur-md">
                <div>
                  <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                    <img 
                      src={app.image} 
                      alt={app.title} 
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-90 animate-float-gentle" 
                    />
                    <div className="absolute inset-0 bg-navy/40 group-hover:bg-navy/10 transition-colors" />
                    <div className="absolute bottom-3 left-3 bg-navy/90 p-2 rounded-md text-teal border border-border">
                      <app.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{app.title}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed mb-6">{app.description}</p>
                </div>
                <Link to="/about" className="text-teal text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:gap-3 transition-all">
                  <span>View Capabilities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* 6. B2B Procurement CTAs */}
      <section className="py-16 sm:py-24 bg-navy/80 border-b border-border">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal/10 border border-teal/30 rounded-md text-xs font-bold text-teal font-mono uppercase">
                <FileCheck2 className="w-4 h-4 text-teal" />
                <span>B2B Contract & RFQ Desk</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Simplified Sourcing for Project Engineering
              </h2>
              <p className="text-base text-text-secondary leading-relaxed">
                Delta Industrial Solutions provides specialized RFQ tools for high-volume electrical bill of materials, custom cable sizing, and project tenders.
              </p>
              
              <div className="space-y-4 pt-2">
                {[
                  { title: 'Project Enquiry & Bids', desc: 'Custom package scheduling for heavy infrastructure development.', icon: Briefcase, path: '/project-enquiry' },
                  { title: 'Custom Cable Sizing & Cutting', desc: 'Precision drum cuts, multi-core cable specs, and rapid logistics.', icon: Zap, path: '/cable-enquiry' },
                  { title: 'Bulk Volume Quotation', desc: 'Tiered wholesale discounts for contractor inventory replenishment.', icon: Layers, path: '/bulk-quote' }
                ].map((item, idx) => (
                  <Link 
                    key={idx} 
                    to={item.path}
                    className="flex items-center gap-5 p-5 rounded-xl border border-border hover:border-teal/60 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all group bg-navy/90"
                  >
                    <div className="w-12 h-12 bg-navy-dark border border-border rounded-lg flex items-center justify-center text-teal group-hover:bg-teal group-hover:text-black transition-colors shrink-0">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-sm text-white group-hover:text-teal transition-colors truncate">{item.title}</h3>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-teal transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-border-glow">
                <img 
                  src="/assets/images/app_commercial_construction_1792851606559.jpg" 
                  className="w-full h-full object-cover filter brightness-90 animate-float-gentle" 
                  loading="lazy"
                  decoding="async"
                  alt="Industrial Commercial Construction project installation" 
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-navy-dark/95 p-6 rounded-xl text-white shadow-2xl max-w-xs border border-teal/40 hidden sm:block backdrop-blur-md">
                <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider mb-1 font-mono">
                  <Clock className="w-4 h-4 text-teal" />
                  <span>Rapid Guarantee</span>
                </div>
                <div className="text-xl font-black text-white mb-1">24 Hour RFQ Turnaround</div>
                <p className="text-text-secondary text-xs leading-relaxed">Senior electrical engineers evaluate and respond to formal technical RFQs within 24 hours.</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 7. Technical Briefing Newsletter */}
      <section className="py-16 sm:py-20 bg-page-bg">
        <PageContainer className="text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 bg-navy border border-border-glow rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,240,255,0.2)] text-teal">
              <Mail className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Industrial Engineering Briefings
            </h2>
            <p className="text-sm text-text-secondary">
              Receive regulatory compliance alerts, technical specification updates, and bulk availability notices.
            </p>

            {newsletterSubscribed ? (
              <div className="p-4 bg-teal/10 border border-teal/30 text-teal rounded-lg text-sm font-semibold">
                Thank you. You have been registered for our technical releases.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                <input 
                  id="newsletter-email-input"
                  type="email" 
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter professional email address" 
                  aria-label="Professional email address"
                  className="flex-grow h-12 px-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-teal bg-navy text-white text-sm"
                />
                <Button type="submit" variant="primary" size="md" className="h-12 px-6">
                  Subscribe
                </Button>
              </form>
            )}

            <p className="text-[10px] text-text-muted uppercase tracking-widest pt-1 font-mono">
              Confidential B2B updates. No spam.
            </p>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};


