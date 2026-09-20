# ANVESHA — MOIL Employee Authentication & Login Portal

> **MASTER IMPLEMENTATION PROMPT FOR GEMINI ANTIGRAVITY**

You are working inside the existing **ANVESHA** project.

ANVESHA is an AI/ML-powered manganese exploration and production intelligence platform intended for MOIL employees and authorized personnel.

Your task is to implement a **fully functional, database-backed MOIL employee authentication system** using **Supabase** as the authentication and database backend.

This is NOT a visual-only login page.

The final implementation must actually authenticate users against a Supabase-backed employee identity database, maintain secure sessions, protect authenticated routes, support logout, enforce role-based access, and provide proper loading/error/empty states.

---

## 1. NON-NEGOTIABLE INSTRUCTIONS

Before changing any code:

1. Inspect the entire existing ANVESHA repository.
2. Identify:

   * Next.js version
   * React version
   * TypeScript configuration
   * existing routing architecture
   * existing authentication
   * existing Supabase configuration
   * existing UI component system
   * existing Tailwind configuration
   * existing environment variables
   * existing middleware/proxy
   * existing dashboard routes
   * existing API routes
3. Do NOT blindly rebuild the project.
4. Preserve working ANVESHA functionality.
5. Integrate authentication into the existing architecture.
6. If an authentication system already exists, refactor it rather than creating a conflicting second authentication system.
7. Do not introduce a second visual design system.
8. Use **UX4G Design System 3.0** as the primary UI/UX reference.
9. Use the official MOIL website as a branding/reference source.
10. Do not invent actual MOIL employee credentials.
11. Do not claim that this authenticates against MOIL's real employee directory unless an actual MOIL-approved identity provider has been integrated.
12. Create clearly labelled demo/seed employee accounts for development.
13. Never store plaintext passwords in the application database.
14. Never expose Supabase service-role credentials to the browser.
15. Never hard-code production credentials.
16. Never put secrets in Git.
17. Do not use fake frontend-only authentication such as:

    * `if (password === "1234")`
    * localStorage-only authentication
    * hard-coded employee IDs
    * client-side route protection

18. The authentication must survive page refreshes.
19. Direct access to protected routes must be blocked for unauthenticated users.
20. Logout must invalidate the authenticated application session.

---

## 2. PRODUCT CONTEXT

Product:

**ANVESHA**

Subtitle:

**Manganese Intelligence & Decision Support Platform**

Target organization:

**MOIL Limited**

Organization description:

**MOIL Limited — A Government of India Enterprise**

The login system is intended for authorized MOIL personnel accessing the ANVESHA platform.

The future platform may contain sensitive operational information such as:

* mine information
* borehole information
* geological data
* assay information
* production data
* equipment telemetry
* production forecasts
* reserve estimates
* operational recommendations
* AI model outputs
* geospatial information

Therefore authentication and authorization must be treated as a serious security boundary.

---

## 3. IMPORTANT AUTHENTICATION REALITY

The user wants employees to log in using:

**Employee ID + Password**

Supabase Auth normally authenticates using identities such as email/password or other supported providers.

Therefore implement an employee-ID authentication abstraction.

Recommended architecture:

```text
Employee enters:

Employee ID
Password

        ↓

ANVESHA Login API

        ↓

Validate / normalize Employee ID

        ↓

Lookup employee record
using secure server-side access

        ↓

Resolve internal authentication identity

        ↓

Supabase Auth password authentication

        ↓

Create secure authenticated session

        ↓

Load employee profile + role

        ↓

Authorization check

        ↓

ANVESHA Dashboard
```

Do NOT expose the employee directory table directly to anonymous browser clients merely to perform the lookup.

Use server-side logic for the employee-ID → authentication-identity resolution.

---

## 4. SUPABASE ARCHITECTURE

Use:

* Supabase Auth
* Supabase PostgreSQL
* Row Level Security
* Supabase server-side authentication
* `@supabase/supabase-js`
* `@supabase/ssr`

For Next.js:

Use the current Supabase SSR architecture.

If the repository uses Next.js 16, follow the current `proxy.ts` approach.

If the repository uses an earlier supported Next.js version, inspect the installed version and use the corresponding supported middleware/proxy mechanism.

Do NOT use deprecated:

```text
@supabase/auth-helpers-nextjs
```

Do NOT create authentication using obsolete Supabase helper packages.

Use cookie-based server-side sessions.

---

## 5. SUPABASE PROJECT SETUP

Create a Supabase project for ANVESHA.

Suggested project name:

```text
anvesha-moil
```

Suggested environment separation:

```text
Development
Staging
Production
```

If only one Supabase project is available during development, document how it can later be separated.

The implementation must support:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Important:

`SUPABASE_SERVICE_ROLE_KEY`

MUST ONLY exist on trusted server-side code.

It must NEVER be:

* prefixed with `NEXT_PUBLIC_`
* exposed to React client components
* sent to the browser
* committed to Git
* included in client bundles

---

## 6. DATABASE SCHEMA

Create a proper relational schema.

Use UUIDs for internal primary keys.

Recommended tables:

### 6.1 employees

```sql
employees
```

Fields:

```text
id UUID PRIMARY KEY
auth_user_id UUID UNIQUE
employee_id TEXT UNIQUE NOT NULL
full_name TEXT NOT NULL
email TEXT
designation TEXT
department TEXT
mine_location TEXT
employee_type TEXT
role TEXT NOT NULL
status TEXT NOT NULL
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
last_login_at TIMESTAMPTZ
```

Recommended role values:

```text
employee
geologist
production_manager
mine_manager
data_analyst
administrator
super_admin
```

Do not assume that these are actual MOIL organizational roles.

