import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recordAuditLog } from '@/lib/auth/employee-auth';

const recoverySchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = recoverySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required.' },
        { status: 400 }
      );
    }

    const employeeId = parsed.data.employeeId.trim().toUpperCase();
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Record audit event
    await recordAuditLog(employeeId, 'PASSWORD_RESET_REQUEST', true, ipAddress, userAgent);

    // Always return a generic success notice to prevent account enumeration
    return NextResponse.json({
      success: true,
      message:
        'If an active employee account matching this ID exists, password recovery instructions have been initiated with the MOIL System Administrator.',
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process password recovery request.' },
      { status: 500 }
    );
  }
}
