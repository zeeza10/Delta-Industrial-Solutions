/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  PackagePlus, 
  Layers, 
  UserCheck, 
  Database, 
  FileSpreadsheet, 
  RefreshCw,
  Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { seedDatabase, promoteToAdmin } from '../../../utils/dbSeed';
import { useAuth } from '../../../context/AuthContext';

export const QuickActionsWidget: React.FC = () => {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setFeedback(null);
    try {
      await seedDatabase();
      setFeedback('Industrial catalog seeded into Firestore!');
    } catch (err: any) {
      setFeedback(`Seeding error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSelfPromote = async () => {
    if (!user) {
      setFeedback('Please authenticate first');
      return;
    }
    try {
      await promoteToAdmin(user.uid);
      setFeedback('Admin privileges assigned! Refreshing profile...');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setFeedback(`Promotion error: ${err.message}`);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-cyan-500/20 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.6)] space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>VIP Quick Operations</span>
        </h3>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
          SHORTCUTS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Link
          to="/admin/products"
          className="flex items-center gap-2.5 p-3 rounded-lg bg-[#07090e] border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/20 text-xs font-mono text-slate-300 hover:text-white transition-all group"
        >
          <PackagePlus className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>New Catalog SKU</span>
        </Link>

        <Link
          to="/admin/categories"
          className="flex items-center gap-2.5 p-3 rounded-lg bg-[#07090e] border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/20 text-xs font-mono text-slate-300 hover:text-white transition-all group"
        >
          <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Manage Taxonomies</span>
        </Link>

        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex items-center gap-2.5 p-3 rounded-lg bg-[#07090e] border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/20 text-xs font-mono text-slate-300 hover:text-white transition-all group text-left disabled:opacity-50"
        >
          <Database className={`w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Syncing...' : 'Sync Catalog Schema'}</span>
        </button>

        <button
          onClick={handleSelfPromote}
          className="flex items-center gap-2.5 p-3 rounded-lg bg-[#07090e] border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/20 text-xs font-mono text-slate-300 hover:text-white transition-all group text-left"
        >
          <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Verify Admin Access</span>
        </button>
      </div>

      {feedback && (
        <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          {feedback}
        </div>
      )}
    </div>
  );
};
