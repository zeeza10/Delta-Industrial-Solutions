/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const demoEnquiries = [
    { 
      id: 'ENQ-2026-001', 
      type: 'cable', 
      status: 'pending', 
      customerInfo: { name: 'John Smith', company: 'Global Infra', email: 'john@globalinfra.com' },
      createdAt: '2026-10-24T10:30:00Z',
      data: { cables: [{ type: 'XLPE', cores: 3, area: '240mm', length: 500 }] }
    },
    { 
      id: 'ENQ-2026-002', 
      type: 'bulk', 
      status: 'reviewing', 
      customerInfo: { name: 'Sarah Lee', company: 'Industrial Systems', email: 'sarah@indsys.com' },
      createdAt: '2026-10-23T14:20:00Z',
      data: { products: [{ sku: 'MCCB-T5-630', quantity: 12 }] }
    },
    { 
      id: 'ENQ-2026-003', 
      type: 'project', 
      status: 'quoted', 
      customerInfo: { name: 'Mike Ross', company: 'City Power', email: 'mike@citypower.com' },
      createdAt: '2026-10-22T09:15:00Z',
      data: { projectName: 'Substation Alpha', timeline: 'Q1 2027' }
    }
  ];

  useEffect(() => {
    const fetchEnquiries = async () => {
      if (!db) {
        setEnquiries(demoEnquiries);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setEnquiries(fetched.length > 0 ? fetched : demoEnquiries);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'enquiries');
        setEnquiries(demoEnquiries);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  const filtered = enquiries.filter(e => 
    e.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.customerInfo.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full uppercase">Pending</span>;
      case 'reviewing': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase">Reviewing</span>;
      case 'quoted': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase">Quoted</span>;
      case 'closed': return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase">Closed</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Procurement Enquiries</h1>
        <p className="text-gray-600 mt-1">Review and manage B2B quotation requests.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name, company or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                   {String.fromCharCode(64 + i)}
                 </div>
               ))}
             </div>
             <span className="text-xs text-gray-500 font-medium">3 Active Reviewers</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Enquiry</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.map((enq) => (
                <tr key={enq.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-50 text-primary flex items-center justify-center">
                        <MessageSquare size={16} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{enq.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{enq.customerInfo.name}</p>
                      <p className="text-xs text-gray-500 truncate">{enq.customerInfo.company}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {enq.type} Enquiry
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(enq.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 group-hover:text-primary transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
