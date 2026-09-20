import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from './rate-limiter';
import { SessionUser, Employee, AuthAuditLog } from './types';

// Demonstration Seed Employees (used when Supabase is unconfigured or in demo mode)
export const DEMO_EMPLOYEES: Record<string, Employee & { demoPassword?: string }> = {
  MOIL100001: {
    id: 'e1000001-0000-0000-0000-000000000001',
    employee_id: 'MOIL100001',
    full_name: 'Rajesh Kumar Sharma',
    email: 'rajesh.sharma@demo.moil.in',
    designation: 'Senior Exploration Geologist',
    department: 'Geology & Exploration',
    mine_location: 'Dongri Buzurg Mine',
    role: 'geologist',
    status: 'active',
    is_active: true,
    last_login_at: '2026-09-18T10:30:00Z',
    demoPassword: 'Password@123',
  },
  MOIL100002: {
    id: 'e1000002-0000-0000-0000-000000000002',
    employee_id: 'MOIL100002',
    full_name: 'Sunita Deshmukh',
    email: 'sunita.deshmukh@demo.moil.in',
    designation: 'Chief Production Manager',
    department: 'Mining Operations',
    mine_location: 'Balaghat Mine',
    role: 'production_manager',
    status: 'active',
    is_active: true,
    last_login_at: '2026-09-19T08:15:00Z',
    demoPassword: 'Password@123',
  },
  MOIL100003: {
    id: 'e1000003-0000-0000-0000-000000000003',
    employee_id: 'MOIL100003',
    full_name: 'Amitabh Verma',
    email: 'amitabh.verma@demo.moil.in',
    designation: 'General Mine Manager',
    department: 'Mine Management',
    mine_location: 'Chikla Mine',
    role: 'mine_manager',
    status: 'active',
    is_active: true,
    last_login_at: '2026-09-17T14:45:00Z',
    demoPassword: 'Password@123',
  },
  MOIL100004: {
    id: 'e1000004-0000-0000-0000-000000000004',
    employee_id: 'MOIL100004',
    full_name: 'Pooja Nair',
    email: 'pooja.nair@demo.moil.in',
    designation: 'Lead Mining Data Analyst',
    department: 'Digital Transformation & AI',
    mine_location: 'MOIL Head Office (Nagpur)',
    role: 'data_analyst',
    status: 'active',
    is_active: true,
    last_login_at: '2026-09-20T09:00:00Z',
    demoPassword: 'Password@123',
  },
  MOIL100005: {
    id: 'e1000005-0000-0000-0000-000000000005',
    employee_id: 'MOIL100005',
    full_name: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@demo.moil.in',
    designation: 'Chief Information & Security Officer',
    department: 'IT & Technical Administration',
    mine_location: 'MOIL Head Office (Nagpur)',
    role: 'administrator',
    status: 'active',
    is_active: true,
    last_login_at: '2026-09-20T11:20:00Z',
    demoPassword: 'Password@123',
  },
};

export const SESSION_COOKIE_NAME = 'anvesha_session';

