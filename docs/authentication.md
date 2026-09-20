# ANVESHA — Authentication & Session Architecture

## 1. Overview
ANVESHA provides a secure, database-backed enterprise identity and authentication portal for **MOIL Limited (A Government of India Enterprise)**.

Employees log in using **Employee ID + Password** without revealing email addresses or internal system identifiers.

```text
                 ┌─────────────────────┐
                 │     Employee        │
                 │ Employee ID + Pass  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   ANVESHA Login UI  │
                 │     (/login)        │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Next.js Auth Route  │
                 │ Server-side only    │
                 └──────────┬──────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
       ┌────────────────┐      ┌─────────────────┐
       │ Employee Table │      │ Supabase Auth   │
       │ ID → Auth UID  │      │ Password Auth   │
       └────────────────┘      └────────┬────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │ Secure Session  │
                               │ Cookie / JWT    │
                               └────────┬────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │  proxy.ts RBAC  │
                               └────────┬────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │ ANVESHA         │
                               │ Dashboard       │
                               └─────────────────┘
```

---

## 2. Supabase Setup & Environment Configuration

Set the following environment variables in your deployment environment (e.g. Vercel / `.env`):

```env
# Browser-accessible connection details
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key

# Server-Only Service Role Key (STRICT: NEVER expose to browser or prefix with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Enables test account switcher for demo/development environments
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 3. Database Schema

The database schema is located in `supabase/migrations/`:
- `001_create_employees.sql`: Defines `public.employees` with foreign key to `auth.users`.
- `002_create_auth_audit_logs.sql`: Immutable audit trail for compliance.
- `003_create_rls_policies.sql`: Row-Level Security restricting unauthorized reads.
- `004_seed_demo_users.sql`: Seed data for development roles.

### Table: `employees`
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary Key |
| `auth_user_id` | UUID | Foreign key to Supabase `auth.users(id)` |
| `employee_id` | TEXT | Unique employee identifier (e.g. `MOIL100001`) |
| `full_name` | TEXT | Full name of employee |
| `email` | TEXT | Recovery/contact email |
| `designation` | TEXT | Job title (e.g. Senior Exploration Geologist) |
| `department` | TEXT | Department (e.g. Geology & Exploration) |
| `mine_location`| TEXT | Assigned mine location or office |
| `role` | TEXT | `employee`, `geologist`, `production_manager`, `mine_manager`, `data_analyst`, `administrator`, `super_admin` |
| `status` | TEXT | `active`, `inactive`, `suspended`, `pending` |
| `is_active` | BOOLEAN | Account operational flag |
| `last_login_at`| TIMESTAMPTZ | Timestamp of most recent authentication |

---

## 4. Role-Based Access Control (RBAC)

| Role | Accessible Modules | Key Capabilities |
|---|---|---|
| **geologist** | Dashboard, Exploration, Decisions, Data Sources, Reports | 3D orebody modeling, borehole logging, Bayesian active drilling optimization |
| **production_manager** | Dashboard, Production, Decisions, What-If Simulation, Reports | HEMM telemetry, 14-day shortfall forecasting, blast recovery reviews |
| **mine_manager** | Dashboard, Exploration, Production, Decisions, Simulation, Reports | Site-wide cross-functional review, operational interventions approval |
| **data_analyst** | Dashboard, Exploration, Production, Simulation, Data Sources, Model Registry, Reports | MLOps drift inspection, data quality pipeline monitoring |
| **administrator** | All Modules + Employee Administration & Security Audit | Full system governance, user lifecycle management, audit log inspection |

---

## 5. Security & Compliance Features
1. **No Account Enumeration**: Authentication returns identical generic errors for invalid passwords and unassigned IDs.
2. **Brute Force Throttling**: 5 consecutive failed login attempts trigger a 15-minute server lockout (HTTP 429).
3. **Session Security**: Cookies are flagged `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
4. **Audit Logging**: Successful logins, failures, and logouts are logged with IP and user agent to `auth_audit_logs`.
5. **No Service Key Leakage**: Validated that `SUPABASE_SERVICE_ROLE_KEY` is completely absent from all client bundles and static output.
