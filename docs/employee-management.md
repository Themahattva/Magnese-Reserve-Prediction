# ANVESHA — MOIL Employee Management & Administration Guide

## 1. Overview
This document outlines the administrative governance lifecycle for MOIL personnel using the ANVESHA portal.

> **GOVERNMENT ENTERPRISE NOTICE**:
> ANVESHA does not permit public employee self-registration. All employee credentials must be provisioned and authorized by the MOIL IT & Technical Administration Directorate.

---

## 2. Employee Provisioning Workflow

```text
MOIL Administration Directorate
           │
           ▼
1. Allocate Official MOIL Employee ID (e.g. MOIL100006)
           │
           ▼
2. Create Supabase Auth User:
   Email: MOIL100006@anvesha.internal
   Temporary Password / Secure Reset Link
           │
           ▼
3. Insert Profile Record in `public.employees`:
   - employee_id: MOIL100006
   - auth_user_id: [UUID from auth.users]
   - full_name: [Employee Full Name]
   - designation: [Official Designation]
   - department: [Assigned Department]
   - mine_location: [Mine Lease or HQ]
   - role: [geologist | production_manager | mine_manager | data_analyst | administrator]
   - status: active
           │
           ▼
4. Employee accesses portal at https://anvesha.moil.in/login
   using Employee ID + initial password
```

---

## 3. Account Status Lifecycle

### Activating an Account
```sql
UPDATE public.employees
SET status = 'active', is_active = TRUE, updated_at = NOW()
WHERE employee_id = 'MOIL100001';
```

### Suspending an Account
If an employee transfers out of mine jurisdiction or undergoes administrative review:
```sql
UPDATE public.employees
SET status = 'suspended', is_active = FALSE, updated_at = NOW()
WHERE employee_id = 'MOIL100001';
```
When an account is suspended or inactive:
- Login attempts fail immediately with: *"Your employee account is currently inactive. Please contact the MOIL authorized administrator."*
- An audit event `LOGIN_FAILURE` (`reason: Inactive account`) is recorded.

---

## 4. Role Assignment & Jurisdiction Changes
To reassign an employee's application permissions:
```sql
UPDATE public.employees
SET role = 'production_manager',
    mine_location = 'Balaghat Mine',
    designation = 'Chief Mining Operations Manager',
    updated_at = NOW()
WHERE employee_id = 'MOIL100002';
```

---

## 5. Reviewing Security & Authentication Audit Logs
Administrators can inspect immutable audit logs directly or via the Reports & Audit portal module:

```sql
SELECT
    created_at,
    employee_id,
    event_type,
    success,
    ip_address,
    user_agent,
    metadata
FROM public.auth_audit_logs
ORDER BY created_at DESC
LIMIT 50;
```
