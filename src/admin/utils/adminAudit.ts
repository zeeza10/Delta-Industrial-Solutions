/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { adminService } from '../services/adminService';
import { AdminActivityLog } from '../types/admin.types';

/**
 * Record administrative action into security audit tracking
 */
export const recordAdminAction = async (
  adminUid: string,
  adminName: string,
  action: AdminActivityLog['action'],
  targetResource: AdminActivityLog['targetResource'],
  details: string,
  resourceId?: string
): Promise<void> => {
  await adminService.logAdminActivity({
    adminUid,
    adminName,
    action,
    targetResource,
    details,
    resourceId,
  });
};
