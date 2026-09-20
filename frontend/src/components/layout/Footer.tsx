'use client';

import Image from 'next/image';
import { Shield, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="ux4g-footer" role="contentinfo">
      <div className="ux4g-footer-container">
        <div className="ux4g-footer-top">
          <div className="ux4g-footer-brand">
            <h2>ANVESHA — Mining Decision Support System</h2>
            <p>
              Uncertainty-Aware Geospatial AI for Manganese Exploration &amp; Operational Shortfall Intelligence.
              Built in accordance with Government of India UX4G Design System 3.0 guidelines.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600, color: '#ffffff' }}>Operational Notice</span>
            <p style={{ maxWidth: '400px', color: '#94a3b8', lineHeight: 1.4 }}>
              Satellite remote sensing delivers surface geological indicators to support inferred subsurface models.
              Underground manganese reserve calculations must be validated by core borehole assay logs.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src="/make-in-india.png"
                alt="Make in India"
                width={140}
                height={79}
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        <div className="ux4g-footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span>&copy; {new Date().getFullYear()} Ministry of Steel &bull; MOIL Limited &bull; ANVESHA</span>
            <span>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={13} style={{ color: '#34d399' }} aria-hidden="true" />
              <span>WCAG 2.1 AA Target</span>
            </span>
            <span>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={13} style={{ color: '#60a5fa' }} aria-hidden="true" />
              <span>System Status: Healthy</span>
            </span>
          </div>

          <div>
            <span>Version 3.0-gov &bull; Deterministic Demo Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
