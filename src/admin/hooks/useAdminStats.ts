/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useExecutiveDashboard } from './useExecutiveDashboard';

export const useAdminStats = () => {
  const { metrics, loading, error, refetch } = useExecutiveDashboard();
  return { metrics, loading, error, refetch };
};
