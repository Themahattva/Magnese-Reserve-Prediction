'use client';

import { Shield, Activity } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="ux4g-footer" role="contentinfo">
      <div className="ux4g-footer-container">
        <div className="ux4g-footer-top">
          <div className="ux4g-footer-brand">
            <h2>{t('footer.title', 'ANVESHA — Mining Decision Support System')}</h2>
            <p>
              {t(
                'footer.desc',
                'Uncertainty-Aware Geospatial AI for Manganese Exploration & Operational Shortfall Intelligence. Built in accordance with Government of India UX4G Design System 3.0 guidelines.'
              )}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600, color: '#ffffff' }}>{t('footer.notice_title', 'Operational Notice')}</span>
            <p style={{ maxWidth: '400px', color: '#94a3b8', lineHeight: 1.4 }}>
              {t(
                'footer.notice_desc',
                'Satellite remote sensing delivers surface geological indicators to support inferred subsurface models. Underground manganese reserve calculations must be validated by core borehole assay logs.'
              )}
            </p>
          </div>
        </div>

        <div className="ux4g-footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span>&copy; {new Date().getFullYear()} {t('footer.copy', 'Ministry of Steel • MOIL Limited • ANVESHA')}</span>
            <span>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={13} style={{ color: '#34d399' }} aria-hidden="true" />
              <span>{t('footer.wcag', 'WCAG 2.1 AA Target')}</span>
            </span>
            <span>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={13} style={{ color: '#60a5fa' }} aria-hidden="true" />
              <span>{t('footer.status', 'System Status: Healthy')}</span>
            </span>
          </div>

          <div>
            <span>{t('footer.version', 'Version 3.0-gov • Deterministic Demo Engine')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
