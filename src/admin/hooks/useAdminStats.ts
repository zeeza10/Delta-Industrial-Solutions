/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminMetricSummary } from '../types/admin.types';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { PRODUCTS } from '../../data/products';

export const useAdminStats = () => {
  const [metrics, setMetrics] = useState<AdminMetricSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let productCount = PRODUCTS.length;
      let enquiryCount = 4;
      let isLiveDb = false;

      if (db) {
        try {
          const prodSnap = await getDocs(query(collection(db, 'products'), limit(150)));
          if (!prodSnap.empty) {
            productCount = prodSnap.size;
            isLiveDb = true;
          }
          const enqSnap = await getDocs(query(collection(db, 'enquiries'), limit(150)));
          if (!enqSnap.empty) {
            enquiryCount = enqSnap.size;
            isLiveDb = true;
          }
        } catch {
          // Fall back gracefully to base catalog counts
        }
      }

      setMetrics([
        {
          id: 'total_products',
          title: 'Catalog SKUs',
          value: productCount,
          description: isLiveDb ? 'Live Firestore records' : 'Catalog repository',
          iconName: 'Package',
          highlightVariant: 'info',
        },
        {
          id: 'active_enquiries',
          title: 'Procurement RFQs',
          value: enquiryCount,
          description: 'Awaiting quotation response',
          iconName: 'MessageSquare',
          highlightVariant: 'warning',
        },
        {
          id: 'b2b_users',
          title: 'Enterprise Accounts',
          value: 4,
          description: 'Verified contractor entities',
          iconName: 'Users',
          highlightVariant: 'vip',
        },
        {
          id: 'avg_turnaround',
          title: 'Quotation Window',
          value: '24-48h',
          description: 'Target SLA benchmark',
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
