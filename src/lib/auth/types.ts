export type AdminRole = 'admin' | 'manager' | 'staff';

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: AdminRole;
}

export const ADMIN_ROLES: AdminRole[] = ['admin', 'manager', 'staff'];

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === 'string' && ADMIN_ROLES.includes(value as AdminRole);
}
