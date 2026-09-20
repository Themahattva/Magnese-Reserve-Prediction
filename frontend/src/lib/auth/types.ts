export type EmployeeRole =
  | 'employee'
  | 'geologist'
  | 'production_manager'
  | 'mine_manager'
  | 'data_analyst'
  | 'administrator'
  | 'super_admin';

export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type Permission =
  | 'VIEW_DASHBOARD'
  | 'VIEW_EXPLORATION'
  | 'VIEW_BOREHOLES'
  | 'VIEW_PRODUCTION'
  | 'VIEW_EQUIPMENT'
  | 'RUN_FORECAST'
  | 'RUN_WHAT_IF'
  | 'VIEW_DECISIONS'
  | 'APPROVE_ACTIONS'
  | 'VIEW_DATA_QUALITY'
  | 'VIEW_MODELS'
  | 'MANAGE_MODELS'
  | 'GENERATE_REPORTS'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_EMPLOYEES';

export interface Employee {
  id: string;
  auth_user_id?: string;
  employee_id: string;
  full_name: string;
  email: string;
  designation: string;
  department: string;
  mine_location: string;
  employee_type?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface SessionUser {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  designation: string;
  department: string;
  mine_location: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  last_login_at?: string;
}

export interface AuthAuditLog {
  id: string;
  employee_id: string;
  event_type:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'LOGOUT'
    | 'PASSWORD_RESET_REQUEST'
    | 'PASSWORD_RESET_SUCCESS'
    | 'ACCOUNT_LOCKED'
    | 'ACCOUNT_UNLOCKED'
    | 'SESSION_EXPIRED'
    | 'UNAUTHORIZED_ACCESS_ATTEMPT';
  success: boolean;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
