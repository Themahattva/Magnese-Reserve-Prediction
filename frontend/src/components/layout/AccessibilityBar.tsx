'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AccessibilityBar() {
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('moil-theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
      }
    }
  }, []);

  const handleZoom = (delta: number) => {
    if (delta === 0) {
      document.documentElement.style.fontSize = '16px';
      setFontSizeOffset(0);
      return;
    }
    const nextOffset = Math.min(3, Math.max(-2, fontSizeOffset + delta));
    setFontSizeOffset(nextOffset);
    document.documentElement.style.fontSize = `${16 + nextOffset * 2}px`;
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('moil-theme', next);
  };

  const handleScreenReaderNotice = () => {
    alert(t('a11y.screen_reader_alert'));
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('a11y.skip_to_main')}
      </a>

      <header className="moil-gov-masthead" role="banner" aria-label="Official Government of India MOIL Masthead">
        <div className="moil-gov-masthead-container">
          
          {/* Left: MOIL Identity (Centered Circle Logo + Title + Subtitle) */}
          <Link href="/" className="moil-brand-block" aria-label="MOIL Limited Home">
            <Image
              src="/moil.png"
              alt="MOIL Limited Logo"
              width={48}
              height={48}
              priority
              style={{ objectFit: 'contain' }}
            />
            <div className="moil-brand-title">{t('brand.title')}</div>
            <div className="moil-brand-subtitle">{t('brand.subtitle')}</div>
          </Link>

          {/* Center: Ashok Stambh (State Emblem of India) */}
          <div className="moil-emblem-block" aria-label="National Emblem of India - Satyameva Jayate">
            <Image
              src="/ashok-stambh.png"
              alt="State Emblem of India - Satyameva Jayate"
              width={56}
              height={76}
              priority
              style={{ height: '74px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Right: Theme, Language, Font Size & Accessibility Links */}
          <div className="moil-utility-block">
            {/* Upper Row: Controls */}
            <div className="moil-utility-controls">
              {/* Theme Toggle Button (Circular Dark Moon Button) */}
              <button
                type="button"
                className="moil-theme-btn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? t('a11y.theme_light') : t('a11y.theme_dark')}
                title={theme === 'dark' ? t('a11y.theme_light') : t('a11y.theme_dark')}
              >
                {theme === 'dark' ? (
                  <Sun size={14} style={{ color: '#fbbf24' }} />
                ) : (
                  <Moon size={14} fill="#ffffff" style={{ color: '#ffffff' }} />
                )}
              </button>

              {/* Language Switcher */}
              <div className="moil-lang-switcher" role="group" aria-label="Language selection">
                <button
                  type="button"
                  className={`moil-lang-pill ${language === 'hi' ? 'active' : ''}`}
                  onClick={() => setLanguage('hi')}
                  aria-pressed={language === 'hi'}
                  title="हिंदी भाषा चुनें (Switch to Hindi)"
                >
                  हिंदी
                </button>
                <span className="moil-lang-divider">|</span>
                <button
                  type="button"
                  className={`moil-lang-text ${language === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                  aria-pressed={language === 'en'}
                  title="Switch to English"
                >
                  Eng
                </button>
              </div>

              {/* Font Size A- A A+ */}
              <div className="moil-fontsize-controls" role="group" aria-label="Font size adjustment">
                <button
                  type="button"
                  className="moil-fs-btn"
                  onClick={() => handleZoom(-1)}
                  aria-label="Decrease font size"
                  title="Decrease font size"
                >
                  A-
                </button>
                <button
                  type="button"
                  className="moil-fs-btn bold"
                  onClick={() => handleZoom(0)}
                  aria-label="Reset font size"
                  title="Reset font size"
                >
                  A
                </button>
                <button
                  type="button"
                  className="moil-fs-btn large"
                  onClick={() => handleZoom(1)}
                  aria-label="Increase font size"
                  title="Increase font size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Lower Row: Accessibility Links */}
            <div className="moil-utility-links">
              <a href="#main-content" className="moil-a11y-link">
                {t('a11y.skip_to_main')}
              </a>
              <button
                type="button"
                onClick={handleScreenReaderNotice}
                className="moil-a11y-link-btn"
              >
                {t('a11y.screen_reader')}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Tricolor Accent Strip */}
      <div className="goi-tricolor-strip" aria-hidden="true" />
    </>
  );
}
