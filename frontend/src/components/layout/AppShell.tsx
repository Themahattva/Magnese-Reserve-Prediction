'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AccessibilityBar from '@/components/layout/AccessibilityBar';
import Navbar from '@/components/layout/Navbar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Footer from '@/components/layout/Footer';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [initialLoading, setInitialLoading] = useState(true);
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/landing' || pathname === '/welcome';

  return (
    <LanguageProvider>
      <AuthProvider>
        {initialLoading && !isLandingPage && (
          <LoadingScreen
            isOverlay={true}
            autoRedirect={false}
            onComplete={() => setInitialLoading(false)}
          />
        )}
        {isLandingPage ? (
          <>{children}</>
        ) : isLoginPage ? (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AccessibilityBar />
            {children}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AccessibilityBar />
            <Navbar />
            <Breadcrumbs />
            <main id="main-content" className="ux4g-main-container" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
        )}
      </AuthProvider>
    </LanguageProvider>
  );
}