Treat them as ANVESHA application roles unless MOIL provides the official role structure.

Recommended status values:

```text
active
inactive
suspended
pending
```

---

## 7. AUTH IDENTITY

Use Supabase Auth as the actual password authentication mechanism.

Do NOT create your own password hashing system unless absolutely necessary.

Supabase Auth should own password verification.

For the employee-ID login abstraction, create an internal authentication identity for each employee.

For example:

```text
employee_id:
MOIL100001

internal auth identity:
MOIL100001@anvesha.internal
```

This internal identity is an implementation detail.

It must never be displayed as the employee's actual corporate email.

The user-facing login must remain:

```text
Employee ID
Password
```

Do not require the employee to enter an email address.

---

## 8. EMPLOYEE LOGIN FLOW

The login page must contain:

### Employee ID

Placeholder:

```text
Enter your employee ID
```

### Password

Placeholder:

```text
Enter your password
```

### Show/hide password

Provide an accessible password visibility control.

### Remember me

If implemented, ensure it is clearly documented and does not create insecure long-lived sessions.

### Login button

Text:

```text
Sign in
```

### Forgot password

Provide a controlled recovery workflow.

Because the login identifier is employee ID rather than email, the recovery flow should not reveal whether an employee ID exists.

---

## 9. LOGIN PROCESS

Implement the following:

```text
POST /api/auth/login
```

Request:

```json
{
  "employeeId": "MOIL100001",
  "password": "user-password"
}
```

Server process:

1. Validate request schema.
2. Normalize employee ID.
3. Validate employee ID format.
4. Rate-limit login attempts.
5. Query employee record using trusted server-side access.
6. Verify employee exists.
7. Verify employee is active.
8. Resolve `auth_user_id`.
9. Resolve the internal authentication identity.
10. Authenticate against Supabase Auth.
11. Establish secure session cookies.
12. Update `last_login_at`.
13. Write authentication audit event.
14. Return success.
15. Redirect to the appropriate dashboard.

For invalid credentials:

Return a generic error such as:

```text
Employee ID or password is incorrect.
```

Do NOT reveal:

```text
Employee ID exists but password is wrong.
```

or:

```text
Employee ID does not exist.
```

This prevents account enumeration.

---

## 10. SECURITY REQUIREMENTS

Implement:

### Password security

Never:

```text
store plaintext password
```

Never:

```text
store password in employees table
```

Never:

```text
compare password strings manually in frontend
```

Supabase Auth must handle password verification.

---

## 11. RATE LIMITING

Implement login rate limiting.

At minimum:

```text
5 failed attempts within a defined window
```

should trigger temporary throttling.

Do not permanently lock users out from a simple client-side counter.

Use server-side protection.

The exact production rate-limit mechanism can be:

* Supabase-backed rate limit table
* Upstash Redis if available
* Vercel-compatible rate limiter
* another server-side rate limiting service

Choose the simplest secure solution compatible with the existing project.

Document the choice.

---

## 12. AUDIT LOGGING

Create:

```text
auth_audit_logs
```

Fields:

```text
id UUID
employee_id UUID
event_type TEXT
success BOOLEAN
ip_address TEXT
user_agent TEXT
metadata JSONB
created_at TIMESTAMPTZ
```

Possible events:

```text
LOGIN_SUCCESS
LOGIN_FAILURE
LOGOUT
PASSWORD_RESET_REQUEST
PASSWORD_RESET_SUCCESS
ACCOUNT_LOCKED
ACCOUNT_UNLOCKED
SESSION_EXPIRED
UNAUTHORIZED_ACCESS_ATTEMPT
```

Never store passwords in audit logs.

Do not store sensitive authentication tokens.

---

## 13. SESSION ARCHITECTURE

Use secure cookie-based Supabase sessions.

Requirements:

* HTTP-only where appropriate
* secure cookies in production
* appropriate SameSite policy
* token refresh
* server-side session validation
* logout
* expiration handling

Authenticated routes must not depend solely on:

```text
localStorage
```

Do not implement:

```text
localStorage.setItem("loggedIn", "true")
```

as an authentication mechanism.

---

## 14. ROUTE PROTECTION

Protect all ANVESHA application routes.

Example:

```text
/login
```

must be publicly accessible.

Everything under:

```text
/dashboard/*
/exploration/*
/production/*
/decision-center/*
/data/*
/models/*
/reports/*
```

should require authentication.

Unauthenticated user:

```text
Protected route
      ↓
No valid session
      ↓
Redirect to /login
```

Authenticated user:

```text
/login
      ↓
Valid session
      ↓
Redirect to /dashboard
```

Prevent authenticated users from unnecessarily returning to the login screen.

---

## 15. ROLE-BASED ACCESS CONTROL

Implement RBAC.

Example:

```text
employee
geologist
production_manager
mine_manager
data_analyst
administrator
super_admin
```

Create a central authorization utility.

For example:

```text
requireAuth()
requireRole()
requireAnyRole()
```

Do not scatter role checks randomly throughout the application.

Example:

```text
/dashboard
→ authenticated users

/exploration
→ geologist
→ mine_manager
→ administrator
→ super_admin

/production
→ production_manager
→ mine_manager
→ administrator
→ super_admin

/models
→ data_analyst
→ administrator
→ super_admin

/admin
→ administrator
→ super_admin
```

Treat this as an initial application policy, not an official MOIL access-control policy.

Make permissions configurable.

---

## 16. DATABASE RLS

Enable Row Level Security on all application tables containing protected information.

Users must only be able to access data they are authorized to access.

Do not rely exclusively on frontend role checks.

Example principle:

```text
Frontend RBAC
+
Server-side authorization
+
PostgreSQL RLS
```

All three should reinforce each other.

