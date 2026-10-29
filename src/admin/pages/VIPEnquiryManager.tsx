/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Eye, 
  X,
  Building,
  Mail,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AdminBadge } from '../components/common/AdminBadge';
import { formatAdminDate } from '../utils/adminFormatters';
import { adminService } from '../services/adminService';

interface EnquiryRecord {
  id: string;
  type: string;
  status: 'pending' | 'reviewing' | 'quoted' | 'closed';
  customerInfo: {
    name: string;
    company: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  data?: Record<string, any>;
}

const demoEnquiries: EnquiryRecord[] = [
  { 
    id: 'ENQ-2026-001', 
    type: 'cable', 
    status: 'pending', 
    customerInfo: { name: 'John Smith', company: 'Global Infra Ltd', email: 'john@globalinfra.com', phone: '+1 555 382 9102' },
    createdAt: '2026-10-24T10:30:00Z',
    data: { cables: [{ type: 'XLPE', cores: 3, area: '240mm', length: 500 }], voltageRating: '11kV', application: 'Substation underground' }
  },
  { 
    id: 'ENQ-2026-002', 
    type: 'bulk', 
    status: 'reviewing', 
    customerInfo: { name: 'Sarah Lee', company: 'Industrial Systems Corp', email: 'sarah@indsys.com', phone: '+44 20 7946 0912' },
    createdAt: '2026-10-23T14:20:00Z',
    data: { products: [{ sku: 'MCCB-T5-630', quantity: 12 }, { sku: 'PLC-S7-1500', quantity: 4 }] }
  },
  { 
    id: 'ENQ-2026-003', 
    type: 'project', 
    status: 'quoted', 
    customerInfo: { name: 'Mike Ross', company: 'City Power Grid', email: 'mike@citypower.com', phone: '+971 4 293 8472' },
    createdAt: '2026-10-22T09:15:00Z',
    data: { projectName: 'Substation Alpha Expansion', targetDelivery: 'Q1 2027', budgetRange: '$120,000 - $150,000' }
  },
  { 
    id: 'ENQ-2026-004', 
    type: 'cable', 
    status: 'pending', 
    customerInfo: { name: 'Elena Vance', company: 'Offshore Electrics Ltd', email: 'elena@offshoreelec.com', phone: '+47 21 00 22 33' },
    createdAt: '2026-10-22T08:00:00Z',
    data: { cables: [{ type: 'Marine Armored', cores: 4, area: '95mm', length: 1200 }], standard: 'IEC 60092-350' }
  }
];

export const VIPEnquiryManager: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromFirestore, setIsFromFirestore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchEnquiries = async () => {
      if (!db) {
        setEnquiries(demoEnquiries);
        setIsFromFirestore(false);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as EnquiryRecord[];
        if (fetched.length > 0) {
          setEnquiries(fetched);
          setIsFromFirestore(true);
        } else {
          setEnquiries(demoEnquiries);
          setIsFromFirestore(false);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'enquiries');
        setEnquiries(demoEnquiries);
        setIsFromFirestore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  const handleStatusChange = async (enquiryId: string, newStatus: EnquiryRecord['status']) => {
    setIsUpdatingStatus(true);
    try {
      if (db) {
        await adminService.updateEnquiryStatus(enquiryId, newStatus);
      }
      setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: newStatus } : e));
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      console.warn('Status update note:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filtered = enquiries.filter(e => {
    const matchesSearch = e.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.customerInfo?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: EnquiryRecord['status']) => {
    switch (status) {
      case 'pending':
        return <AdminBadge variant="warning">Pending</AdminBadge>;
      case 'reviewing':
        return <AdminBadge variant="info">Reviewing</AdminBadge>;
      case 'quoted':
        return <AdminBadge variant="success">Quoted</AdminBadge>;
      case 'closed':
        return <AdminBadge variant="default">Closed</AdminBadge>;
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Consistent Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">PROCUREMENT PIPELINE</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              {isFromFirestore ? 'LIVE FIRESTORE QUEUE' : 'SAMPLE RFQ DOSSIERS'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Procurement Enquiries & Quotations</h1>
          <p className="text-xs text-slate-400">Review technical requirements, track dispatch statuses, and issue official B2B proposals.</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#121823] border border-[#273244] rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-[#273244] flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs w-full md:w-80 focus-within:border-[#22D3EE] transition-colors">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input 
              type="text"
              placeholder="Search by ID, client or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#090B10] border border-[#273244] text-slate-200 text-xs focus:border-[#22D3EE] focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
              >
                <option value="all">All Enquiries</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="quoted">Quoted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap pl-2">
              {filtered.length} requests
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-[#0D1118] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                <th className="px-5 py-3.5">Enquiry ID</th>
                <th className="px-5 py-3.5">Client Enterprise</th>
                <th className="px-5 py-3.5">Procurement Type</th>
                <th className="px-5 py-3.5">Date Submitted</th>
                <th className="px-5 py-3.5">Workflow Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273244]/60 text-xs text-slate-300">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-6 bg-[#18212D] rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No procurement enquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#18212D]/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#22D3EE]">{enq.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-100">{enq.customerInfo?.name}</div>
                      <div className="text-[11px] text-slate-400">{enq.customerInfo?.company}</div>
                    </td>
                    <td className="px-5 py-3.5 capitalize text-slate-300">
                      {enq.type} RFQ
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {formatAdminDate(enq.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedEnquiry(enq)}
                        className="px-2.5 py-1 rounded bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 text-slate-300 hover:text-[#22D3EE] text-xs transition-colors inline-flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#22D3EE]" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  RFQ Dossier: {selectedEnquiry.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Customer Name</span>
                <span className="text-slate-100 font-bold">{selectedEnquiry.customerInfo?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Enterprise</span>
                <span className="text-slate-200">{selectedEnquiry.customerInfo?.company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Email Address</span>
                <span className="text-slate-200">{selectedEnquiry.customerInfo?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Telephone</span>
                <span className="text-slate-200">{selectedEnquiry.customerInfo?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#273244]/50">
                <span className="text-slate-400">Submitted</span>
                <span className="text-slate-200">{formatAdminDate(selectedEnquiry.createdAt)}</span>
              </div>

              {/* Status Update Control */}
              <div className="pt-2 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Update Workflow Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'reviewing', 'quoted', 'closed'] as const).map(st => (
                    <button
                      key={st}
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedEnquiry.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all border focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none ${
                        selectedEnquiry.status === st
                          ? 'bg-[#22D3EE] text-slate-950 border-[#22D3EE]'
                          : 'bg-[#18212D] text-slate-300 border-[#273244] hover:border-[#22D3EE]/50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specification Data */}
              {selectedEnquiry.data && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Technical Payload & Bill of Quantities
                  </span>
                  <pre className="p-3 rounded-lg bg-[#090B10] border border-[#273244] text-[11px] text-slate-300 overflow-x-auto custom-scrollbar font-mono">
                    {JSON.stringify(selectedEnquiry.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-1.5 rounded-lg bg-[#18212D] border border-[#273244] hover:bg-[#1E293B] hover:border-[#22D3EE]/50 text-slate-200 text-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
