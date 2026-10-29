/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format numeric currency values for B2B financial and quotation reporting
 */
export const formatAdminCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format ISO timestamps into clean administration timestamps
 */
export const formatAdminDate = (isoString?: string): string => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
};

/**
 * Format relative time (e.g., '10m ago', '2h ago')
 */
export const formatAdminRelativeTime = (isoString?: string): string => {
  if (!isoString) return '—';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return isoString;
  }
};
