/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Dedicated Route Tree
export { adminRoutes } from './routes/adminRoutes';

// Layouts & Shell
export { AdminLayout, VIPAdminLayout, AdminSidebar, AdminHeader } from './layouts';

// Context & Provider
export { AdminProvider, useAdmin } from './context/AdminContext';

// Types
export * from './types/admin.types';

// Constants
export * from './constants/adminConstants';

// Utilities & Audit
export * from './utils/adminFormatters';
export * from './utils/adminAudit';

// Styles
export { adminStyles } from './styles/adminStyles';

// Hooks
export { useAdminStats } from './hooks/useAdminStats';
export { useAdminPermissions } from './hooks/useAdminPermissions';

// Services
export { adminService } from './services/adminService';

// Common Components & Widgets
export { AdminStatCard } from './components/common/AdminStatCard';
export { AdminBadge } from './components/common/AdminBadge';
export { QuickActionsWidget } from './components/widgets/QuickActionsWidget';
export { SystemHealthWidget } from './components/widgets/SystemHealthWidget';

// Views & Pages
export { VIPDashboard } from './pages/VIPDashboard';
export { VIPAnalytics } from './pages/VIPAnalytics';
export { VIPUserManager } from './pages/VIPUserManager';
export { VIPSettingsManager } from './pages/VIPSettingsManager';
export { VIPCategoryManager } from './pages/VIPCategoryManager';
export { VIPBrandManager } from './pages/VIPBrandManager';
export { VIPProductManager } from './pages/VIPProductManager';
export { VIPEnquiryManager } from './pages/VIPEnquiryManager';