---

## 17. EMPLOYEE PROFILE

After successful authentication, load:

```text
Employee ID
Full Name
Designation
Department
Mine / Location
Role
Profile status
Last login
```

Display the employee name in the ANVESHA header.

Example:

```text
Welcome, Rajesh Kumar
MOIL Employee ID: MOIL100001
Role: Geologist
```

Do not expose unnecessary personal information.

---

## 18. LOGIN PAGE DESIGN

The login page must feel like an official Government of India enterprise application.

Do NOT use:

* glassmorphism
* neon gradients
* gaming UI
* excessive animations
* crypto dashboard styling
* startup-style landing page
* giant rounded cards
* excessive shadows
* random gradients
* futuristic cyberpunk visuals

The visual language should be:

```text
Government
Professional
Institutional
Trustworthy
Accessible
Modern
Clean
Operational
```

---

## 19. UX4G DESIGN SYSTEM

Use **UX4G Design System 3.0** as the primary design reference.

Official references:

```text
https://www.ux4g.gov.in/

https://www.ux4g.gov.in/foundations

https://www.ux4g.gov.in/components

https://www.ux4g.gov.in/patterns

https://www.ux4g.gov.in/foundations/accessibility

https://www.ux4g.gov.in/get-started/for-developers

https://doc.ux4g.gov.in/
```

Before implementing UI, inspect the current official UX4G documentation.

Do not rely on outdated UX4G implementations if the current documentation differs.

UX4G should control:

* typography
* spacing
* form controls
* buttons
* alerts
* accessibility
* focus states
* navigation
* responsive behavior
* design tokens
* component states
* interaction patterns

UX4G currently documents a 4px spacing scale, design tokens, reusable components and WCAG 2.1 AA accessibility requirements.

---

## 20. UX4G ACCESSIBILITY

The login page must satisfy the UX4G accessibility baseline.

Implement:

* semantic HTML
* visible labels
* keyboard navigation
* visible focus indicators
* correct heading hierarchy
* accessible form errors
* screen-reader-friendly controls
* proper ARIA only where needed
* sufficient color contrast
* reduced-motion support
* responsive layout
* text resizing
* no keyboard traps

UX4G specifies WCAG 2.1 AA as its accessibility baseline.

---

## 21. GOVERNMENT ACCESSIBILITY BAR

Where appropriate for the application shell, implement the UX4G-style accessibility bar.

Include:

```text
Skip to Main Content
English / हिन्दी
A-
A
A+
Accessibility
```

Follow the current UX4G component documentation rather than recreating the behavior arbitrarily.

The accessibility bar should appear before the primary application content when used.

UX4G specifically documents the accessibility bar as a government-service pattern with skip navigation, text resizing and accessibility controls.

---

## 22. MOIL BRANDING REFERENCE

Use the official MOIL website as the visual and branding reference:

```text
https://moil.nic.in/
```

The current MOIL website includes:

* MOIL logo
* Government of India attribution
* Hindi / English language options
* accessibility controls
* MOIL corporate identity
* institutional navigation
* official contact information
* government-enterprise presentation

Use these as references, not as a reason to copy the website.

MOIL's website identifies it as a Government of India enterprise and displays its MOIL branding alongside government identity elements.

---

## 23. IMPORTANT LOGO RULE

Do NOT scrape, hotlink, or illegally copy remote logo assets at runtime.

If an official MOIL logo asset is available and permitted for the project:

```text
download/store it locally
```

and use it appropriately.

Otherwise create a clearly documented placeholder:

```text
MOIL LOGO ASSET REQUIRED
```

and make the component ready for replacement.

Do not fabricate a fake official government logo.

---

## 24. LOGIN PAGE LAYOUT

Desktop:

```text
┌───────────────────────────────────────────────────────────┐
│ Government of India / accessibility controls              │
├───────────────────────────────────────────────────────────┤
│                                                           │
│              MOIL LOGO                                    │
│                                                           │
│       ANVESHA                                             │
│       Manganese Intelligence & Decision Support           │
│                                                           │
│       ┌───────────────────────────────────────────┐       │
│       │ MOIL Employee Login                      │       │
│       │                                           │       │
│       │ Employee ID                               │       │
│       │ [ Enter employee ID                    ]  │       │
│       │                                           │       │
│       │ Password                                  │       │
│       │ [ •••••••••••••••       👁 ]              │       │
│       │                                           │       │
│       │ [ ] Remember this device                  │       │
│       │                                           │       │
│       │ [              SIGN IN                ]   │       │
│       │                                           │       │
│       │ Forgot password?                          │       │
│       └───────────────────────────────────────────┘       │
│                                                           │
│       Authorized MOIL Personnel Only                       │
│                                                           │
├───────────────────────────────────────────────────────────┤
│ MOIL Limited | Government of India Enterprise              │
└───────────────────────────────────────────────────────────┘
```

Do not make the login card excessively large.

The page should remain usable on:

* desktop
* laptop
* tablet
* mobile

---

## 25. LOADING / SPLASH SCREEN

Create an ANVESHA loading screen.

It should display:

```text
MOIL LOGO

ANVESHA

Manganese Intelligence & Decision Support Platform

Loading...
```

Animation:

Use a subtle institutional loading animation.

Preferred:

```text
logo
  ↓
soft opacity / scale transition
  ↓
loading indicator
```

Avoid:

* flashy particles
* neon effects
* 3D spinning logos
* excessive animation

Support:

```css
prefers-reduced-motion
```

When reduced motion is enabled:

```text
static logo
+
simple progress indicator
```

---

## 26. SPLASH SCREEN TIMING

Do NOT artificially force a long loading screen.

The splash screen should remain only while the application is actually:

