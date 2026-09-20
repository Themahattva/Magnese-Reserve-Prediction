'use client';

import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Initializing ANVESHA Secure Portal...' }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--ux4g-bg, #f8fafc)',
        color: 'var(--text-primary, #0f172a)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          maxWidth: '400px',
        }}
      >
        {/* MOIL Emblem */}
        <div style={{ position: 'relative', width: '72px', height: '72px' }}>
          <Image
            src="/moil.png"
            alt="MOIL Limited Logo"
            width={72}
            height={72}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div>
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              margin: '0 0 0.25rem 0',
              color: 'var(--ux4g-primary, #1e3a5f)',
            }}
          >
            ANVESHA
          </h1>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #475569)',
              margin: 0,
            }}
          >
            Manganese Intelligence &amp; Decision Support Platform
          </p>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted, #64748b)',
              marginTop: '0.2rem',
            }}
          >
            MOIL Limited &bull; A Government of India Enterprise
          </div>
        </div>

        {/* Minimal Accessible Loading Spinner */}
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2.5px solid #e2e8f0',
              borderTopColor: 'var(--ux4g-primary, #1e3a5f)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary, #334155)' }}>
            {message}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="animation: spin"] {
            animation: none !important;
            border-top-color: #1e3a5f;
          }
        }
      `}</style>
    </div>
  );
}
