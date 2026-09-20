-- ANVESHA Database Migration 001: Create Employees Table
-- Organization: MOIL Limited (A Government of India Enterprise)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    designation TEXT,
    department TEXT,
    mine_location TEXT,
    employee_type TEXT DEFAULT 'regular',
    role TEXT NOT NULL CHECK (role IN (
        'employee',
        'geologist',
        'production_manager',
        'mine_manager',
        'data_analyst',
        'administrator',
        'super_admin'
    )),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active',
        'inactive',
        'suspended',
        'pending'
    )),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON public.employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
