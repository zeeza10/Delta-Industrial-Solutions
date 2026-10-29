/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Procurement Overview Widget
 * Real-time purchase order supervision: open POs, pending approvals, awaiting delivery, and recently received goods
 */

import React from 'react';
import { PurchaseOrder } from '../../../types';
import { Truck, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, HelpCircle, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProcurementWidgetProps {
  purchaseOrders: PurchaseOrder[];
  isLiveDb?: boolean;
  loading?: boolean;
}

export const ProcurementWidget: React.FC<ProcurementWidgetProps> = ({
  purchaseOrders,
  isLiveDb = false,
  loading = false,
}) => {
  // Filter real PO records
  const openPOs = purchaseOrders.filter(po => po.status === 'issued' || po.status === 'partially_received');
  const pendingApprovals = purchaseOrders.filter(po => po.status === 'draft');
  const awaitingDelivery = purchaseOrders.filter(po => po.status === 'issued');
  const recentlyReceived = purchaseOrders.filter(po => po.status === 'received');

  const hasData = purchaseOrders.length > 0;

  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/30 space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#273244] pb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#22D3EE]" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Procurement & Purchase Order Overview
          </h2>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
          hasData 
            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30' 
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {hasData ? 'LIVE FIRESTORE POs' : 'DATA NOT CONFIGURED'}
        </span>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Open POs */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Open POs</span>
            <Truck className="w-3.5 h-3.5 text-[#22D3EE]" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            {hasData ? openPOs.length : <span className="text-slate-500 text-xs font-normal">N/A</span>}
          </div>
          <div className="text-[10px] text-slate-500">Active supplier orders</div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Pending Approval</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400">
            {hasData ? pendingApprovals.length : <span className="text-slate-500 text-xs font-normal">N/A</span>}
          </div>
          <div className="text-[10px] text-slate-500">Draft / Submitted POs</div>
        </div>

        {/* Awaiting Delivery */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Awaiting Shipment</span>
            <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-300">
            {hasData ? awaitingDelivery.length : <span className="text-slate-500 text-xs font-normal">N/A</span>}
          </div>
          <div className="text-[10px] text-slate-500">In-transit from supplier</div>
        </div>

        {/* Recently Received */}
        <div className="bg-[#18212D] border border-[#273244] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Received Goods</span>
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {hasData ? recentlyReceived.length : <span className="text-slate-500 text-xs font-normal">N/A</span>}
          </div>
          <div className="text-[10px] text-slate-500">Fulfilled PO receipts</div>
        </div>
      </div>

      {/* Honest Unavailable State or Data List */}
      {!hasData ? (
        <div className="bg-[#0D1118] border border-[#273244] rounded-lg p-4 text-center space-y-2">
          <div className="flex justify-center text-slate-500">
            <HelpCircle className="w-8 h-8 stroke-1 text-slate-600" />
          </div>
          <div className="text-xs font-bold text-slate-300">
            No Purchase Order Records Provisioned
          </div>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            The <code className="text-[#22D3EE] font-mono">purchase_orders</code> Firestore collection currently contains 0 records. Purchase orders will appear live once procurement workflows are initialized.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0D1118] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-3 py-2">PO Number</th>
                <th className="px-3 py-2">Supplier</th>
                <th className="px-3 py-2">Total Cost</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-slate-300">
              {purchaseOrders.slice(0, 4).map(po => (
                <tr key={po.id} className="hover:bg-[#18212D]/60 transition-colors">
                  <td className="px-3 py-2 font-bold text-[#22D3EE]">{po.poNumber || po.id}</td>
                  <td className="px-3 py-2 text-slate-200">{po.supplierName}</td>
                  <td className="px-3 py-2 font-bold text-emerald-400">${po.totalCost?.toLocaleString()} {po.currency}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-950/40 text-[#22D3EE] border border-[#22D3EE]/30">
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