* initializing
* validating the session
* loading essential configuration
* loading the initial application shell

Do NOT:

```text
setTimeout(() => hideSplash(), 5000)
```

just for visual effect.

The loading state should be tied to actual application state.

---

## 27. AUTHENTICATION STATES

Implement explicit states:

```text
INITIALIZING
CHECKING_SESSION
LOGIN_FORM
SUBMITTING
AUTHENTICATED
LOGIN_ERROR
ACCOUNT_INACTIVE
ACCOUNT_SUSPENDED
RATE_LIMITED
NETWORK_ERROR
SESSION_EXPIRED
LOGGING_OUT
```

Each state must have appropriate UI.

---

## 28. ERROR DESIGN

Example:

Invalid credentials:

```text
Unable to sign in

Employee ID or password is incorrect.

Please verify your credentials and try again.
```

Inactive account:

```text
Account unavailable

Your employee account is currently inactive.
Please contact the authorized administrator.
```

Network failure:

```text
Connection problem

We couldn't connect to the authentication service.
Please check your connection and try again.
```

Rate limited:

```text
Too many attempts

For security, sign-in attempts have been temporarily limited.
Please wait before trying again.
```

Never expose:

* SQL errors
* Supabase internal errors
* stack traces
* database names
* authentication implementation details

to users.

---

## 29. PASSWORD RESET

Implement a secure password recovery architecture.

Do NOT allow:

```text
/reset-password?employeeId=...
```

to expose account existence.

Use a secure recovery flow associated with the employee's registered recovery channel.

If email is available:

```text
Employee ID
      ↓
Secure server-side lookup
      ↓
Password reset request
      ↓
Supabase recovery flow
      ↓
Secure reset link
      ↓
Set new password
```

The system should return a generic message even when the account does not exist.

Example:

```text
If the account is eligible for password recovery, instructions will be sent through the registered recovery channel.
```

---

## 30. LOGOUT

Implement:

```text
POST /api/auth/logout
```

or the appropriate Supabase SSR logout mechanism.

On logout:

1. End Supabase session.
2. Clear authentication cookies.
3. Clear relevant client state.
4. Redirect to `/login`.
5. Prevent back-navigation from exposing protected cached content.
6. Record `LOGOUT` event.

---

## 31. SESSION EXPIRATION

If the session expires:

```text
Protected page
      ↓
Session invalid
      ↓
Redirect to login
      ↓
Show:
"Your session has expired. Please sign in again."
```

Do not silently display an unauthenticated version of sensitive pages.

---

## 32. DATABASE SEEDING

Create development seed data.

Example:

```text
Employee ID: MOIL100001
Name: Demo Geologist
Role: geologist

Employee ID: MOIL100002
Name: Demo Production Manager
Role: production_manager

Employee ID: MOIL100003
Name: Demo Mine Manager
Role: mine_manager

Employee ID: MOIL100004
Name: Demo Data Analyst
Role: data_analyst

Employee ID: MOIL100005
Name: Demo Administrator
Role: administrator
```

Use obviously synthetic names and credentials.

Never use actual MOIL employee information.

Document all development credentials separately.

Do not commit production credentials.

---

## 33. ADMIN USER MANAGEMENT

Create a secure administrative architecture for employee provisioning.

The application administrator should eventually be able to:

```text
Create employee
Deactivate employee
Suspend employee
Reactivate employee
Assign role
Change department
Change mine
View last login
View account status
Trigger password reset
```

However:

Do not build a public employee registration page.

Employees should NOT be able to self-register.

This is an internal enterprise system.

---

## 34. EMPLOYEE PROVISIONING FLOW

Recommended:

```text
MOIL/ANVESHA Administrator
          ↓
Create Employee
          ↓
employee_id
full_name
department
designation
role
recovery email
          ↓
Create Supabase Auth identity
          ↓
Set initial password / secure invitation
          ↓
Employee account becomes active
```

For production, prefer an invitation/reset workflow rather than administrators transmitting permanent passwords.

---

## 35. AUTHORIZATION ARCHITECTURE

Create a central permissions model.

Example:

```text
permissions

VIEW_DASHBOARD
VIEW_EXPLORATION
VIEW_BOREHOLES
VIEW_ASSAYS
VIEW_PRODUCTION
VIEW_EQUIPMENT
RUN_FORECAST
RUN_WHAT_IF
VIEW_MODELS
MANAGE_MODELS
GENERATE_REPORTS
MANAGE_EMPLOYEES
VIEW_AUDIT_LOGS
```

Then map:

```text
role → permissions
```

This is more flexible than hard-coding role names throughout the application.

---

## 36. FUTURE MOIL SSO COMPATIBILITY

Design the authentication layer so that it can later support:

```text
MOIL Active Directory
LDAP
OIDC
SAML
Enterprise SSO
```

without rewriting the ANVESHA frontend.

Create an authentication abstraction:

```text
AuthProvider
```

Possible future providers:

```text
SupabasePasswordAuth
MOILSSOAuth
MOILLDAPAuth
```

For now:

```text
SupabasePasswordAuth
```

is the active implementation.

If MOIL later provides an official identity provider, the login UI should remain largely unchanged.

---

## 37. DO NOT CLAIM REAL MOIL CREDENTIAL VALIDATION

This is critical.

The application must NOT display:

```text
Login with your official MOIL password
```

unless the authentication backend is actually connected to MOIL's official identity infrastructure.

For the prototype:

Use:

```text
MOIL Employee Login
```

and document:

```text
Authentication is currently managed through the ANVESHA enterprise identity layer.
Production deployment should integrate with MOIL's approved identity provider.
```

---

## 38. SECURITY HEADERS

Where appropriate, configure:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Do not blindly copy a CSP that breaks Next.js.

