import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateEmployee } from '@/lib/auth/employee-auth';

const loginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').max(30),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and password are required.' },
        { status: 400 }
      );
    }

    const { employeeId, password } = parsed.data;

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await authenticateEmployee(employeeId, password, ipAddress, userAgent);

    if (!result.success) {
      const status = result.retryAfterSeconds ? 429 : 401;
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Authentication failed',
          retryAfterSeconds: result.retryAfterSeconds,
        },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl: '/',
    });
  } catch (err) {
    console.error('Login route error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred during authentication.' },
      { status: 500 }
    );
  }
}
