import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, ShieldCheck, Award, FileText, Terminal } from 'lucide-react';
import { Logo3D } from '../common/3DLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Product Catalog',
      links: [
        { name: 'Circuit Protection & Breakers', path: '/categories/circuit-protection' },
        { name: 'Industrial Switches & Outlets', path: '/categories/switches-sockets' },
        { name: 'Armoured Cables & Wiring', path: '/categories/cables-wires' },
        { name: 'Conduits & Cable Management', path: '/categories/conduits-management' },
        { name: 'Automation & PLCs', path: '/categories/industrial-automation' },
        { name: 'Distribution Boards & Panels', path: '/categories/panels-distribution' },
      ],
    },
    {
      title: 'Procurement Services',
      links: [
        { name: 'Bulk Quantity Quotations', path: '/bulk-quote' },
        { name: 'Turnkey Project Bids', path: '/project-enquiry' },
        { name: 'Custom Cable Sizing & Cut Service', path: '/cable-enquiry' },
        { name: 'Technical Datasheets & CAD', path: '/products' },
        { name: 'Authorized Manufacturers', path: '/brands' },
      ],
    },
    {
      title: 'Company & Support',
      links: [
        { name: 'About Delta Industrial', path: '/about' },
        { name: 'Contact Engineering Team', path: '/contact' },
        { name: 'Customer Account Desk', path: '/account' },
        { name: 'Saved Quotations', path: '/quotes' },
        { name: 'Compliance & Safety', path: '/about' },
      ],
    },
  ];

  return (
    <footer className="bg-navy-dark text-white border-t border-border relative z-10">
      {/* Top Value Banner */}
      <div className="border-b border-border bg-navy/80 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-navy border border-border hover:border-teal/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0 border border-teal/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white font-mono">IEC & ISO 9001 Compliant</h4>
                <p className="text-xs text-text-muted">Fully certified electrical products for safety.</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-navy border border-border hover:border-violet-neon/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-violet-neon/10 text-violet-neon flex items-center justify-center shrink-0 border border-violet-neon/30 shadow-[0_0_10px_rgba(138,43,226,0.2)]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white font-mono">Authorized Brand Partner</h4>
                <p className="text-xs text-text-muted">Direct distribution for Schneider, ABB & Siemens.</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-navy border border-border hover:border-teal/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0 border border-teal/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white font-mono">Rapid RFQ Response</h4>
                <p className="text-xs text-text-muted">Formal written quotations within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link 
              to="/" 
              aria-label="Delta Industrial Solutions Homepage"
              className="text-xl lg:text-2xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-3 group"
            >
              <Logo3D className="w-11 h-11" />
              <div className="flex flex-col -space-y-0.5">
                <span className="leading-none text-white font-extrabold tracking-wider font-mono">DELTA</span>
                <span className="text-cyan-400 text-[10px] leading-none tracking-widest uppercase font-mono font-bold text-glow-cyan">INDUSTRIAL SOLUTIONS</span>
              </div>
            </Link>
            
            <p className="text-sm text-text-secondary max-w-md leading-relaxed font-sans">
              Delta Industrial Solutions Private Limited is an international engineering distributor of industrial electrical switchgear, cable management systems, automation components, and power distribution units.
            </p>

            <div className="space-y-3 pt-2 text-xs font-mono text-text-secondary">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-teal shrink-0" />
                <span>Tree House, Garden Town, Cantt Multan</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-teal shrink-0" />
                <a href="tel:+923471980150" className="hover:text-teal font-bold transition-colors">+92 347 1980150</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-teal shrink-0" />
                <a href="mailto:info@deltaindustrial.com" className="hover:text-teal font-bold transition-colors">info@deltaindustrial.com</a>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-teal uppercase tracking-widest">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-xs text-text-secondary hover:text-teal transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright & legal */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-text-muted">
          <p>© {currentYear} Delta Industrial Solutions Private Limited. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 text-xs">
            <Link to="/about" className="hover:text-teal transition-colors">Quality Policy</Link>
            <Link to="/about" className="hover:text-teal transition-colors">Compliance Certification</Link>
            <Link to="/contact" className="hover:text-teal transition-colors">Privacy & Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};