Test it.

---

## 39. CSRF / REQUEST SECURITY

For authentication-related mutations:

* validate origin where appropriate
* use secure cookies
* use POST for mutations
* validate request bodies
* reject malformed input
* avoid credential leakage in URLs

Never send passwords through:

```text
GET /login?employeeId=...&password=...
```

---

## 40. INPUT VALIDATION

Use a schema validator such as:

```text
Zod
```

if already present or appropriate.

Employee ID validation:

```text
trim
normalize case if employee IDs are case-insensitive
length validation
character validation
```

Password validation should avoid unnecessarily revealing password requirements during login.

---

## 41. API STRUCTURE

Suggested structure:

```text
app/
├── login/
│   └── page.tsx
│
├── auth/
│   ├── callback/
│   ├── forgot-password/
│   └── reset-password/
│
├── dashboard/
│   └── page.tsx
│
└── api/
    └── auth/
        ├── login/
        │   └── route.ts
        ├── logout/
        │   └── route.ts
        ├── session/
        │   └── route.ts
        └── forgot-password/
            └── route.ts
```

Adapt this to the existing repository rather than forcing this exact structure.

---

## 42. SUPABASE UTILITIES

Create clean utilities similar to:

```text
lib/
└── supabase/
    ├── client.ts
    ├── server.ts
    └── admin.ts
```

Responsibilities:

### client.ts

Browser Supabase client.

### server.ts

SSR/server Supabase client using cookies.

### admin.ts

Service-role client.

Strict rule:

```text
admin.ts MUST NEVER be imported into client components.
```

Add comments explaining this.

---

## 43. AUTH UTILITIES

Create:

```text
lib/auth/
├── get-current-user.ts
├── require-auth.ts
├── require-role.ts
├── permissions.ts
├── employee-login.ts
└── types.ts
```

Keep authentication logic centralized.

---

## 44. TYPES

Generate strongly typed database models.

Use Supabase-generated types if practical.

For example:

```text
Database
Employee
EmployeeRole
EmployeeStatus
Permission
AuthAuditLog
```

Avoid:

```text
any
```

where a proper type can be created.

---

## 45. DASHBOARD REDIRECT

After successful login:

```text
/login
   ↓
authenticate
   ↓
load employee profile
   ↓
load role
   ↓
/dashboard
```

If an employee has a configured landing module, support:

```text
employee → dashboard
geologist → exploration
production_manager → production
administrator → administration
```

But default to:

```text
/dashboard
```

unless the existing ANVESHA product architecture requires otherwise.

---

## 46. HEADER AFTER LOGIN

Authenticated application shell should contain:

```text
MOIL Logo
ANVESHA
Navigation

Right side:

Employee Name
Employee ID
Role

Profile menu
    My Profile
    Accessibility
    Help
    Sign out
```

Do not expose passwords or authentication secrets.

---

## 47. USER PROFILE PAGE

Create:

```text
/profile
```

Display:

```text
Full Name
Employee ID
Designation
Department
Mine / Location
Role
Account Status
Last Login
```

Allow safe account actions.

Do not allow employees to arbitrarily modify authoritative employment fields such as:

```text
employee_id
role
department
designation
status
```

unless an administrator workflow explicitly permits it.

---

## 48. UX DETAILS

Use clear government-service language.

Avoid:

```text
Let's get you into the future 🚀
```

Use:

```text
Sign in to ANVESHA
```

Avoid:

```text
Welcome back, explorer!
```

Use:

```text
Authorized MOIL Personnel
```

Tone:

```text
formal
clear
concise
institutional
human
```

---

## 49. RESPONSIVE DESIGN

Mobile login:

```text
Government/accessibility bar
        ↓
MOIL logo
        ↓
ANVESHA
        ↓
login form
        ↓
support/recovery
        ↓
footer
```

No horizontal scrolling.

Inputs should be touch-friendly.

Do not reduce text below accessible sizes just to fit the design.

---

## 50. LOADING BUTTON

When login is submitted:

```text
[ Sign in ]
```

becomes:

```text
[ Signing in... ]
```

Disable duplicate submissions.

Use an accessible live status.

Example:

```text
aria-live="polite"
```

Do not cause layout jumping.

---

## 51. LOGIN VALIDATION

Client-side validation:

```text
Employee ID required
Password required
```

Server-side validation:

```text
ALWAYS REQUIRED
```

Never trust the client.

---

## 52. TEST ACCOUNT PAGE

For development only, optionally provide a developer-only test reference outside production.

Example:

```text
Development Test Accounts
```

Do not expose this in production.

Use environment checks:

```text
NODE_ENV === "development"
```

or an explicit:

```text
NEXT_PUBLIC_DEMO_MODE
```

Never show demo credentials on a production deployment.

---

## 53. DEMO MODE

ANVESHA needs a demo mode for hackathon presentation.

Create:

```text
DEMO_MODE=true
```

only when explicitly enabled.

In demo mode:

* use synthetic employee accounts
* use synthetic mining data
* display a clear "Demonstration Environment" indicator
* never imply that the data is live MOIL data

Example banner:

```text
Demonstration Environment
Synthetic data is being used for this presentation.
```

---

## 54. NO FAKE SECURITY

Do not create a visual simulation of authentication.

The following are prohibited:

```text
if employeeId === "admin"
```

```text
if password === "admin123"
```

```text
localStorage.authenticated = true
```

```text
router.push("/dashboard")
```

without real server authentication.

Every successful login must correspond to a valid Supabase authentication session.

---

## 55. DATABASE MIGRATIONS

Create migration files.

Suggested:

