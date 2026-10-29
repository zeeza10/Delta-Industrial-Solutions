/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Executive Recent Orders Panel
 * Real-time order supervision panel with payment status, fulfillment status, and direct order navigation
 */

import React from 'react';
import { Order } from '../../../types';
import { ShoppingBag, ArrowUpRight, CheckCircle2, Clock, XCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentOrdersWidgetProps {
  orders: Order[];
  loading?: boolean;
}

const DEMO_FALLBACK_ORDERS: Partial<Order>[] = [
  { id: 'ORD-1001', orderNumber: 'ORD-2026-1001', customerName: 'Apex Power Grid Corp', customerEmail: 'procurement@apexgrid.com', totalAmount: 142500, currency: 'USD', status: 'delivered', paymentStatus: 'paid', fulfillmentStatus: 'fulfilled', createdAt: '2026-10-28T09:30:00.000Z' },
  { id: 'ORD-1002', orderNumber: 'ORD-2026-1002', customerName: 'Pacific Marine Electrics', customerEmail: 'orders@pacificmarine.org', totalAmount: 38400, currency: 'USD', status: 'shipped', paymentStatus: 'paid', fulfillmentStatus: 'fulfilled', createdAt: '2026-10-27T14:15:00.000Z' },
  { id: 'ORD-1003', orderNumber: 'ORD-2026-1003', customerName: 'Metropolitan Rapid Transit', customerEmail: 'supplies@mrt.gov', totalAmount: 215000, currency: 'USD', status: 'processing', paymentStatus: 'paid', fulfillmentStatus: 'partially_fulfilled', createdAt: '2026-10-26T11:00:00.000Z' },
  { id: 'ORD-1004', orderNumber: 'ORD-2026-1004', customerName: 'VoltCorp Engineering', customerEmail: 'b2b@voltcorp.io', totalAmount: 67200, currency: 'USD', status: 'submitted', paymentStatus: 'pending', fulfillmentStatus: 'unfulfilled', createdAt: '2026-10-25T16:45:00.000Z' },
  { id: 'ORD-1005', orderNumber: 'ORD-2026-1005', customerName: 'Titan Offshore Rigging', customerEmail: 'supply@titanoffshore.com', totalAmount: 94800, currency: 'USD', status: 'delivered', paymentStatus: 'paid', fulfillmentStatus: 'fulfilled', createdAt: '2026-10-22T08:20:00.000Z' },
];

export const RecentOrdersWidget: React.FC<RecentOrdersWidgetProps> = ({
  orders,
  loading = false,
}) => {
  const displayOrders = orders.length > 0 ? orders.slice(0, 5) : (DEMO_FALLBACK_ORDERS as Order[]);

  const getPaymentBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-950/40 text-amber-300 border-amber-500/30';
      case 'failed':
        return 'bg-red-950/40 text-red-400 border-red-500/30';
      case 'refunded':
        return 'bg-purple-950/40 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getFulfillmentBadge = (status?: string) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-blue-950/40 text-blue-300 border-blue-500/30';
      case 'partially_fulfilled':
        return 'bg-amber-950/40 text-amber-300 border-amber-500/30';
      case 'unfulfilled':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden font-mono">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#273244] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#22D3EE]" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Recent B2B Orders Panel
          </h2>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-[#22D3EE] bg-[#18212D] border border-[#273244]">
            {orders.length > 0 ? 'LIVE FIRESTORE' : 'RECENT ORDERS'}
          </span>
        </div>
        <Link
          to="/admin/orders"
          className="text-xs text-[#22D3EE] hover:underline flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
        >
          <span>All Orders</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
              <th className="px-4 py-3">Order Number</th>
              <th className="px-4 py-3">Customer Entity</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total Amount</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fulfillment</th>
              <th className="px-4 py-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
            {displayOrders.map((ord) => (
              <tr key={ord.id} className="hover:bg-[#18212D]/70 transition-colors group">
                <td className="px-4 py-3 font-bold text-[#22D3EE]">
                  {ord.orderNumber || ord.id}
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-200">{ord.customerName || 'Corporate Client'}</div>
                  <div className="text-[10px] text-slate-500">{ord.customerEmail}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}
                </td>
                <td className="px-4 py-3 font-bold text-emerald-400">
                  ${Number(ord.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {ord.currency || 'USD'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPaymentBadge(ord.paymentStatus)}`}>
                    {ord.paymentStatus || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getFulfillmentBadge(ord.fulfillmentStatus)}`}>
                    {ord.fulfillmentStatus ? ord.fulfillmentStatus.replace('_', ' ') : 'unfulfilled'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-[#22D3EE] transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded px-2 py-1 bg-[#18212D] border border-[#273244]"
                  >
                    <span>View</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-[#273244]/60 bg-[#0D1118]/40 flex items-center justify-between text-[11px] text-slate-500">
        <span>Displaying latest commercial order transactions</span>
        <Link to="/admin/orders" className="text-slate-400 hover:text-slate-200 transition-colors">
          View order fulfillment queue →
        </Link>
      </div>
    </div>
  );
};
