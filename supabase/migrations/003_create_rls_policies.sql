-- ANVESHA Database Migration 003: Row Level Security (RLS) Policies
-- Organization: MOIL Limited (A Government of India Enterprise)

-- 1. Enable RLS on employees table
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view their own record
CREATE POLICY "Employees can view own record"
ON public.employees
FOR SELECT
USING (auth.uid() = auth_user_id);

-- Policy: Administrators and super_admins can view all employee records
CREATE POLICY "Admins can view all employees"
ON public.employees
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE auth_user_id = auth.uid()
        AND role IN ('administrator', 'super_admin')
    )
);

-- Policy: Only administrators can update employee records
CREATE POLICY "Admins can update employees"
ON public.employees
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE auth_user_id = auth.uid()
        AND role IN ('administrator', 'super_admin')
    )
);

-- 2. Enable RLS on audit logs table
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only administrators can read audit logs
CREATE POLICY "Admins can view audit logs"
ON public.auth_audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE auth_user_id = auth.uid()
        AND role IN ('administrator', 'super_admin')
    )
);

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.auth_audit_logs
FOR INSERT
WITH CHECK (true);
