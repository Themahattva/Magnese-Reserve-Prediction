import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'MOIL Manganese Intelligence — AI-Powered Mining Dashboard',
  description:
    'AI/ML and Space Technology powered dashboard for manganese reserve identification and production shortfall prediction for MOIL Ltd. Built for Smart India Hackathon 2026.',
  keywords: [
    'MOIL',
    'manganese',
    'mining',
    'AI',
    'ML',
    'satellite',
    'reserve estimation',
    'production prediction',
    'SIH 2026',
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
        <div className="app-layout">
          <Sidebar />
          <Header />
          <main className="main-content">
            <div className="page-content">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
