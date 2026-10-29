/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Context & Provider
export { AdminProvider, useAdmin } from './context/AdminContext';

// Types
export * from './types/admin.types';

// Hooks
export { useAdminStats } from './hooks/useAdminStats';
export { useAdminPermissions } from './hooks/useAdminPermissions';

// Services
export { adminService } from './services/adminService';

// Layout & Common Components
export { VIPAdminLayout } from './components/layout/VIPAdminLayout';
export { AdminSidebar } from './components/layout/AdminSidebar';
export { AdminHeader } from './components/layout/AdminHeader';
export { AdminStatCard } from './components/common/AdminStatCard';
export { AdminBadge } from './components/common/AdminBadge';
export { QuickActionsWidget } from './components/widgets/QuickActionsWidget';
export { SystemHealthWidget } from './components/widgets/SystemHealthWidget';

// Views / Pages
export { VIPDashboard } from './pages/VIPDashboard';
export { VIPAnalytics } from './pages/VIPAnalytics';
export { VIPUserManager } from './pages/VIPUserManager';
export { VIPSettingsManager } from './pages/VIPSettingsManager';
export { VIPCategoryManager } from './pages/VIPCategoryManager';
export { VIPBrandManager } from './pages/VIPBrandManager';
