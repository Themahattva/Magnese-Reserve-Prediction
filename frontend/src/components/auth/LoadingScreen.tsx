'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Sparkles, ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LoadingScreenProps {
  initialProgress?: number;
  autoRedirect?: boolean;
  redirectUrl?: string;
  onComplete?: () => void;
}

const LOADING_STAGES_EN = [
  'Connecting to National Mineral Geodatabase...',
  'Ingesting Sentinel-2 Remote Sensing & Spectral Ratios...',
  'Synthesizing Sausar Belt 3D Subsurface Orebody Model...',
  'Synchronizing Real-Time HEMM Fleet Telemetry...',
  'Validating Security Perimeter & Workspace...',
  'ANVESHA System Ready • Official MOIL Portal',
];

const LOADING_STAGES_HI = [
  'राष्ट्रीय खनिज भू-डेटाबेस से जुड़ रहा है...',
  'सेंटिनल-2 रिमोट सेंसिंग और स्पेक्ट्रल डेटा का विश्लेषण...',
  'सौसर बेल्ट 3डी उपसतह अयस्क मॉडल का संश्लेषण...',
  'वास्तविक समय एचईएमएम बेड़े टेलीमेट्री का समन्वय...',
  'सुरक्षा परिधि और कार्यक्षेत्र का सत्यापन...',
  'अन्वेषा सिस्टम तैयार • आधिकारिक मॉयल पोर्टल',
];

