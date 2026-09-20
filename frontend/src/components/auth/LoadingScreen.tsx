'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LoadingScreenProps {
  redirectUrl?: string;
  autoRedirect?: boolean;
  onComplete?: () => void;
  isOverlay?: boolean;
}

export default function LoadingScreen({
  redirectUrl = '/login',
  autoRedirect = true,
  onComplete,
  isOverlay = false,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFading(true);
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            } else if (autoRedirect && redirectUrl) {
              router.push(redirectUrl);
            }
          }, 300);
          return 100;
        }
        // Smooth increment: ~5% every 45ms -> ~1 second total
        const increment = Math.floor(Math.random() * 6) + 4;
        const next = prev + increment;
        return next > 100 ? 100 : next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [autoRedirect, redirectUrl, onComplete, router]);

  return (
    <div
      className={`simple-loading-container ${isOverlay ? 'is-overlay' : ''} ${
        fading ? 'is-fading' : ''
      }`}
      aria-live="polite"
      aria-label="Loading ANVESHA"
    >
      <div className="center-card">
        {/* Centered Logos */}
        <div className="logos-group">
          <div className="logo-item">
            <Image
              src="/ashok-stambh.png"
              alt="Ashok Stambh"
              width={54}
              height={75}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="logo-divider" />
          <div className="logo-item">
            <Image
              src="/moil.png"
              alt="MOIL Logo"
              width={64}
              height={64}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="brand-text">
          <h1 className="company-name">MOIL LIMITED</h1>
          <p className="system-name">अन्वेषा &bull; ANVESHA</p>
        </div>

        {/* Simple Loading Bar */}
        <div className="loader-wrapper">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="progress-meta">
            <span className="loading-status">Loading...</span>
            <span className="loading-value">{progress}%</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .simple-loading-container {
          min-height: 100vh;
          width: 100%;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          margin: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          transition: opacity 0.3s ease-out;
        }

        .simple-loading-container.is-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99999;
        }

        .simple-loading-container.is-fading {
          opacity: 0;
          pointer-events: none;
        }

        .center-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 320px;
        }

        .logos-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1.75rem;
        }

        .logo-item {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 75px;
        }

        .logo-divider {
          width: 1px;
          height: 48px;
          background-color: #e2e8f0;
        }

        .brand-text {
          margin-bottom: 2rem;
        }

        .company-name {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .system-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748b;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .loader-wrapper {
          width: 100%;
          max-width: 260px;
        }

        .progress-bar-track {
          width: 100%;
          height: 4px;
          background-color: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 0.6rem;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: #1e3a5f;
          border-radius: 9999px;
          transition: width 0.08s ease-out;
        }

        .progress-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .loading-value {
          font-variant-numeric: tabular-nums;
          color: #475569;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
