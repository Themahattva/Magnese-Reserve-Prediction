import React from 'react';
import type { Metadata } from 'next';
import LoadingScreen from '@/components/auth/LoadingScreen';

export const metadata: Metadata = {
  title: 'MOIL - ANVESHA',
  description: 'MOIL Limited - ANVESHA Mining Intelligence Platform',
};

export default function LandingPage() {
  return <LoadingScreen redirectUrl="/login" autoRedirect={true} />;
}
