import type { Metadata } from 'next';
import 'ux4g-web-components/styles.css';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
