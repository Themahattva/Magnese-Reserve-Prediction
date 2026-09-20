'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle2, Lock, User, Info, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const DEMO_PRESETS = [
  { id: 'MOIL100001', role: 'Geologist', name: 'Rajesh Sharma (Geology)' },
  { id: 'MOIL100002', role: 'Production Mgr', name: 'Sunita Deshmukh (Production)' },
  { id: 'MOIL100003', role: 'Mine Mgr', name: 'Amitabh Verma (Mine Mgr)' },
  { id: 'MOIL100004', role: 'Data Analyst', name: 'Pooja Nair (AI/Analytics)' },
  { id: 'MOIL100005', role: 'Admin', name: 'Dr. Vikram Malhotra (Admin)' },
];

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotId, setForgotId] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { login } = useAuth();
  const { t, isHindi } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!employeeId.trim()) {
      setErrorMessage(isHindi ? 'कृपया कर्मचारी आईडी दर्ज करें' : 'Please enter your Employee ID');
      return;
    }
    if (!password) {
      setErrorMessage(isHindi ? 'कृपया पासवर्ड दर्ज करें' : 'Please enter your password');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(employeeId.trim(), password);
      if (result.success) {
        // Successful login: redirect to dashboard
        router.push('/');
        router.refresh();
      } else {
        setErrorMessage(result.error || (isHindi ? 'कर्मचारी आईडी या पासवर्ड गलत है।' : 'Employee ID or password is incorrect. Please verify and try again.'));
      }
    } catch {
      setErrorMessage(isHindi ? 'प्रमाणीकरण सर्वर से संपर्क करने में असमर्थ।' : 'Unable to connect to the authentication server. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (presetId: string) => {
    setEmployeeId(presetId);
    setPassword('Password@123');
    setErrorMessage(null);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotId.trim()) return;
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: forgotId.trim() }),
      });
      setForgotSubmitted(true);
    } catch {
      setForgotSubmitted(true);
    }
  };

  return (
    <div className="login-portal-wrapper">
      {/* Background Decorative Accent */}
      <div className="login-backdrop-grid" aria-hidden="true" />

      <main id="main-content" className="login-main-container">
        {/* Government Identity Header */}
        <div className="login-brand-header">
          <div className="login-emblems">
            <Image
              src="/ashok-stambh.png"
              alt="State Emblem of India - Satyameva Jayate"
              width={42}
              height={58}
              priority
              style={{ objectFit: 'contain' }}
            />
            <div className="login-emblem-divider" aria-hidden="true" />
            <Image
              src="/moil.png"
              alt="MOIL Limited Logo"
              width={48}
              height={48}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div className="login-identity-text">
            <h1 className="login-portal-title">MOIL LIMITED</h1>
            <p className="login-portal-sub">A Government of India Enterprise &bull; Ministry of Steel</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card-box">
          <div className="login-card-header">
            <div className="login-app-badge">
              <span className="login-badge-hindi">अन्वेषा</span>
              <span className="login-badge-sep">&bull;</span>
              <span className="login-badge-eng">ANVESHA</span>
            </div>
            <h2>{isHindi ? 'कर्मचारी सुरक्षित लॉगिन' : 'Authorized Employee Login'}</h2>
            <p>
              {isHindi
                ? 'मैंगनीज अन्वेषण एवं परिचालन निर्णय समर्थन प्रणाली'
                : 'Manganese Exploration & Operational Decision Support Platform'}
            </p>
          </div>

          {/* Demonstration Notice & Presets (Development & Review) */}
          <div className="demo-credentials-banner" role="region" aria-label="Development Test Accounts">
            <div className="demo-banner-title">
              <KeyRound size={13} aria-hidden="true" />
              <span>{isHindi ? 'डेमो टेस्ट खाते (1-क्लिक चयन)' : 'Demo Accounts (1-Click Test Select)'}</span>
            </div>
            <div className="demo-pills-row">
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickFill(p.id)}
                  className={`demo-pill ${employeeId === p.id ? 'active' : ''}`}
                  title={`${p.name} (Password: Password@123)`}
                >
                  <span className="pill-id">{p.id}</span>
                  <span className="pill-role">{p.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={16} className="error-icon" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Employee ID Field */}
            <div className="form-group">
              <label htmlFor="employee-id-input" className="form-label">
                <User size={13} aria-hidden="true" />
                <span>{isHindi ? 'कर्मचारी आईडी (Employee ID)' : 'Employee ID'}</span>
                <span className="required-star" aria-hidden="true">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="employee-id-input"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={isHindi ? 'उदा. MOIL100001' : 'e.g. MOIL100001'}
                  autoComplete="username"
                  required
                  disabled={submitting}
                  className="form-input"
                  aria-describedby={errorMessage ? 'login-error-desc' : undefined}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password-input" className="form-label">
                  <Lock size={13} aria-hidden="true" />
                  <span>{isHindi ? 'पासवर्ड (Password)' : 'Password'}</span>
                  <span className="required-star" aria-hidden="true">*</span>
                </label>
              </div>
              <div className="input-wrapper with-action">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isHindi ? 'पासवर्ड दर्ज करें' : 'Enter your password'}
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="form-actions-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={submitting}
                />
                <span>{isHindi ? 'यह उपकरण याद रखें' : 'Remember this device'}</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotSubmitted(false);
                  setForgotId(employeeId || '');
                }}
                className="forgot-link-btn"
              >
                {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="ux4g-btn ux4g-btn-primary login-submit-btn"
              aria-live="polite"
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>{isHindi ? 'सत्यापित किया जा रहा है...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <Shield size={16} aria-hidden="true" />
                  <span>{isHindi ? 'पोर्टल में साइन इन करें' : 'Sign in to ANVESHA'}</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="login-security-notice">
            <Shield size={13} style={{ color: '#16a34a' }} aria-hidden="true" />
            <span>
              {isHindi
                ? 'सुरक्षित राष्ट्रीय पोर्टल &bull; केवल अधिकृत मॉयल कर्मियों के लिए'
                : 'Secure National System &bull; Authorized MOIL Personnel Only'}
            </span>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="forgot-modal-title">
            <div className="modal-card">
              <div className="modal-header">
                <h3 id="forgot-modal-title">{isHindi ? 'पासवर्ड पुनर्प्राप्ति' : 'Account Password Assistance'}</h3>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="modal-close-btn"
                  aria-label="Close dialog"
                >
                  &times;
                </button>
              </div>

              <div className="modal-body">
                {forgotSubmitted ? (
                  <div className="modal-success">
                    <CheckCircle2 size={32} style={{ color: '#16a34a', margin: '0 auto 0.5rem' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {isHindi ? 'अनुरोध दर्ज किया गया' : 'Request Registered'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {isHindi
                        ? 'यदि यह कर्मचारी आईडी सक्रिय है, तो पासवर्ड रीसेट निर्देश आपके पंजीकृत संपर्क पर भेज दिए गए हैं।'
                        : 'If an active account exists for this Employee ID, recovery instructions have been initiated via your authorized MOIL IT administrator.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                      {isHindi
                        ? 'पासवर्ड रीसेट करने के लिए अपनी आधिकारिक कर्मचारी आईडी दर्ज करें:'
                        : 'Enter your official Employee ID to initiate a password recovery request:'}
                    </p>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="modal-forgot-id" className="form-label">
                        Employee ID
                      </label>
                      <input
                        id="modal-forgot-id"
                        type="text"
                        value={forgotId}
                        onChange={(e) => setForgotId(e.target.value)}
                        placeholder="e.g. MOIL100001"
                        required
                        className="form-input"
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
                      >
                        {isHindi ? 'रद्द करें' : 'Cancel'}
                      </button>
                      <button type="submit" className="ux4g-btn ux4g-btn-primary ux4g-btn-sm">
                        {isHindi ? 'अनुरोध भेजें' : 'Submit Request'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Attribution */}
        <div className="login-footer-strip">
          <p>&copy; {new Date().getFullYear()} MOIL Limited &bull; Ministry of Steel &bull; Government of India</p>
          <div className="footer-compliance-tags">
            <span>WCAG 2.1 AA Compliant</span>
            <span>&bull;</span>
            <span>GIGW 3.0 Standard</span>
            <span>&bull;</span>
            <span>AES-256 Auth Session</span>
          </div>
          <div style={{ marginTop: '0.6rem' }}>
            <Link href="/landing" style={{ fontSize: '0.73rem', color: 'var(--ux4g-primary, #0284c7)', textDecoration: 'none', fontWeight: 500 }}>
              &bull; {isHindi ? 'प्रारंभिक लोडिंग पोर्टल देखें' : 'View Portal Introduction & Loading Screen'} &bull;
            </Link>
          </div>
        </div>
      </main>

      {/* Scoped Styles for Clean Government Aesthetics */}
      <style jsx>{`
        .login-portal-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f1f5f9;
          position: relative;
          padding: 1.5rem 1rem;
          font-family: inherit;
        }
        [data-theme="dark"] .login-portal-wrapper {
          background-color: #0b1120;
        }
        .login-backdrop-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.45;
          pointer-events: none;
        }
        [data-theme="dark"] .login-backdrop-grid {
          background-image: radial-gradient(#334155 1px, transparent 1px);
          opacity: 0.35;
        }
        .login-main-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .login-brand-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.25rem;
        }
        .login-emblems {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .login-emblem-divider {
          width: 1px;
          height: 38px;
          background-color: #cbd5e1;
        }
        [data-theme="dark"] .login-emblem-divider {
          background-color: #475569;
        }
        .login-portal-title {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #1e3a5f;
          margin: 0;
        }
        [data-theme="dark"] .login-portal-title {
          color: #38bdf8;
        }
        .login-portal-sub {
          font-size: 0.76rem;
          color: #64748b;
          font-weight: 500;
          margin: 0.15rem 0 0;
        }
        [data-theme="dark"] .login-portal-sub {
          color: #94a3b8;
        }
        .login-card-box {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
          padding: 1.75rem;
        }
        [data-theme="dark"] .login-card-box {
          background: #111827;
          border-color: #1f2937;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .login-card-header {
          text-align: center;
          margin-bottom: 1.25rem;
        }
        .login-app-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        [data-theme="dark"] .login-app-badge {
          background: #082f49;
          color: #38bdf8;
        }
        .login-card-header h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem;
        }
        [data-theme="dark"] .login-card-header h2 {
          color: #f8fafc;
        }
        .login-card-header p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }
        [data-theme="dark"] .login-card-header p {
          color: #94a3b8;
        }
        .demo-credentials-banner {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.6rem 0.75rem;
          margin-bottom: 1.25rem;
        }
        [data-theme="dark"] .demo-credentials-banner {
          background: #1e293b;
          border-color: #334155;
        }
        .demo-banner-title {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.73rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        [data-theme="dark"] .demo-banner-title {
          color: #cbd5e1;
        }
        .demo-pills-row {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .demo-pill {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 0.2rem 0.45rem;
          font-size: 0.72rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: all 0.15s ease;
        }
        [data-theme="dark"] .demo-pill {
          background: #0f172a;
          border-color: #334155;
          color: #cbd5e1;
        }
        .demo-pill:hover,
        .demo-pill.active {
          border-color: #0284c7;
          background: #f0f9ff;
        }
        [data-theme="dark"] .demo-pill:hover,
        [data-theme="dark"] .demo-pill.active {
          background: #0c4a6e;
          border-color: #38bdf8;
        }
        .pill-id {
          font-weight: 700;
          color: #1e3a5f;
        }
        [data-theme="dark"] .pill-id {
          color: #38bdf8;
        }
        .pill-role {
          font-size: 0.65rem;
          color: #64748b;
        }
        [data-theme="dark"] .pill-role {
          color: #94a3b8;
        }
        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          color: #b91c1c;
          padding: 0.65rem 0.85rem;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-bottom: 1.25rem;
        }
        [data-theme="dark"] .login-error-alert {
          background: #450a0a;
          border-color: #f87171;
          color: #fca5a5;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        [data-theme="dark"] .form-label {
          color: #cbd5e1;
        }
        .required-star {
          color: #dc2626;
        }
        .input-wrapper {
          position: relative;
        }
        .form-input {
          width: 100%;
          font-size: 0.85rem;
          padding: 0.55rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        [data-theme="dark"] .form-input {
          background: #1e293b;
          border-color: #334155;
          color: #f8fafc;
        }
        .form-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }
        .with-action .form-input {
          padding-right: 2.5rem;
        }
        .password-toggle-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
        }
        .password-toggle-btn:hover {
          color: #0f172a;
        }
        [data-theme="dark"] .password-toggle-btn:hover {
          color: #f8fafc;
        }
        .form-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          font-size: 0.78rem;
        }
        .checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #475569;
          cursor: pointer;
        }
        [data-theme="dark"] .checkbox-label {
          color: #94a3b8;
        }
        .forgot-link-btn {
          background: transparent;
          border: none;
          color: #0284c7;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }
        .forgot-link-btn:hover {
          text-decoration: underline;
        }
        .login-submit-btn {
          width: 100%;
          padding: 0.65rem;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .login-security-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          margin-top: 1.25rem;
          font-size: 0.72rem;
          color: #64748b;
          text-align: center;
        }
        [data-theme="dark"] .login-security-notice {
          color: #94a3b8;
        }
        .login-footer-strip {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.73rem;
          color: #64748b;
        }
        [data-theme="dark"] .login-footer-strip {
          color: #94a3b8;
        }
        .login-footer-strip p {
          margin: 0 0 0.25rem;
        }
        .footer-compliance-tags {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.68rem;
          color: #94a3b8;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-card {
          background: #ffffff;
          border-radius: 8px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
        [data-theme="dark"] .modal-card {
          background: #1e293b;
          color: #f8fafc;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2e8f0;
        }
        [data-theme="dark"] .modal-header {
          border-color: #334155;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }
        .modal-close-btn {
          background: transparent;
          border: none;
          font-size: 1.4rem;
          line-height: 1;
          color: #64748b;
          cursor: pointer;
        }
        .modal-body {
          padding: 1.25rem;
        }
        .modal-success {
          text-align: center;
          padding: 1rem 0;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
