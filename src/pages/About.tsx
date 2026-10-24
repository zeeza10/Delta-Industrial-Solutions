/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PageContainer, SectionHeading, PrimaryButton, SecondaryButton } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { SEO } from '../components/common/SEO';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Cpu, 
  Award, 
  Globe, 
  User, 
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  bio: string;
  specialty: string;
  gradient: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Mr. Abdul Wadood',
    role: 'Chief Executive Officer (CEO)',
    initials: 'AW',
    bio: 'Executive direction, strategic international expansion, and high-voltage industrial solution distribution.',
    specialty: 'Executive Strategy & Global Operations',
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    name: 'Muhammad Zeeshan Javaid',
    role: 'Chief Technology Officer (CTO)',
    initials: 'ZJ',
    bio: 'Pioneering digital transformer architecture, smart grid automation, and industrial IoT platform engineering.',
    specialty: 'Grid Automation & Digital Systems',
    gradient: 'from-purple-500 to-cyan-500'
  },
  {
    name: 'Abdul Qadeer',
    role: 'Electrical Engineer',
    initials: 'AQ',
    bio: 'Senior technical consultant specializing in switchgear compliance, circuit protection, and high-capacity panel design.',
    specialty: 'Switchgear & Power Protection',
    gradient: 'from-blue-600 to-indigo-600'
  },
  {
    name: 'Noor ul Ain',
    role: 'Sales & Marketing Expert',
    initials: 'NA',
    bio: 'Driving commercial B2B relationships, key account tenders, and procurement partnerships across global markets.',
    specialty: 'B2B Client Tenders & Strategic Growth',
    gradient: 'from-teal to-cyan-500'
  }
];

export const About: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' }
  ];

  return (
    <PageContainer>
      <SEO 
        title="About Us | Delta Industrial Solutions Private Limited" 
        description="Learn about Delta Industrial Solutions Private Limited, our executive leadership team, and our commitment to international electrical procurement standards." 
      />
      <Breadcrumbs items={breadcrumbs} className="mb-8" />

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0b0f19] border border-cyan-500/30 p-8 sm:p-12 lg:p-16 mb-16 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-xl font-mono">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 mb-4 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GLOBAL B2B ELECTRICAL POWER & AUTOMATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Delta Industrial Solutions <span className="text-cyan-400 text-glow-cyan">Private Limited</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 font-sans">
            Delta Industrial Solutions Private Limited is a premier international provider of high-reliability electrical equipment, circuit protection gear, power cables, and industrial switchgear solutions. We empower contractors, power engineers, and industrial facilities with certified equipment and rapid global dispatch.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-cyan-400">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#07090e] border border-cyan-500/30 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>ISO 9001 Certified Quality</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#07090e] border border-cyan-500/30 rounded-lg">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Global Dispatch Logistics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 font-mono">
        <div className="bg-[#0b0f19]/80 border border-cyan-500/20 rounded-xl p-8 industrial-card-3d">
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-3 text-glow-cyan">Engineered Precision</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Our catalog is vetted by certified power engineers to ensure all SKUs meet strict IEC, IEEE, and ISO electrical compliance metrics.
          </p>
        </div>

        <div className="bg-[#0b0f19]/80 border border-cyan-500/20 rounded-xl p-8 industrial-card-3d">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_15px_rgba(138,43,226,0.2)]">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-3 text-glow-violet">Tender & Quotation Desk</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Specialized engineering support desk assisting contractors with complete bills of materials, cable schedules, and bulk order tenders within 24 hours.
          </p>
        </div>

        <div className="bg-[#0b0f19]/80 border border-cyan-500/20 rounded-xl p-8 industrial-card-3d">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_15px_rgba(0,100,255,0.2)]">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-3">Headquarters</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Headquartered at Tree House, Garden Town, Cantt Multan, providing dedicated client service and logistics support nationwide and internationally.
          </p>
        </div>
      </div>

      {/* Leadership & Executive Team */}
      <section className="mb-20 font-mono">
        <SectionHeading 
          title="Executive Leadership & Technical Team" 
          subtitle="Meet the leaders behind Delta Industrial Solutions Private Limited."
          tag="CORPORATE LEADERSHIP"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <div 
              key={idx} 
              className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center text-center industrial-card-3d relative overflow-hidden backdrop-blur-xl group"
            >
              {/* Glowing Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none group-hover:from-cyan-500/15 transition-all" />

              {/* Portrait / Initial Avatar */}
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-tr ${member.gradient} p-0.5 mb-6 shadow-[0_0_20px_rgba(0,240,255,0.3)] group-hover:scale-105 transition-transform`}>
                <div className="w-full h-full bg-[#07090e] rounded-[14px] flex items-center justify-center text-cyan-400 text-2xl font-black font-mono tracking-wider">
                  <span className="text-glow-cyan">{member.initials}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                {member.name}
              </h3>
              <div className="text-xs font-mono text-cyan-400 mb-4 font-bold tracking-wide uppercase">
                {member.role}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6 flex-grow">
                {member.bio}
              </p>

              <div className="w-full pt-4 border-t border-cyan-500/20 text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-cyan-950/30 py-2 rounded-lg border border-cyan-500/20">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>{member.specialty}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Company Contact Summary */}
      <section className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-2xl p-8 sm:p-10 shadow-[0_0_30px_rgba(0,0,0,0.8)] font-mono backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-2 md:col-span-2">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest text-glow-cyan">OFFICIAL HEADQUARTERS</div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">Delta Industrial Solutions Private Limited</h3>
            <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Tree House, Garden Town, Cantt Multan</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="tel:+923471980150" className="hover:text-cyan-400 transition-colors font-bold">+92 347 1980150</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="mailto:info@deltaindustrial.com" className="hover:text-cyan-400 transition-colors font-bold">info@deltaindustrial.com</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/contact">
              <PrimaryButton className="w-full h-12 text-xs uppercase tracking-wider" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Contact Procurement Desk
              </PrimaryButton>
            </Link>
            <Link to="/bulk-quote">
              <SecondaryButton className="w-full h-12 text-xs uppercase tracking-wider">
                Request Bulk Quotation
              </SecondaryButton>
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};
