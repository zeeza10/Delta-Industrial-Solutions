/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Executive Inventory Health Panel
 * Real-time warehouse inventory supervision, stock allocation breakdown, and reorder alerts
 */

import React from 'react';
import { InventoryHealthMetrics } from '../../hooks/useExecutiveDashboard';
import { Package, AlertTriangle, Layers, DollarSign, ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InventoryHealthWidgetProps {
  inventoryHealth: InventoryHealthMetrics;
  loading?: boolean;
}

export const InventoryHealthWidget: React.FC<InventoryHealthWidgetProps> = ({
  inventoryHealth,
  loading = false,
}) => {
  const {
    totalSkus,
    lowStockCount,
    outOfStockCount,
    availableStock,
    reservedStock,
    totalStockValue,
    reorderAlerts,
  } = inventoryHealth;

  const totalPhysicalUnits = availableStock + reservedStock;
  const availablePercentage = totalPhysicalUnits > 0 ? Math.round((availableStock / totalPhysicalUnits) * 100) : 100;
  const reservedPercentage = totalPhysicalUnits > 0 ? Math.round((reservedStock / totalPhysicalUnits) * 100) : 0;

  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-5 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#273244] pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#22D3EE]" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Executive Inventory Health & Stock Valuation
          </h2>
        </div>
        <Link
          to="/admin/inventory"
          className="text-xs text-[#22D3EE] hover:underline flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
        >
          <span>Manage Stock</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total SKUs */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Tracked Catalog SKUs</span>
            <Layers className="w-3.5 h-3.5 text-[#22D3EE]" />
          </div>
          <div className="text-lg font-bold text-slate-100">{totalSkus}</div>
          <div className="text-[10px] text-slate-500">Active catalog items</div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Low-Stock Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400">{lowStockCount}</div>
          <div className="text-[10px] text-slate-500">Below threshold</div>
        </div>

        {/* Out of Stock */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Out-Of-Stock</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-lg font-bold text-red-400">{outOfStockCount}</div>
          <div className="text-[10px] text-slate-500">Immediate reorder</div>
        </div>

        {/* Stock Valuation */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Catalog Stock Value</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">
            ${totalStockValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-500">Total physical inventory</div>
        </div>
      </div>

      {/* Stock Allocation Bar: Available vs Reserved */}
      <div className="bg-[#0D1118] border border-[#273244] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Stock Allocation Breakdown
          </span>
          <span className="text-slate-400">
            Total Units: <strong className="text-slate-100">{totalPhysicalUnits.toLocaleString()}</strong>
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 bg-[#18212D] rounded-full overflow-hidden flex border border-[#273244]">
          <div
            className="h-full bg-[#22D3EE] transition-all duration-500"
            style={{ width: `${availablePercentage}%` }}
            title={`Available: ${availableStock} units (${availablePercentage}%)`}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${reservedPercentage}%` }}
            title={`Reserved: ${reservedStock} units (${reservedPercentage}%)`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-[#273244]/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE]" />
            <span className="text-slate-300">
              Available Stock: <strong className="text-slate-100">{availableStock.toLocaleString()}</strong> ({availablePercentage}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">
              Reserved for Orders: <strong className="text-slate-100">{reservedStock.toLocaleString()}</strong> ({reservedPercentage}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
