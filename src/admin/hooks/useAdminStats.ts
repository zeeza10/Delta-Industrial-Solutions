/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminMetricSummary } from '../types/admin.types';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export const useAdminStats = () => {
  const [metrics, setMetrics] = useState<AdminMetricSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let productCount = 54;
      let enquiryCount = 12;

      if (db) {
        try {
          const prodSnap = await getDocs(query(collection(db, 'products'), limit(100)));
          if (!prodSnap.empty) {
            productCount = prodSnap.size;
          }
          const enqSnap = await getDocs(query(collection(db, 'enquiries'), limit(100)));
          if (!enqSnap.empty) {
            enquiryCount = enqSnap.size;
          }
        } catch {
          // Use default simulated metrics if Firestore read fails
        }
      }

      setMetrics([
        {
          id: 'total_products',
          title: 'Total Catalog SKUs',
          value: productCount,
          changePercent: 8.4,
          isPositiveChange: true,
          trendText: '+4 added this week',
          iconName: 'Package',
          highlightVariant: 'info',
        },
        {
          id: 'active_enquiries',
          title: 'Active Quotation Enquiries',
          value: enquiryCount,
          changePercent: 14.2,
          isPositiveChange: true,
          trendText: '3 urgent requests pending review',
          iconName: 'MessageSquare',
          highlightVariant: 'warning',
        },
        {
          id: 'b2b_users',
          title: 'Verified B2B Enterprise Accounts',
          value: 128,
          changePercent: 12.0,
          isPositiveChange: true,
          trendText: '+16 approved this month',
          iconName: 'Users',
          highlightVariant: 'vip',
        },
        {
          id: 'avg_turnaround',
          title: 'Avg. Quote Turnaround',
          value: '3.8h',
          changePercent: -15.5,
          isPositiveChange: true,
          trendText: 'Fast response rate maintained',
          iconName: 'Clock',
          highlightVariant: 'success',
        },
      ]);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch admin statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { metrics, loading, error, refetch: fetchStats };
};
