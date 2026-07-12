import { useAuthStore } from '../stores/useAuthStore';
import type { Role } from '../types';

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  fleet_manager: [
    'vehicles:read', 'vehicles:write',
    'drivers:read', 'drivers:write',
    'trips:read', 'trips:write', 'trips:dispatch',
    'maintenance:read', 'maintenance:write',
    'fuel:read', 'fuel:write',
    'reports:read', 'reports:export'
  ],
  dispatcher: [
    'vehicles:read',
    'drivers:read',
    'trips:read', 'trips:write', 'trips:dispatch',
    'fuel:read', 'fuel:write'
  ],
  safety_officer: [
    'vehicles:read',
    'drivers:read',
    'trips:read',
    'maintenance:read', 'maintenance:write',
    'reports:read'
  ],
  financial_analyst: [
    'fuel:read',
    'reports:read', 'reports:export'
  ],
};

export function useRBAC() {
  const user = useAuthStore((s) => s.user);
  
  const can = (permission: string) =>
    user ? (ROLE_PERMISSIONS[user.role] || []).includes(permission) : false;
    
  const isRole = (...roles: Role[]) => 
    user ? roles.includes(user.role) : false;
    
  return { can, isRole, role: user?.role };
}