```text
supabase/
└── migrations/
    ├── 001_create_employees.sql
    ├── 002_create_permissions.sql
    ├── 003_create_auth_audit_logs.sql
    ├── 004_create_rls_policies.sql
    └── 005_seed_demo_users.sql
```

Adapt if the repository already has a migration architecture.

Do not manually create production tables only through undocumented dashboard clicks.

The schema should be reproducible.

---

## 56. RLS DESIGN

Implement RLS carefully.

Example principle:

Employees can read their own profile:

```text
auth.uid() = employees.auth_user_id
```

Administrators can manage authorized employee records.

Audit logs should not be publicly readable.

Sensitive operational data must be protected separately from employee authentication data.

Do not make:

```sql
using (true)
```

policies on sensitive employee data.

---

## 57. DATABASE INDEXES

Create indexes for:

```text
employees.employee_id
employees.auth_user_id
employees.status
employees.is_active
auth_audit_logs.employee_id
auth_audit_logs.created_at
```

Use unique indexes where required.

---

## 58. DATABASE CONSTRAINTS

Implement:

```text
employee_id UNIQUE
auth_user_id UNIQUE
valid role constraint
valid status constraint
```

Prevent duplicate employees.

---

## 59. AUDITABILITY

Every security-sensitive event should be traceable.

At minimum:

```text
who
what
when
success/failure
request metadata where appropriate
```

Never store secrets.

---

## 60. LOGIN OBSERVABILITY

During development, log useful server-side events.

Do NOT log:

```text
password
access token
refresh token
session cookie
```

Example:

```text
Authentication attempt for employee MOIL100001
Authentication successful
```

Production logs should avoid unnecessary personal information.

---

## 61. MOIL WEBSITE DESIGN REFERENCES

Inspect:

```text
https://moil.nic.in/
```

and relevant pages before finalizing branding.

Pay attention to:

* MOIL logo treatment
* government identity
* header hierarchy
* language switching
* accessibility controls
* institutional typography
* footer treatment
* navigation style
* corporate/government tone

The current MOIL website itself exposes language selection and accessibility controls, so these are useful reference points for ANVESHA's institutional shell.

Do not copy the MOIL website's source code or layout wholesale.

Create an ANVESHA-specific experience inspired by its institutional identity.

---

## 62. UX4G COMPONENTS TO PRIORITIZE

Prioritize appropriate UX4G components/patterns for:

```text
Input
Password input
Button
Alert
Badge
Header
Navigation
Accessibility bar
Modal
Dropdown
Loading state
Toast / feedback
Form validation
Identity/access pattern
```

Use the official UX4G implementation documentation where available.

UX4G explicitly provides reusable form, feedback and navigation components and an Identity & Access pattern covering sign-in/session-related workflows.

---

## 63. CURRENT UX4G IMPLEMENTATION

For a React/Next.js application, inspect the current UX4G developer documentation.

The current documentation indicates support for React and Next.js and provides the `ux4g-web-components` package and design tokens.

Before installing anything:

```text
inspect package compatibility
inspect current project
inspect current UX4G docs
```

Do not blindly install an outdated UX4G package.

If the project already has a compatible UX4G implementation, reuse it.

---

## 64. DESIGN TOKEN RULE

Do not scatter arbitrary colors throughout the application.

Create a controlled token layer.

Example conceptual categories:

```text
primary
secondary
surface
background
text
muted
border
success
warning
danger
focus
```

Prefer UX4G tokens where available.

Use MOIL branding only as a controlled brand layer.

Do not override UX4G accessibility characteristics merely to make the page visually closer to MOIL.

---

## 65. TYPOGRAPHY

Use UX4G's current typography system.

Do not introduce:

```text
Google-style startup typography
futuristic display fonts
decorative fonts
```

The login page should look like a serious public-sector enterprise application.

---

## 66. ANIMATION

Animation should be subtle.

Allowed:

```text
fade
slide
loading indicator
button state transition
form feedback
```

Avoid:

```text
parallax
large motion backgrounds
particles
continuous floating objects
3D logo rotation
```

Respect:

```text
prefers-reduced-motion
```

---

## 67. SECURITY ARCHITECTURE DIAGRAM

Create documentation containing:

```text
                 ┌─────────────────────┐
                 │     Employee        │
                 │ Employee ID + Pass  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   ANVESHA Login UI  │
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
                               │ RBAC + RLS      │
                               └────────┬────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │ ANVESHA         │
                               │ Dashboard       │
                               └─────────────────┘
```

---

## 68. FILES TO CREATE / MODIFY

First inspect the repository.

Then produce a plan.

Likely files:

```text
app/login/page.tsx

app/api/auth/login/route.ts

app/api/auth/logout/route.ts

app/api/auth/session/route.ts

lib/supabase/client.ts

lib/supabase/server.ts

lib/supabase/admin.ts

lib/auth/require-auth.ts

lib/auth/permissions.ts

lib/auth/employee-login.ts

components/auth/LoginForm.tsx

components/auth/LoadingScreen.tsx

components/auth/AuthError.tsx

components/auth/PasswordInput.tsx

components/layout/AuthGuard.tsx

supabase/migrations/*.sql
```

But do not force this structure if the existing ANVESHA architecture has better equivalents.

---

## 69. ENVIRONMENT CONFIGURATION

Create:

```text
.env.example
```

containing:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not include actual values.

Add comments explaining:

```text
NEXT_PUBLIC_*
→ safe for browser exposure where appropriate

SUPABASE_SERVICE_ROLE_KEY
→ server only
```

---

## 70. VERCEL DEPLOYMENT

The ANVESHA project may eventually be deployed on Vercel.

Make the authentication implementation Vercel-compatible.

Ensure:

