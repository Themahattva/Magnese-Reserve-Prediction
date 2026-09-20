'use client';

import React from 'react';
import Link from 'next/link';
import { User, Shield, Building2, MapPin, Clock, Key, CheckCircle, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { isHindi } = useLanguage();

  if (!user) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Loading employee profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 0 3rem' }}>
      {/* Back Link */}
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/" className="ux4g-btn ux4g-btn-outline ux4g-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={13} aria-hidden="true" />
          <span>{isHindi ? 'डैशबोर्ड पर लौटें' : 'Back to Dashboard'}</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="ux4g-card" style={{ marginBottom: '1.5rem' }}>
        <div className="ux4g-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--ux4g-primary, #1e3a5f)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {user.full_name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {user.full_name}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
                MOIL Employee ID: <strong style={{ color: 'var(--ux4g-primary)' }}>{user.employee_id}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', borderColor: '#fca5a5' }}
          >
            <LogOut size={13} aria-hidden="true" />
            <span>{isHindi ? 'लॉग आउट' : 'Sign Out'}</span>
          </button>
        </div>

        <div className="ux4g-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Designation
              </span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {user.designation}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Department
              </span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {user.department}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Assigned Mine / Office
              </span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {user.mine_location}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                ANVESHA Application Role
              </span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                <span className="ux4g-badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                  {user.role.replace('_', ' ')}
                </span>
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Account Status
              </span>
              <p style={{ margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={14} style={{ color: '#16a34a' }} />
                <span style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.88rem', textTransform: 'capitalize' }}>
                  {user.status}
                </span>
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Last Login
              </span>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Active session'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Access Notice */}
      <div className="ux4g-card">
        <div className="ux4g-card-header">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={15} style={{ color: 'var(--ux4g-primary)' }} />
            <span>Governance &amp; Employment Authorization Policy</span>
          </h3>
        </div>
        <div className="ux4g-card-body" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <p style={{ margin: '0 0 0.5rem' }}>
            In accordance with Government of India enterprise security guidelines and MOIL Limited IT policies, authoritative employee records (Role, Mine Allocation, and Department) cannot be modified through the client portal.
          </p>
          <p style={{ margin: 0 }}>
            If you require updated role permissions or transfer of operational lease jurisdiction, please submit a service request to the <strong>MOIL IT &amp; Technical Administration Directorate</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
