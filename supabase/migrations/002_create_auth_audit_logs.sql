-- ANVESHA Database Migration 002: Create Auth Audit Logs Table
-- Organization: MOIL Limited (A Government of India Enterprise)

CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'LOGOUT',
        'PASSWORD_RESET_REQUEST',
        'PASSWORD_RESET_SUCCESS',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED',
        'SESSION_EXPIRED',
        'UNAUTHORIZED_ACCESS_ATTEMPT'
    )),
    success BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for compliance auditing and fast log reviews
CREATE INDEX IF NOT EXISTS idx_audit_employee_id ON public.auth_audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.auth_audit_logs(created_at DESC);
