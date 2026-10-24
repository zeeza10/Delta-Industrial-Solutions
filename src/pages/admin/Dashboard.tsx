/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Package, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Clock,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { seedDatabase, promoteToAdmin } from '../../utils/dbSeed';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { name: 'Total Products', value: '54', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Active Enquiries', value: '12', icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-100' },
  { name: 'Total Users', value: '128', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  { name: 'Avg. Response Time', value: '4.2h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
];

const recentEnquiries = [
  { id: 'ENQ-001', type: 'Cable Enquiry', customer: 'Global Infra Ltd', date: '2026-10-24', status: 'pending' },
  { id: 'ENQ-002', type: 'Bulk Quote', customer: 'Industrial Systems', date: '2026-10-23', status: 'reviewing' },
  { id: 'ENQ-003', type: 'Project Enquiry', customer: 'City Power Grid', date: '2026-10-23', status: 'pending' },
  { id: 'ENQ-004', type: 'Cable Enquiry', customer: 'Marine Electrics', date: '2026-10-22', status: 'quoted' },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Real-time performance and enquiry metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Enquiries Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="text-primary text-sm font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{enq.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{enq.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{enq.customer}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        enq.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        enq.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-primary">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links / Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-left">
                <span className="text-sm font-medium">Add New Product</span>
                <Package size={18} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-left">
                <span className="text-sm font-medium">Create Category</span>
                <Layers size={18} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-left">
                <span className="text-sm font-medium">User Management</span>
                <Users size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-dashed border-primary/50">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="text-primary" size={18} />
              Setup & Development
            </h2>
            <div className="space-y-3">
              <button 
                onClick={async () => {
                  try {
                    await seedDatabase();
                    alert('Catalog seeded successfully!');
                  } catch (e: any) {
                    alert('Error: ' + e.message);
                  }
                }}
                className="w-full p-2 text-xs font-semibold bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                Seed Industrial Catalog
              </button>
              <button 
                onClick={async () => {
                  if (!user) {
                    alert('Please sign in first');
                    return;
                  }
                  try {
                    await promoteToAdmin(user.uid);
                    alert('You are now an admin! Please refresh the page.');
                  } catch (e: any) {
                    alert('Error: ' + e.message);
                  }
                }}
                className="w-full p-2 text-xs font-semibold bg-teal text-white rounded hover:bg-teal/90 transition-colors"
              >
                Promote Myself to Admin
              </button>
              <p className="text-[10px] text-gray-500 italic">
                Use these buttons to initialize the database and your admin access.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#163B65] to-[#102A43] p-6 rounded-xl shadow-sm text-white">
            <TrendingUp className="text-teal mb-4" size={32} />
            <h3 className="font-bold text-lg">System Status</h3>
            <p className="text-blue-100 text-sm mt-1">All systems operational. Firestore indexing active.</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-medium text-green-400 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
