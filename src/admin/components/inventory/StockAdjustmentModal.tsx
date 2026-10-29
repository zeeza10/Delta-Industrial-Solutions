/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  Package,
  History,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Product, StockMovementType } from '../../../types';
import { inventoryService } from '../../services/inventoryService';
import { useAuth } from '../../../context/AuthContext';

interface StockAdjustmentModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ 
  product, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<StockMovementType>('stock_received');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === 0) {
      setError('Adjustment amount cannot be zero');
      return;
    }
    if (!reason.trim()) {
      setError('Adjustment reason is required for audit trail');
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    const result = await inventoryService.adjustStock({
      productId: product.id,
      sku: product.sku,
      delta: amount,
      type,
      reason: reason.trim(),
      actor: {
        uid: user.uid,
        email: user.email || 'unknown',
        role: (user as any).role || 'staff'
      }
    });

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Failed to update stock');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#0D1118] border border-[#273244] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#273244] flex items-center justify-between bg-[#121823]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18212D] border border-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Adjust Stock Level</h3>
              <p className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">{product.sku} — {product.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#18212D] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#121823] border border-[#273244]">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Current Stock</p>
              <p className="text-xl font-bold text-slate-100">{product.stock || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#121823] border border-[#273244]">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Threshold</p>
              <p className="text-xl font-bold text-amber-400">{product.lowStockThreshold || 0}</p>
            </div>
          </div>

          {/* Adjustment Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setType('stock_received'); setAmount(Math.abs(amount)); }}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[10px] font-mono transition-all ${
                    type === 'stock_received' 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                      : 'bg-[#18212D] border-[#273244] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Received</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setType('stock_issued'); setAmount(-Math.abs(amount)); }}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[10px] font-mono transition-all ${
                    type === 'stock_issued' 
                      ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : 'bg-[#18212D] border-[#273244] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Issued</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('return_restock')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[10px] font-mono transition-all ${
                    type === 'return_restock' 
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                      : 'bg-[#18212D] border-[#273244] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Return</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('audit_adjustment')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[10px] font-mono transition-all ${
                    type === 'audit_adjustment' 
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
                      : 'bg-[#18212D] border-[#273244] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                Quantity Change (+/-)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#18212D] border border-[#273244] focus:border-[#22D3EE] rounded-lg px-4 py-3 text-slate-100 text-lg font-bold outline-none transition-colors"
                  placeholder="e.g. 50 or -5"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  {amount > 0 ? (
                    <span className="text-emerald-400 text-[10px] font-bold">+ADD</span>
                  ) : amount < 0 ? (
                    <span className="text-red-400 text-[10px] font-bold">REDUCE</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                Adjustment Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                className="w-full bg-[#18212D] border border-[#273244] focus:border-[#22D3EE] rounded-lg px-4 py-3 text-slate-200 text-sm outline-none transition-colors resize-none"
                placeholder="Describe why this adjustment is being made..."
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-400 font-mono leading-relaxed">{error}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-[#273244] mt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Signed Log Entry</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || amount === 0}
                className={`
                  px-6 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all
                  ${isSubmitting || amount === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-[#22D3EE] text-[#090B10] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  }
                `}
              >
                {isSubmitting ? 'Processing...' : 'Apply Change'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
