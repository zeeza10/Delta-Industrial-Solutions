/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — VIP Executive Command Center & Business Intelligence
 * Phase 5 Production Implementation
 */

import React, { useState } from 'react';
import { useExecutiveDashboard } from '../hooks/useExecutiveDashboard';
import { AdminStatCard } from '../components/common/AdminStatCard';
import { WidgetErrorBoundary } from '../components/common/WidgetErrorBoundary';
import { RevenuePerformanceWidget } from '../components/widgets/RevenuePerformanceWidget';
import { BusinessActivityChartsWidget } from '../components/widgets/BusinessActivityChartsWidget';
import { PriorityEnquiriesWidget } from '../components/widgets/PriorityEnquiriesWidget';
import { RecentOrdersWidget } from '../components/widgets/RecentOrdersWidget';
import { InventoryHealthWidget } from '../components/widgets/InventoryHealthWidget';
import { ProcurementWidget } from '../components/widgets/ProcurementWidget';
import { QuickActionsWidget } from '../components/widgets/QuickActionsWidget';
import { SystemHealthWidget } from '../components/widgets/SystemHealthWidget';
import { RecentActivityWidget } from '../components/widgets/RecentActivityWidget';
import { LowStockAlertWidget } from '../components/widgets/LowStockAlertWidget';
import { AdminBadge } from '../components/common/AdminBadge';
import { ArrowUpRight, RefreshCw, Clock, Database, Info, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const VIPDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    metrics, 
    rawOrders,
    enquiries, 
    quotations,
    purchaseOrders,
    isProcurementLive,
    recentAuditLogs, 
    lowStockRecords, 
    categoryDist, 
    revenueMetrics,
    enquiryBreakdown,
    quotationBreakdown,
    inventoryHealth,
    availabilityMatrix,
    dateFilter,
    setDateFilter,
    customRange,
    setCustomRange,
    loading, 
    error, 
    lastUpdated, 
    refetch 
  } = useExecutiveDashboard();

  const [activeViewTab, setActiveViewTab] = useState<'overview' | 'revenue' | 'analytics' | 'queue' | 'procurement' | 'audit_matrix'>('overview');
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // User display metadata
  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Executive Owner';
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Executive Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#273244] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <AdminBadge variant="vip">EXECUTIVE MATRIX</AdminBadge>
            <span className="text-[10px] text-[#22D3EE] font-mono bg-[#18212D] px-2 py-0.5 rounded border border-[#273244]">
              VIP COMMAND CENTER v2.0
            </span>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#22D3EE]" />
              <span>{currentDateFormatted}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            Welcome back, <span className="text-[#22D3EE]">{userDisplayName}</span>
          </h1>

          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Real-time executive oversight, high-velocity electrical procurement supervision, live inventory control, and zero-trust security audit logs.
          </p>
        </div>

        {/* Action Controls & Data Freshness Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="text-right font-mono text-[11px] text-slate-400 bg-[#121823] px-3 py-1.5 rounded-lg border border-[#273244] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              LIVE FIRESTORE FEED • {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Syncing...'}
            </span>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="p-1 text-slate-400 hover:text-[#22D3EE] transition-colors disabled:opacity-50 outline-none rounded focus-visible:ring-1 focus-visible:ring-[#22D3EE]"
              title="Refresh Live Business Intelligence"
              aria-label="Refresh Live Business Intelligence"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMatrixModal(!showMatrixModal)}
              className="px-3 py-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 hover:bg-[#1E293B] text-slate-200 hover:text-white font-mono text-xs transition-colors flex items-center gap-1.5 outline-none"
              title="Inspect Metric Source Matrix"
            >
              <Database className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Data Audit Matrix</span>
            </button>
            <Link
              to="/admin/enquiries"
              className="px-3.5 py-2 rounded-lg bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-mono font-bold text-xs tracking-wider uppercase transition-colors shadow-sm flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
            >
              <span>Review RFQs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-950" />
            </Link>
          </div>
        </div>
      </div>

      {/* Data Availability Matrix Inspector Modal / Section */}
      {showMatrixModal && (
        <div className="bg-[#121823] border border-[#22D3EE]/40 rounded-xl p-5 shadow-xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-[#273244] pb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#22D3EE]" />
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Phase 5 Executive Data Availability & Source Matrix
              </h2>
            </div>
            <button
              onClick={() => setShowMatrixModal(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Close [X]
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0D1118] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#273244]">
                  <th className="px-3 py-2">Executive Metric</th>
                  <th className="px-3 py-2">Source Collection</th>
                  <th className="px-3 py-2">Query Strategy</th>
                  <th className="px-3 py-2">Permission Level</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#273244]/60 text-slate-300">
                {availabilityMatrix.map(item => (
                  <tr key={item.metric} className="hover:bg-[#18212D]/60 transition-colors">
                    <td className="px-3 py-2 font-bold text-[#22D3EE]">{item.metric}</td>
                    <td className="px-3 py-2 font-mono text-slate-300">{item.sourceCollection}</td>
                    <td className="px-3 py-2 text-slate-400">{item.queryStrategy}</td>
                    <td className="px-3 py-2 text-slate-400">{item.permissionRequirements}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        item.availabilityStatus === 'Live Firestore'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : item.availabilityStatus === 'Sample Data'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {item.availabilityStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Section Tabs */}
      <div className="flex items-center gap-2 border-b border-[#273244] pb-2 text-xs overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Overview Matrix' },
          { id: 'revenue', label: 'Revenue Performance' },
          { id: 'analytics', label: 'Business Activity Charts' },
          { id: 'queue', label: 'Priority RFQs & Orders' },
          { id: 'procurement', label: 'Procurement Overview' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveViewTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
              activeViewTab === tab.id
                ? 'bg-[#22D3EE] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#18212D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 8 Responsive Executive KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <AdminStatCard key={i} loading={true} />
            ))
          : error
          ? Array.from({ length: 8 }).map((_, i) => (
              <AdminStatCard key={i} error={error} />
            ))
          : metrics.map((metric) => (
              <AdminStatCard key={metric.id} metric={metric} />
            ))}
      </div>

      {/* Tab View Content: Revenue Performance Section */}
      {(activeViewTab === 'overview' || activeViewTab === 'revenue') && (
        <WidgetErrorBoundary widgetTitle="Revenue Performance Section">
          <RevenuePerformanceWidget
            revenueMetrics={revenueMetrics}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
            loading={loading}
          />
        </WidgetErrorBoundary>
      )}

      {/* Main Multi-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Priority RFQs, Business Charts, Orders, Inventory, Procurement */}
        <div className="lg:col-span-2 space-y-6">
          {(activeViewTab === 'overview' || activeViewTab === 'queue') && (
            <>
              {/* Priority Procurement RFQ Queue Table */}
              <WidgetErrorBoundary widgetTitle="Priority RFQ Queue">
                <PriorityEnquiriesWidget enquiries={enquiries} loading={loading} />
              </WidgetErrorBoundary>

              {/* Recent B2B Orders Panel */}
              <WidgetErrorBoundary widgetTitle="Recent Orders Panel">
                <RecentOrdersWidget orders={rawOrders} loading={loading} />
              </WidgetErrorBoundary>
            </>
          )}

          {(activeViewTab === 'overview' || activeViewTab === 'procurement') && (
            /* Procurement Overview Panel */
            <WidgetErrorBoundary widgetTitle="Procurement Overview">
              <ProcurementWidget
                purchaseOrders={purchaseOrders}
                isLiveDb={isProcurementLive}
                loading={loading}
              />
            </WidgetErrorBoundary>
          )}

          {(activeViewTab === 'overview' || activeViewTab === 'analytics') && (
            /* Business Activity Charts Grid */
            <WidgetErrorBoundary widgetTitle="Business Activity Charts">
              <BusinessActivityChartsWidget
                enquiryBreakdown={enquiryBreakdown}
                quotationBreakdown={quotationBreakdown}
                categoryDist={categoryDist}
                loading={loading}
              />
            </WidgetErrorBoundary>
          )}

          {(activeViewTab === 'overview' || activeViewTab === 'revenue') && (
            /* Executive Inventory Health Panel */
            <WidgetErrorBoundary widgetTitle="Inventory Health Panel">
              <InventoryHealthWidget inventoryHealth={inventoryHealth} loading={loading} />
            </WidgetErrorBoundary>
          )}
        </div>

        {/* Right 1 Column: Operational Controls & Live Probes */}
        <div className="space-y-6">
          <WidgetErrorBoundary widgetTitle="Quick Actions">
            <QuickActionsWidget />
          </WidgetErrorBoundary>

          <WidgetErrorBoundary widgetTitle="System Health Probes">
            <SystemHealthWidget />
          </WidgetErrorBoundary>

          <WidgetErrorBoundary widgetTitle="Low Stock Monitor">
            <LowStockAlertWidget records={lowStockRecords} loading={loading} />
          </WidgetErrorBoundary>

          <WidgetErrorBoundary widgetTitle="Recent Audit Feed">
            <RecentActivityWidget logs={recentAuditLogs} loading={loading} />
          </WidgetErrorBoundary>
        </div>
      </div>
    </div>
  );
};