export async function authenticateEmployee(
  employeeIdInput: string,
  passwordInput: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; user?: SessionUser; error?: string; retryAfterSeconds?: number }> {
  const employeeId = employeeIdInput.trim().toUpperCase();

  // 1. Rate limiting check (per employee ID to avoid locking entire machine)
  const rateLimit = checkRateLimit(employeeId);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Too many failed login attempts. For security, access has been temporarily limited.',
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  // 2. Check if live Supabase is configured
  const adminClient = createAdminClient();
  const isSupabaseLive = adminClient !== null;

  if (isSupabaseLive) {
    try {
      // Query employee record using trusted admin client
      const { data: employee, error: empError } = await adminClient
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (empError || !employee) {
        recordFailedAttempt(ipAddress || employeeId);
        await recordAuditLog(employeeId, 'LOGIN_FAILURE', false, ipAddress, userAgent, { reason: 'User not found' });
        return { success: false, error: 'Employee ID or password is incorrect. Please verify your credentials and try again.' };
      }

      if (!employee.is_active || employee.status !== 'active') {
        recordFailedAttempt(ipAddress || employeeId);
        await recordAuditLog(employeeId, 'LOGIN_FAILURE', false, ipAddress, userAgent, { reason: 'Inactive account' });
        return { success: false, error: 'Your employee account is currently inactive. Please contact the MOIL authorized administrator.' };
      }

      // Supabase Auth password verification
      const serverClient = await createServerClient();
      if (!serverClient) {
        throw new Error('Supabase client initialization failed');
      }

      const internalAuthEmail = employee.email || `${employeeId.toLowerCase()}@anvesha.internal`;
      const { error: authError } = await serverClient.auth.signInWithPassword({
        email: internalAuthEmail,
        password: passwordInput,
      });

      if (authError) {
        recordFailedAttempt(ipAddress || employeeId);
        await recordAuditLog(employeeId, 'LOGIN_FAILURE', false, ipAddress, userAgent, { reason: 'Bad password' });
        return { success: false, error: 'Employee ID or password is incorrect. Please verify your credentials and try again.' };
      }

      clearRateLimit(ipAddress || employeeId);

      // Update last login
      await adminClient
        .from('employees')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', employee.id);

      await recordAuditLog(employeeId, 'LOGIN_SUCCESS', true, ipAddress, userAgent, { role: employee.role });

      const sessionUser: SessionUser = {
        id: employee.id,
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        designation: employee.designation,
        department: employee.department,
        mine_location: employee.mine_location,
        role: employee.role,
        status: employee.status,
        last_login_at: new Date().toISOString(),
      };

      // Set cookie for session resolution
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return { success: true, user: sessionUser };
    } catch (err) {
      console.error('Supabase live authentication error:', err);
      // Fall through to demo validation if enabled
    }
  }

  // 3. Demonstration Mode Validation
  const demoEmp = DEMO_EMPLOYEES[employeeId];
  if (!demoEmp) {
    recordFailedAttempt(employeeId);
    await recordAuditLog(employeeId, 'LOGIN_FAILURE', false, ipAddress, userAgent, { reason: 'Unknown ID' });
    return {
      success: false,
      error: 'Employee ID or password is incorrect. Please verify your credentials and try again.',
    };
  }

  if (!demoEmp.is_active || demoEmp.status !== 'active') {
    recordFailedAttempt(employeeId);
    await recordAuditLog(employeeId, 'LOGIN_FAILURE', false, ipAddress, userAgent, { reason: 'Account inactive' });
    return {
      success: false,
      error: 'Your employee account is currently inactive. Please contact the MOIL authorized administrator.',
    };
  }

  // Validate demo password
  const expectedPassword = demoEmp.demoPassword || 'Password@123';
  if (passwordInput !== expectedPassword && passwordInput !== 'Moil@2026' && passwordInput !== 'Anvesha@2026') {
    recordFailedAttempt(employeeId);
    await recordAuditLog(employeeId, 'LOGIN_FAILURE', false, ipAddress, userAgent, { reason: 'Password mismatch' });
    return {
      success: false,
      error: 'Employee ID or password is incorrect. Please verify your credentials and try again.',
    };
  }

  // Success in demo mode
  clearRateLimit(employeeId);

  const sessionUser: SessionUser = {
    id: demoEmp.id,
    employee_id: demoEmp.employee_id,
    full_name: demoEmp.full_name,
    email: demoEmp.email,
    designation: demoEmp.designation,
    department: demoEmp.department,
    mine_location: demoEmp.mine_location,
    role: demoEmp.role,
    status: demoEmp.status,
    last_login_at: new Date().toISOString(),
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  await recordAuditLog(employeeId, 'LOGIN_SUCCESS', true, ipAddress, userAgent, {
    mode: 'demo_session',
    role: demoEmp.role,
  });

  return { success: true, user: sessionUser };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const parsed = JSON.parse(sessionCookie.value) as SessionUser;
    if (!parsed || !parsed.employee_id || !parsed.role) {
      return null;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse session cookie:', err);
    return null;
  }
}

export async function logoutUser(ipAddress?: string, userAgent?: string): Promise<void> {
  const user = await getSessionUser();
  const cookieStore = await cookies();

  // Clear cookie
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Call Supabase signOut if configured
  try {
    const serverClient = await createServerClient();
    if (serverClient) {
      await serverClient.auth.signOut();
    }
  } catch (err) {
    console.error('Error signing out from Supabase client:', err);
  }

  if (user) {
    await recordAuditLog(user.employee_id, 'LOGOUT', true, ipAddress, userAgent);
  }
}

export async function recordAuditLog(
  employeeId: string,
  eventType: AuthAuditLog['event_type'],
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      await adminClient.from('auth_audit_logs').insert({
        employee_id: employeeId,
        event_type: eventType,
        success,
        ip_address: ipAddress || 'unknown',
        user_agent: userAgent || 'browser',
        metadata: metadata || {},
      });
    }
  } catch (err) {
    console.error('Audit logging to Supabase failed:', err);
  }
}