* server routes work in the selected runtime
* cookies work correctly
* environment variables are documented
* no local filesystem dependency
* no local-only authentication state
* no development-only absolute URLs
* redirect URLs are configurable

Document required Vercel environment variables.

---

## 71. SUPABASE CONFIGURATION CHECKLIST

Create documentation:

```text
1. Create Supabase project
2. Configure Auth
3. Run migrations
4. Configure site URL
5. Configure redirect URLs
6. Configure email provider/recovery if required
7. Set environment variables
8. Seed demo employees
9. Test login
10. Test logout
11. Test session refresh
12. Test RLS
13. Test unauthorized routes
14. Deploy
```

---

## 72. TESTING

Create authentication tests.

Minimum scenarios:

### Test 1

Valid employee ID + valid password

Expected:

```text
Login successful
Dashboard displayed
```

### Test 2

Valid employee ID + wrong password

Expected:

```text
Generic authentication error
```

### Test 3

Invalid employee ID

Expected:

```text
Generic authentication error
```

### Test 4

Inactive employee

Expected:

```text
Account unavailable
```

### Test 5

Empty employee ID

Expected:

```text
Validation error
```

### Test 6

Empty password

Expected:

```text
Validation error
```

### Test 7

Unauthenticated direct access

```text
/dashboard
```

Expected:

```text
redirect /login
```

### Test 8

Authenticated user opens:

```text
/login
```

Expected:

```text
redirect /dashboard
```

### Test 9

Logout

Expected:

```text
session destroyed
protected routes inaccessible
```

### Test 10

Expired session

Expected:

```text
redirect /login
```

### Test 11

Unauthorized role

Expected:

```text
403 / access denied
```

### Test 12

RLS

Employee cannot access another employee's protected data.

---

## 73. SECURITY TESTING

Test:

```text
SQL injection
XSS
CSRF
credential enumeration
brute-force attempts
rate limiting
session fixation
session expiration
cookie security
unauthorized API access
role escalation
direct route access
service-role leakage
```

Particularly verify:

```text
SUPABASE_SERVICE_ROLE_KEY
```

never appears in:

```text
browser bundle
client-side JavaScript
network response
public environment variables
```

---

## 74. BROWSER SECURITY CHECK

Inspect the built application.

Search for:

```text
SUPABASE_SERVICE_ROLE_KEY
```

in:

```text
.next/
browser bundle
client JS
source maps
```

It must not be present.

---

## 75. ACCESSIBILITY TESTING

Test:

```text
keyboard only
Tab
Shift+Tab
Enter
Escape
screen reader
mobile viewport
200% zoom
400% zoom
reduced motion
```

Ensure:

```text
Employee ID label
Password label
error messages
button state
loading state
session messages
```

are accessible.

---

## 76. LOGIN PAGE SEO / ROBOTS

This is an internal authentication page.

Prevent indexing where appropriate.

Do not expose sensitive internal information through metadata.

---

## 77. PERFORMANCE

Login should feel fast.

Do not load the entire ANVESHA dashboard before authentication.

The public login route should have minimal dependencies.

Load:

```text
branding
form
authentication logic
```

without loading:

```text
3D maps
GIS libraries
ML visualization libraries
large chart libraries
```

until after authentication.

---

## 78. LOADING SCREEN ARCHITECTURE

Create:

```text
components/auth/LoadingScreen
```

with:

```text
MOIL logo
ANVESHA
loading indicator
accessible status
```

Use actual application states.

For example:

```text
Initializing ANVESHA...
Checking secure session...
Loading workspace...
```

Do not show false progress percentages.

---

## 79. BRANDING HIERARCHY

Recommended:

```text
Government of India
        ↓
MOIL Limited
        ↓
ANVESHA
        ↓
Manganese Intelligence & Decision Support
```

The primary application identity should remain ANVESHA while clearly establishing the MOIL institutional context.

---

## 80. FOOTER

Suggested:

```text
ANVESHA
Manganese Intelligence & Decision Support Platform

MOIL Limited
A Government of India Enterprise

Authorized Personnel Only

Privacy
Security
Accessibility
Help
```

Do not invent legal claims.

If actual MOIL legal/privacy URLs are available and approved, use them.

---

## 81. AUTHENTICATION DOCUMENTATION

Create:

```text
docs/authentication.md
```

Document:

* architecture
* Supabase setup
* environment variables
* database schema
* employee provisioning
* authentication flow
* RBAC
* RLS
* password recovery
* deployment
* security considerations
* future MOIL SSO integration

---

## 82. ADMIN DOCUMENTATION

Create:

```text
docs/employee-management.md
```

Explain:

```text
How an administrator creates an employee
How an employee is activated
How an employee is suspended
How a password is reset
How roles are assigned
How audit logs are reviewed
```

---

## 83. IMPORTANT: DO NOT INVENT MOIL POLICIES

Do not fabricate:

* official MOIL password policies
* employee ID formats
* department codes
* organizational roles
* authentication rules
* official security procedures
* official SSO endpoints

If these are not provided by MOIL, label them:

```text
ANVESHA prototype configuration
```

or:

```text
To be confirmed with MOIL
```

---

## 84. FUTURE PRODUCTION INTEGRATION

Document this architecture:

```text
CURRENT

Employee ID
     ↓
ANVESHA
     ↓
Supabase Auth
     ↓
Dashboard


FUTURE MOIL ENTERPRISE

Employee ID
     ↓
ANVESHA
     ↓
MOIL Identity Provider
     ↓
SSO / LDAP / OIDC / SAML
     ↓
ANVESHA Session
     ↓
Dashboard
```

The frontend should not need to be redesigned when the authentication provider changes.

---

## 85. DATABASE RELATIONSHIP

Document:

