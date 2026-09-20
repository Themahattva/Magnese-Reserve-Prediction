import type { Metadata } from 'next';
import 'ux4g-web-components/styles.css';
import './globals.css';
import AccessibilityBar from '@/components/layout/AccessibilityBar';
import Navbar from '@/components/layout/Navbar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'ANVESHA — Uncertainty-Aware AI for Manganese Exploration & Production',
  description:
    'Government of India compliant AI decision-support platform for manganese prospectivity, 3D orebody modeling, active drilling recommendation, and production shortfall prediction.',
  keywords: [
    'ANVESHA',
    'MOIL',
    'Manganese',
    'Mining AI',
    'Active Exploration',
    '3D Orebody',
    'Uncertainty Quantification',
    'UX4G',
    'Smart India Hackathon',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AccessibilityBar />
          <Navbar />
          <Breadcrumbs />
          <main id="main-content" className="ux4g-main-container" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
