/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PackagePlus, 
  Layers, 
  UserCheck, 
  Database, 
  Sparkles,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { seedDatabase, promoteToAdmin } from '../../../utils/dbSeed';
import { useAuth } from '../../../context/AuthContext';

export const QuickActionsWidget: React.FC = () => {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setFeedback(null);
    try {
      await seedDatabase();
      setFeedback('Industrial catalog successfully synchronized to Firestore.');
    } catch (err: any) {
      setFeedback(`Sync error: ${err.message || 'Operation failed'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSelfPromote = async () => {
    if (!user) {
      setFeedback('Please authenticate your session first.');
      return;
    }
    try {
      await promoteToAdmin(user.uid);
      setFeedback('Admin role verified and refreshed in Firestore.');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setFeedback(`Privilege check note: ${err.message}`);
    }
  };

  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4">
      <div className="flex items-center justify-between border-b border-[#273244] pb-3">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#22D3EE]" />
          <span>Operational Actions</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-400 bg-[#18212D] px-2 py-0.5 rounded border border-[#273244]">
          SHORTCUTS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Link
          to="/admin/products"
          className="flex items-center justify-between p-3 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-xs font-mono text-slate-300 hover:text-white transition-all group focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
        >
          <div className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-[#22D3EE] group-hover:scale-105 transition-transform shrink-0" />
            <span className="truncate">Manage SKUs</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#22D3EE] transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/enquiries"
          className="flex items-center justify-between p-3 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-xs font-mono text-slate-300 hover:text-white transition-all group focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#22D3EE] group-hover:scale-105 transition-transform shrink-0" />
            <span className="truncate">Review RFQs</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#22D3EE] transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/categories"
          className="flex items-center justify-between p-3 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-xs font-mono text-slate-300 hover:text-white transition-all group focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#22D3EE] group-hover:scale-105 transition-transform shrink-0" />
            <span className="truncate">Taxonomies</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#22D3EE] transition-colors shrink-0" />
        </Link>

        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex items-center justify-between p-3 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-xs font-mono text-slate-300 hover:text-white transition-all group text-left disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
        >
          <div className="flex items-center gap-2">
            <Database className={`w-4 h-4 text-[#22D3EE] group-hover:scale-105 transition-transform shrink-0 ${isSeeding ? 'animate-spin' : ''}`} />
            <span className="truncate">{isSeeding ? 'Syncing...' : 'Sync Catalog'}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold shrink-0">DB</span>
        </button>
      </div>

      {feedback && (
        <div className="p-2.5 rounded-lg bg-[#18212D] border border-[#22D3EE]/30 text-xs font-mono text-[#22D3EE]">
          {feedback}
        </div>
      )}
    </div>
  );
};
