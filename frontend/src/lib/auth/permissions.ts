import { EmployeeRole, Permission } from './types';

export const ROLE_PERMISSIONS: Record<EmployeeRole, Permission[]> = {
  employee: [
    'VIEW_DASHBOARD',
    'VIEW_EXPLORATION',
    'VIEW_PRODUCTION',
    'VIEW_DECISIONS',
  ],
  geologist: [
    'VIEW_DASHBOARD',
    'VIEW_EXPLORATION',
    'VIEW_BOREHOLES',
    'RUN_WHAT_IF',
    'VIEW_DECISIONS',
    'VIEW_DATA_QUALITY',
    'GENERATE_REPORTS',
  ],
  production_manager: [
    'VIEW_DASHBOARD',
    'VIEW_PRODUCTION',
    'VIEW_EQUIPMENT',
    'RUN_FORECAST',
    'RUN_WHAT_IF',
    'VIEW_DECISIONS',
    'APPROVE_ACTIONS',
    'GENERATE_REPORTS',
  ],
  mine_manager: [
    'VIEW_DASHBOARD',
    'VIEW_EXPLORATION',
    'VIEW_PRODUCTION',
    'VIEW_EQUIPMENT',
    'RUN_FORECAST',
    'RUN_WHAT_IF',
    'VIEW_DECISIONS',
    'APPROVE_ACTIONS',
    'GENERATE_REPORTS',
    'VIEW_AUDIT_LOGS',
  ],
  data_analyst: [
    'VIEW_DASHBOARD',
    'VIEW_EXPLORATION',
    'VIEW_PRODUCTION',
    'RUN_WHAT_IF',
    'VIEW_DATA_QUALITY',
    'VIEW_MODELS',
    'MANAGE_MODELS',
    'GENERATE_REPORTS',
    'VIEW_AUDIT_LOGS',
  ],
  administrator: [
    'VIEW_DASHBOARD',
    'VIEW_EXPLORATION',
    'VIEW_BOREHOLES',
    'VIEW_PRODUCTION',
    'VIEW_EQUIPMENT',
    'RUN_FORECAST',
    'RUN_WHAT_IF',
    'VIEW_DECISIONS',
    'APPROVE_ACTIONS',
    'VIEW_DATA_QUALITY',
    'VIEW_MODELS',
    'MANAGE_MODELS',
    'GENERATE_REPORTS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_EMPLOYEES',
  ],
  super_admin: [
    'VIEW_DASHBOARD',
    'VIEW_EXPLORATION',
    'VIEW_BOREHOLES',
    'VIEW_PRODUCTION',
    'VIEW_EQUIPMENT',
    'RUN_FORECAST',
    'RUN_WHAT_IF',
    'VIEW_DECISIONS',
    'APPROVE_ACTIONS',
    'VIEW_DATA_QUALITY',
    'VIEW_MODELS',
    'MANAGE_MODELS',
    'GENERATE_REPORTS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_EMPLOYEES',
  ],
};

// Route-to-required-permission mapping
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/': 'VIEW_DASHBOARD',
  '/exploration': 'VIEW_EXPLORATION',
  '/production': 'VIEW_PRODUCTION',
  '/simulation': 'RUN_WHAT_IF',
  '/decisions': 'VIEW_DECISIONS',
  '/data': 'VIEW_DATA_QUALITY',
  '/models': 'VIEW_MODELS',
  '/reports': 'GENERATE_REPORTS',
  '/profile': 'VIEW_DASHBOARD',
};

export function hasPermission(role: EmployeeRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function canAccessRoute(role: EmployeeRole, path: string): boolean {
  // Find matching route prefix
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route === '/' && path === '/') {
      return hasPermission(role, permission);
    }
    if (route !== '/' && (path === route || path.startsWith(`${route}/`))) {
      return hasPermission(role, permission);
    }
  }
  return true;
}
