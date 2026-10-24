/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, FileText, Mail } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Base';

interface EnquirySuccessProps {
  reference: string;
  type: string;
  onReset: () => void;
}

export const EnquirySuccess: React.FC<EnquirySuccessProps> = ({ reference, type, onReset }) => {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>
      
      <h2 className="text-3xl font-bold text-text-primary mb-4">Request Submitted Successfully</h2>
      <p className="text-text-secondary mb-8 leading-relaxed">
        Thank you for your {type}. Your request has been sent to our procurement team for review. 
        We typically respond to technical enquiries within 24 business hours.
      </p>

      <div className="bg-white border border-border rounded-xl p-8 mb-12 flex flex-col sm:flex-row items-center justify-center gap-8 shadow-sm">
        <div className="text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Reference Number</div>
          <div className="text-xl font-mono font-bold text-primary">{reference}</div>
        </div>
        <div className="w-px h-12 bg-border hidden sm:block" />
        <div className="text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Estimated Review</div>
          <div className="text-xl font-bold text-text-primary">1-2 Business Days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/products">
          <PrimaryButton className="w-full h-12">Continue Browsing</PrimaryButton>
        </Link>
        <SecondaryButton onClick={onReset} className="w-full h-12">Submit Another Request</SecondaryButton>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Mail className="w-4 h-4" />
          <span>A copy of this request has been sent to your email.</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <FileText className="w-4 h-4" />
          <span>Need immediate help? Contact our support line.</span>
        </div>
      </div>
    </div>
  );
};