export default function LoadingScreen({
  initialProgress = 0,
  autoRedirect = false,
  redirectUrl = '/',
  onComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [stageIndex, setStageIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const { language, setLanguage, isHindi } = useLanguage();

  const stages = isHindi ? LOADING_STAGES_HI : LOADING_STAGES_EN;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          if (onComplete) onComplete();
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        const next = Math.min(100, prev + increment);

        // Update stage based on progress
        const nextStage = Math.min(
          stages.length - 1,
          Math.floor((next / 100) * stages.length)
        );
        setStageIndex(nextStage);

        return next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [stages.length, onComplete]);

  return (
    <div className="loading-landing-wrapper" role="region" aria-label="ANVESHA Loading Portal">
      {/* Background Animated Atmosphere */}
      <div className="ambient-background" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      {/* Top Government Masthead & Language Bar */}
      <header className="landing-top-bar">
        <div className="top-bar-inner">
          <div className="gov-identity">
            <span className="gov-title">भारत सरकार | Government of India</span>
            <span className="gov-sub">Ministry of Steel &bull; इस्पात मंत्रालय</span>
          </div>

          <div className="top-controls">
            <div className="lang-switcher" role="group" aria-label="Language">
              <button
                type="button"
                className={`lang-btn ${isHindi ? 'active' : ''}`}
                onClick={() => setLanguage('hi')}
                aria-pressed={isHindi}
              >
                हिंदी
              </button>
              <span className="lang-divider">|</span>
              <button
                type="button"
                className={`lang-btn ${!isHindi ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                aria-pressed={!isHindi}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tricolor National Stripe */}
      <div className="tricolor-strip" aria-hidden="true">
        <span className="saffron" />
        <span className="white" />
        <span className="green" />
      </div>

      {/* Central Interactive Showcase */}
      <main className="landing-central-card">
        {/* Emblem & Logo Duo */}
        <div className="emblems-container">
          {/* Ashok Stambh (National Emblem) */}
          <div className="emblem-card stambh-card" title="State Emblem of India - Satyameva Jayate">
            <div className="emblem-glow" aria-hidden="true" />
            <Image
              src="/ashok-stambh.png"
              alt="State Emblem of India - Satyameva Jayate"
              width={76}
              height={104}
              priority
              className="stambh-img"
            />
            <span className="motto-text">सत्यमेव जयते</span>
          </div>

          <div className="emblems-separator" aria-hidden="true" />

          {/* MOIL Limited Logo */}
          <div className="emblem-card moil-card" title="MOIL Limited - A Government of India Enterprise">
            <div className="emblem-glow moil-glow" aria-hidden="true" />
            <Image
              src="/moil.png"
              alt="MOIL Limited Corporate Logo"
              width={84}
              height={84}
              priority
              className="moil-img"
            />
            <span className="moil-badge-label">MOIL LIMITED</span>
          </div>
        </div>

        {/* Brand & Portal Titles */}
        <div className="brand-block">
          <div className="portal-pill-badge">
            <Sparkles size={13} style={{ color: '#f59e0b' }} aria-hidden="true" />
            <span>{isHindi ? 'राष्ट्रीय मैंगनीज आसूचना पोर्टल' : 'National Mining Intelligence Portal'}</span>
          </div>

          <h1 className="portal-main-heading">
            <span className="heading-hindi">अन्वेषा</span>
            <span className="heading-sep">&bull;</span>
            <span className="heading-eng">ANVESHA</span>
          </h1>

          <p className="portal-tagline">
            {isHindi
              ? 'मैंगनीज पूर्वेक्षण, 3डी अयस्क भंडार एवं परिचालन कमी निर्णय समर्थन प्रणाली'
              : 'Manganese Exploration, 3D Orebody & Production Decision Support System'}
          </p>

          <p className="portal-enterprise-sub">
            {isHindi
              ? 'मॉयल लिमिटेड &bull; भारत सरकार का उद्यम'
              : 'MOIL Limited &bull; A Government of India Enterprise'}
          </p>
        </div>

        {/* Loading Animation Core */}
        <div className="loader-box" role="status" aria-live="polite">
          {/* Stage Message & Live Percentage */}
          <div className="loader-meta-row">
            <div className="loader-status-text">
              <span className={`status-pulse-indicator ${isReady ? 'ready' : ''}`} aria-hidden="true" />
              <span>{stages[stageIndex]}</span>
            </div>
            <div className="loader-counter">
              <strong>{progress}</strong>%
            </div>
          </div>

          {/* Tricolor Animated Progress Track */}
          <div className="progress-track" aria-label={`Loading progress: ${progress}%`}>
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-shimmer" aria-hidden="true" />
            </div>
          </div>

          {/* Operational Checklist Badges */}
          <div className="features-checklist">
            <div className={`check-chip ${progress >= 30 ? 'active' : ''}`}>
              <CheckCircle2 size={13} className="chip-icon" />
              <span>{isHindi ? 'सेंटिनल-2 उपग्रह' : 'Sentinel-2 Remote Sensing'}</span>
            </div>
            <div className={`check-chip ${progress >= 60 ? 'active' : ''}`}>
              <CheckCircle2 size={13} className="chip-icon" />
              <span>{isHindi ? '3डी सौसर क्रिगिंग' : '3D Sausar Kriging'}</span>
            </div>
            <div className={`check-chip ${progress >= 85 ? 'active' : ''}`}>
              <CheckCircle2 size={13} className="chip-icon" />
              <span>{isHindi ? 'एचईएमएम टेलीमेट्री' : 'HEMM Telemetry'}</span>
            </div>
            <div className={`check-chip ${progress >= 100 ? 'active' : ''}`}>
              <CheckCircle2 size={13} className="chip-icon" />
              <span>{isHindi ? 'सुरक्षित प्रमाणीकरण' : 'RBAC Security'}</span>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="landing-actions-container">
            {isReady ? (
              <div className="action-buttons-group">
                <Link href={redirectUrl} className="ux4g-btn ux4g-btn-primary enter-portal-btn">
                  <span>{isHindi ? 'अन्वेषा पोर्टल में प्रवेश करें' : 'Enter ANVESHA Portal'}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/login" className="ux4g-btn ux4g-btn-outline employee-login-btn">
                  <Shield size={14} aria-hidden="true" />
                  <span>{isHindi ? 'कर्मचारी लॉगिन' : 'Employee Login'}</span>
                </Link>
              </div>
            ) : (
              <div className="loading-waiting-message">
                <span className="wait-spinner" aria-hidden="true" />
                <span>{isHindi ? 'प्रणाली प्रारंभ हो रही है, कृपया प्रतीक्षा करें...' : 'Initializing system modules, please wait...'}</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Institutional Government Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} MOIL Limited &bull; Ministry of Steel &bull; Government of India
          </div>
          <div className="footer-standards">
            <span>UX4G Design System 3.0</span>
            <span>&bull;</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>&bull;</span>
            <span>GIGW 3.0 Standard</span>
          </div>
        </div>
      </footer>

      {/* Scoped CSS for Government Grade Presentation */}
      <style jsx>{`
        .loading-landing-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #0a1128 0%, #101f42 50%, #060d21 100%);
          color: #f8fafc;
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }
        .ambient-background {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 20%, rgba(2, 132, 199, 0.18) 0%, transparent 60%),
                      radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.6;
          pointer-events: none;
        }

        /* Top Government Bar */
        .landing-top-bar {
          width: 100%;
          background: rgba(10, 17, 40, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 10;
        }
        .top-bar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.5rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .gov-identity {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .gov-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.03em;
        }
        .gov-sub {
          font-size: 0.7rem;
          color: #94a3b8;
        }
        .lang-switcher {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.15rem 0.45rem;
          border-radius: 14px;
        }
        .lang-btn {
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.1rem 0.4rem;
          border-radius: 10px;
          transition: all 0.15s ease;
        }
        .lang-btn.active {
          background: #0284c7;
          color: #ffffff;
          font-weight: 700;
        }
        .lang-divider {
          color: rgba(255, 255, 255, 0.25);
          font-size: 0.7rem;
        }

        /* Tricolor Strip */
        .tricolor-strip {
          width: 100%;
          height: 4px;
          display: flex;
          z-index: 10;
        }
        .tricolor-strip .saffron {
          flex: 1;
          background-color: #ff9933;
        }
        .tricolor-strip .white {
          flex: 1;
          background-color: #ffffff;
        }
        .tricolor-strip .green {
          flex: 1;
          background-color: #138808;
        }

        /* Central Container */
        .landing-central-card {
          position: relative;
          z-index: 5;
          max-width: 680px;
          width: 92%;
          margin: 1.5rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* Emblems Container */
        .emblems-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2.2rem;
          margin-bottom: 1.25rem;
        }
        .emblem-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: transform 0.25s ease;
        }
        .emblem-card:hover {
          transform: translateY(-2px);
        }
        .emblem-glow {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12), transparent 70%);
          pointer-events: none;
        }
        .moil-glow {
          background: radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.2), transparent 70%);
        }
        .stambh-img {
          height: 96px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
        }
        .moil-img {
          height: 76px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
        }
        .motto-text {
          margin-top: 0.45rem;
          font-size: 0.76rem;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }
        .moil-badge-label {
          margin-top: 0.45rem;
          font-size: 0.76rem;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 0.06em;
        }
        .emblems-separator {
          width: 1px;
          height: 80px;
          background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.25), transparent);
        }

        /* Brand Block */
        .brand-block {
          margin-bottom: 1.5rem;
        }
        .portal-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          margin-bottom: 0.6rem;
        }
        .portal-main-heading {
          font-size: 2.3rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          margin: 0 0 0.4rem;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        .heading-hindi {
          color: #ff9933;
          font-weight: 800;
        }
        .heading-sep {
          color: rgba(255, 255, 255, 0.3);
          font-size: 1.2rem;
        }
        .heading-eng {
          background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .portal-tagline {
          font-size: 0.95rem;
          color: #cbd5e1;
          margin: 0 auto 0.35rem;
          max-width: 580px;
          line-height: 1.45;
          font-weight: 400;
        }
        .portal-enterprise-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 0;
          font-weight: 500;
        }

        /* Loader Core */
        .loader-box {
          width: 100%;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }
        .loader-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
        }
        .loader-status-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e2e8f0;
          font-weight: 500;
          text-align: left;
        }
        .status-pulse-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
          animation: pulseGlow 1.5s infinite;
        }
        .status-pulse-indicator.ready {
          background-color: #22c55e;
          box-shadow: 0 0 10px #22c55e;
          animation: none;
        }
        .loader-counter {
          color: #38bdf8;
          font-family: ui-monospace, monospace;
          font-size: 0.95rem;
        }

        /* Progress Bar */
        .progress-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1.25rem;
          position: relative;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff9933 0%, #38bdf8 50%, #22c55e 100%);
          border-radius: 6px;
          position: relative;
          transition: width 0.18s ease-out;
        }
        .progress-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%);
          animation: shimmerMove 1.5s infinite;
        }

        /* Checklist */
        .features-checklist {
          display: flex;
          justify-content: center;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .check-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.25rem 0.6rem;
          border-radius: 12px;
          font-size: 0.73rem;
          color: #64748b;
          transition: all 0.3s ease;
        }
        .check-chip.active {
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.35);
          color: #86efac;
        }
        .chip-icon {
          color: inherit;
        }

        /* Action Buttons */
        .landing-actions-container {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-buttons-group {
          display: flex;
          gap: 0.75rem;
          width: 100%;
          animation: fadeIn 0.4s ease-out forwards;
        }
        .enter-portal-btn {
          flex: 2;
          padding: 0.75rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 700;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          border: none;
          color: #ffffff;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          text-decoration: none;
        }
        .enter-portal-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(2, 132, 199, 0.6);
        }
        .employee-login-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          font-size: 0.88rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f8fafc;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .employee-login-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.35);
        }
        .loading-waiting-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.82rem;
        }
        .wait-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #38bdf8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Footer */
        .landing-footer {
          width: 100%;
          background: rgba(10, 17, 40, 0.9);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.75rem 1.5rem;
          z-index: 10;
        }
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #94a3b8;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .footer-standards {
          display: flex;
          gap: 0.6rem;
          color: #64748b;
        }

        /* Animations */
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes shimmerMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .emblems-container {
            gap: 1.2rem;
          }
          .portal-main-heading {
            font-size: 1.8rem;
          }
          .action-buttons-group {
            flex-direction: column;
          }
          .footer-inner {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .status-pulse-indicator,
          .progress-shimmer,
          .wait-spinner,
          .action-buttons-group {
            animation: none !important;
          }
          .progress-fill {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
