/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Priority RFQ Queue Widget
 * Enhanced RFQ table with inline search, status filter tabs, value indicators, and direct admin navigation
 */

import React, { useState, useMemo } from 'react';
import { Enquiry } from '../../../types';
import { MessageSquare, Search, ArrowUpRight, Filter, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PriorityEnquiriesWidgetProps {
  enquiries: Enquiry[];
  loading?: boolean;
}

const DEMO_FALLBACK_ENQUIRIES = [
  { id: 'ENQ-2026-001', subject: 'High-Voltage Cable Run (500m)', company: 'Global Infra Ltd', email: 'procurement@globalinfra.com', date: '2026-10-28', status: 'pending', value: '$45,200' },
  { id: 'ENQ-2026-002', subject: 'Bulk Switchgear Batch Order', company: 'Industrial Systems Corp', email: 'b2b@induscorp.io', date: '2026-10-27', status: 'reviewing', value: '$88,400' },
  { id: 'ENQ-2026-003', subject: 'Substation Automation PLC & HMI', company: 'City Power Grid', email: 'engineering@citypower.gov', date: '2026-10-26', status: 'quoted', value: '$120,000' },
  { id: 'ENQ-2026-004', subject: 'Marine Grade Armored Power Cable', company: 'Offshore Electrics Ltd', email: 'supplies@offshore.org', date: '2026-10-25', status: 'pending', value: '$32,500' },
  { id: 'ENQ-2026-005', subject: 'Heavy Duty Explosion-Proof Enclosures', company: 'PetroChemical Refineries SA', email: 'safety@petrochem.com', date: '2026-10-24', status: 'reviewing', value: '$64,100' },
];

export const PriorityEnquiriesWidget: React.FC<PriorityEnquiriesWidgetProps> = ({
  enquiries,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const displayItems = useMemo(() => {
    let source = enquiries.length > 0
      ? enquiries.map(e => ({
          id: e.id,
          subject: e.subject || e.message || `${e.type?.toUpperCase() || 'BULK'} RFQ`,
          company: e.customerInfo?.company || e.customerInfo?.name || e.customerInfo?.email || 'B2B Client Entity',
          email: e.customerInfo?.email || 'unspecified@client.com',
          date: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Recent',
          status: e.status || 'pending',
          value: e.data?.estimatedBudget ? `$${Number(e.data.estimatedBudget).toLocaleString()}` : 'RFQ Quote',
        }))
      : DEMO_FALLBACK_ENQUIRIES;

    if (statusFilter !== 'all') {
      source = source.filter(item => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      source = source.filter(
        item =>
          item.id.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q)
      );
    }

    return source;
  }, [enquiries, searchQuery, statusFilter]);

  return (
    <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden font-mono">
      {/* Header & Controls */}
      <div className="p-4 border-b border-[#273244] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#22D3EE]" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Priority RFQ & Procurement Queue
          </h2>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-[#22D3EE] bg-[#18212D] border border-[#273244]">
            {enquiries.length > 0 ? 'LIVE FIRESTORE' : 'PIPELINE QUEUE'}
          </span>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search RFQ, client, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#0D1118] border border-[#273244] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE] w-48 sm:w-56"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-[#0D1118] p-0.5 rounded-lg border border-[#273244] text-[10px]">
            {['all', 'pending', 'reviewing', 'quoted'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-[#22D3EE] text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Link
            to="/admin/enquiries"
            className="text-xs text-[#22D3EE] hover:underline flex items-center gap-1 pl-2"
          >
            <span>All RFQs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
              <th className="px-4 py-3">RFQ ID</th>
              <th className="px-4 py-3">Technical Requirement</th>
              <th className="px-4 py-3">Client Entity</th>
              <th className="px-4 py-3">Est. Value</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No RFQs match the current search or filter criteria.
                </td>
              </tr>
            ) : (
              displayItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#18212D]/70 transition-colors group">
                  <td className="px-4 py-3 font-bold text-[#22D3EE]">{item.id}</td>
                  <td className="px-4 py-3 text-slate-200">{item.subject}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-300">{item.company}</div>
                    <div className="text-[10px] text-slate-500">{item.email}</div>
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{item.value}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      item.status === 'pending'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                        : item.status === 'reviewing'
                        ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/enquiries"
                      className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-[#22D3EE] transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded px-2 py-1 bg-[#18212D] border border-[#273244]"
                    >
                      <span>Quote</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-[#273244]/60 bg-[#0D1118]/40 flex items-center justify-between text-[11px] text-slate-500">
        <span>Showing {displayItems.length} priority procurement RFQ records</span>
        <Link to="/admin/enquiries" className="text-slate-400 hover:text-slate-200 transition-colors">
          Manage complete quotation queue →
        </Link>
      </div>
    </div>
  );
};
