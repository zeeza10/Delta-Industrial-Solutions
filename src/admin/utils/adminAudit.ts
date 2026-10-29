/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { adminService } from '../services/adminService';
import { AdminActivityLog } from '../types/admin.types';

/**
 * General helper to record an administrative action in audit logs.
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

/**
 * Log successful admin sign-in event
 */
export const logAdminSignIn = async (
  adminUid: string,
  adminEmail: string,
  adminName: string
): Promise<void> => {
  await recordAdminAction(
    adminUid,
    adminName || adminEmail,
    'login',
    'security',
    `Successful administrative authentication session initiated for ${adminEmail}`
  );
};

/**
 * Log admin sign-out event
 */
export const logAdminSignOut = async (
  adminUid: string,
  adminEmail: string,
  adminName: string
): Promise<void> => {
  await recordAdminAction(
    adminUid,
    adminName || adminEmail,
    'logout',
    'security',
    `Administrative session terminated cleanly for ${adminEmail}`
  );
};

/**
 * Log failed authentication attempt
 */
export const logAdminAuthFailed = async (
  email: string,
  reason: string
): Promise<void> => {
  await recordAdminAction(
    'unauthenticated',
    'Security Subsystem',
    'auth_failure',
    'security',
    `Failed administrative sign-in attempt for ${email}: ${reason}`
  );
};

/**
 * Log owner account bootstrapping
 */
export const logOwnerBootstrap = async (
  ownerUid: string,
  ownerEmail: string
): Promise<void> => {
  await recordAdminAction(
    ownerUid,
    'Root System Owner',
    'owner_bootstrap',
    'users',
    `Designated root owner account (${ownerEmail}) verified and bootstrapped into /admins collection`,
    ownerUid
  );
};

/**
 * Log role assignment or modification
 */
export const logRoleAssignment = async (
  actorUid: string,
  actorName: string,
  targetUid: string,
  targetEmail: string,
  newRole: string
): Promise<void> => {
  await recordAdminAction(
    actorUid,
    actorName,
    'role_assignment',
    'users',
    `Assigned clearance role '${newRole.toUpperCase()}' to ${targetEmail}`,
    targetUid
  );
};

/**
 * Log account suspension or activation
 */
export const logUserSuspension = async (
  actorUid: string,
  actorName: string,
  targetUid: string,
  targetEmail: string,
  suspended: boolean
): Promise<void> => {
  await recordAdminAction(
    actorUid,
    actorName,
    'suspension',
    'users',
    `Account ${targetEmail} status updated to: ${suspended ? 'SUSPENDED' : 'ACTIVE'}`,
    targetUid
  );
};

