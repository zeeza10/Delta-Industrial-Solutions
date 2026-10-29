/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, PackageCheck, ArrowRight, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InventoryRecord } from '../../../types';

interface LowStockAlertWidgetProps {
  records: InventoryRecord[];
  loading?: boolean;
}

export const LowStockAlertWidget: React.FC<LowStockAlertWidgetProps> = ({ records, loading }) => {
  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4">
      <div className="flex items-center justify-between border-b border-[#273244] pb-3">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Inventory & Stock Replenishment</span>
        </h3>
        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
          STOCK MONITOR
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#18212D] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="p-4 rounded-lg bg-[#18212D] border border-[#273244] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <PackageCheck className="w-4 h-4" />
            <span>All inventory stock levels are within optimal reorder thresholds.</span>
          </div>
          <Link
            to="/admin/products"
            className="text-[#22D3EE] hover:underline flex items-center gap-1 text-[11px]"
          >
            <span>Inspect SKUs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {records.slice(0, 5).map((rec) => (
            <div
              key={rec.id || rec.sku}
              className="p-3 rounded-lg bg-[#18212D] border border-amber-500/30 flex items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Warehouse className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-200 truncate">{rec.sku}</div>
                  <div className="text-[10px] text-slate-400">{rec.warehouseId || 'Main Hub'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-bold text-amber-400">{rec.availableStock} Available</div>
                  <div className="text-[10px] text-slate-500">Reorder @ {rec.reorderThreshold}</div>
                </div>
                <Link
                  to="/admin/products"
                  className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors text-[10px] font-bold uppercase border border-amber-500/30"
                >
                  Restock
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
