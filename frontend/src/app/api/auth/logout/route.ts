import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth/employee-auth';

export async function POST(request: NextRequest) {
  try {
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await logoutUser(ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      message: 'Session successfully terminated.',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to terminate session.' },
      { status: 500 }
    );
  }
}