```text
auth.users
     │
     │ 1:1
     ▼
employees
     │
     ├──────────► employee_roles / permissions
     │
     └──────────► auth_audit_logs
```

If the final implementation uses a different normalized RBAC structure, document it.

---

## 86. ACCEPTANCE CRITERIA

The task is NOT complete until all of the following work:

### Authentication

* [ ] Employee ID login works
* [ ] Password authentication works
* [ ] Invalid credentials fail
* [ ] Real Supabase Auth session is created
* [ ] Session survives refresh
* [ ] Logout works
* [ ] Session expiration works
* [ ] Protected routes are protected

### Database

* [ ] Supabase PostgreSQL is connected
* [ ] Employee table exists
* [ ] Employee IDs are unique
* [ ] Auth user mapping exists
* [ ] Audit logs exist
* [ ] RLS is enabled
* [ ] Policies are tested

### Security

* [ ] Passwords are never stored manually
* [ ] Service role key is server-only
* [ ] No credentials are hard-coded
* [ ] Login rate limiting exists
* [ ] Generic authentication errors prevent enumeration
* [ ] Protected APIs verify authentication
* [ ] Role checks are server-side
* [ ] No sensitive tokens are logged

### UX4G

* [ ] UX4G design system used
* [ ] UX4G-compatible components used
* [ ] Accessibility implemented
* [ ] Keyboard navigation works
* [ ] Focus state works
* [ ] Mobile responsive
* [ ] Error states are accessible
* [ ] Reduced motion supported

### MOIL

* [ ] MOIL branding appropriately represented
* [ ] Government of India context represented
* [ ] MOIL logo handled correctly
* [ ] Institutional visual tone maintained
* [ ] No fabricated official claims

### Loading

* [ ] MOIL/ANVESHA loading screen exists
* [ ] Loading screen is tied to actual application initialization
* [ ] Reduced motion supported
* [ ] No arbitrary multi-second delay

---

## 87. REQUIRED DEVELOPMENT ORDER

Do NOT implement everything simultaneously.

Follow this sequence.

### Phase 0 — Repository Audit

Inspect existing ANVESHA.

Produce:

```text
Current Architecture
Authentication Status
Database Status
UI System
Routing
Dependencies
Potential Conflicts
```

STOP after audit and present the implementation plan.

Do not make destructive changes.

---

### Phase 1 — Supabase Foundation

Implement:

```text
Supabase connection
environment variables
client
server
admin utilities
```

Verify connection.

---

### Phase 2 — Database

Create:

```text
employees
permissions
roles
auth_audit_logs
```

Implement migrations and RLS.

---

### Phase 3 — Authentication

Implement:

```text
employee ID → internal auth identity
Supabase password authentication
session
logout
route protection
```

---

### Phase 4 — Login UI

Implement:

```text
UX4G login
MOIL branding
form validation
errors
loading
password visibility
responsive design
```

---

### Phase 5 — Loading Experience

Implement:

```text
MOIL logo
ANVESHA
loading state
session initialization
reduced motion
```

---

### Phase 6 — RBAC

Implement:

```text
roles
permissions
protected modules
403 page
```

---

### Phase 7 — Password Recovery

Implement:

```text
forgot password
secure recovery
reset password
generic responses
```

---

### Phase 8 — Audit Logging

Implement:

```text
login success
login failure
logout
password recovery
unauthorized access
```

---

### Phase 9 — Testing

Run:

```text
unit tests
integration tests
authentication tests
RLS tests
accessibility tests
security checks
```

---

### Phase 10 — ANVESHA Integration

Connect authentication to the existing ANVESHA dashboard.

Do not rewrite the existing AI/GIS modules.

Authenticated users should now enter:

```text
ANVESHA Dashboard
```

through the new authentication boundary.

---

## 88. FINAL UI TARGET

The finished login experience should feel approximately like:

```text
Government of India
────────────────────────────────────────────

                     [MOIL LOGO]

                       ANVESHA
       Manganese Intelligence & Decision Support

               ┌───────────────────────┐
               │ MOIL Employee Login   │
               │                       │
               │ Employee ID           │
               │ [___________________] │
               │                       │
               │ Password              │
               │ [___________________] │
               │                       │
               │ □ Remember this device│
               │                       │
               │ [       SIGN IN      ]│
               │                       │
               │ Forgot password?      │
               └───────────────────────┘

                 Authorized Personnel Only

────────────────────────────────────────────
MOIL Limited | A Government of India Enterprise
```

Use UX4G's actual spacing, typography, controls, focus treatment and accessibility behavior instead of manually approximating them.

---

## 89. FINAL INSTRUCTION TO GEMINI

Before declaring completion, verify the complete flow manually:

```text
Open /login
      ↓
Enter demo employee ID
      ↓
Enter demo password
      ↓
Submit
      ↓
Supabase authenticates
      ↓
Session created
      ↓
Employee profile loaded
      ↓
Role loaded
      ↓
Dashboard opens
      ↓
Refresh browser
      ↓
Still authenticated
      ↓
Open protected route directly
      ↓
Access allowed
      ↓
Logout
      ↓
Session destroyed
      ↓
Open protected route
      ↓
Redirect to /login
```

Then test:

```text
wrong password
unknown employee
inactive employee
rate limiting
role restriction
RLS
session expiration
mobile layout
keyboard navigation
screen reader behavior
```

Do not say:

```text
Authentication implemented
```

until the above flow has actually been executed and verified.

If Supabase credentials are unavailable, implement the complete integration and migration files, then clearly identify the exact environment variables and Supabase configuration steps required to make it live.

Do not replace the real authentication implementation with a mock merely because the Supabase project has not yet been configured.

The final result must be a **real, extensible employee authentication architecture for ANVESHA**, not a mock login screen.
