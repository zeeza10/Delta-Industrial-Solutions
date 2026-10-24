import React from 'react';
import { Truck, ShieldCheck, Clock, PhoneCall, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-navy-dark text-text-secondary text-xs py-2 border-b border-border/80 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 tracking-wide">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-teal shrink-0" />
              <span>Express International Freight Available</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0" />
              <span>ISO 9001 & IEC Certified Equipment</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-text-muted">
            <div className="hidden lg:flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-teal shrink-0" />
              <span>24/7 Engineering Desk Online</span>
            </div>
            <a href="tel:+923471980150" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-bold text-white">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span>+92 347 1980150</span>
            </a>
            <Link to="/bulk-quote" className="hidden sm:inline-flex items-center gap-1 text-teal font-bold hover:underline">
              <FileText className="w-3.5 h-3.5" />
              <span>Request RFQ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


