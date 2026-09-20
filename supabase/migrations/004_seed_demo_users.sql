-- ANVESHA Database Migration 004: Seed Demo Employees
-- Organization: MOIL Limited (A Government of India Enterprise)
-- NOTICE: Synthetic demo accounts for development and hackathon evaluation only.

-- Insert demo employees (auth_user_id will be linked when accounts are provisioned in auth.users)
INSERT INTO public.employees (
    employee_id, full_name, email, designation, department, mine_location, role, status, is_active
) VALUES
(
    'MOIL100001',
    'Rajesh Kumar Sharma',
    'rajesh.sharma@demo.moil.in',
    'Senior Exploration Geologist',
    'Geology & Exploration',
    'Dongri Buzurg Mine',
    'geologist',
    'active',
    true
),
(
    'MOIL100002',
    'Sunita Deshmukh',
    'sunita.deshmukh@demo.moil.in',
    'Chief Production Manager',
    'Mining Operations',
    'Balaghat Mine',
    'production_manager',
    'active',
    true
),
(
    'MOIL100003',
    'Amitabh Verma',
    'amitabh.verma@demo.moil.in',
    'General Mine Manager',
    'Mine Management',
    'Chikla Mine',
    'mine_manager',
    'active',
    true
),
(
    'MOIL100004',
    'Pooja Nair',
    'pooja.nair@demo.moil.in',
    'Lead Mining Data Analyst',
    'Digital Transformation & AI',
    'MOIL Head Office (Nagpur)',
    'data_analyst',
    'active',
    true
),
(
    'MOIL100005',
    'Dr. Vikram Malhotra',
    'vikram.malhotra@demo.moil.in',
    'Chief Information & Security Officer',
    'IT & Technical Administration',
    'MOIL Head Office (Nagpur)',
    'administrator',
    'active',
    true
)
ON CONFLICT (employee_id) DO NOTHING;
