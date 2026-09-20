import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { SESSION_COOKIE_NAME } from '@/lib/auth/employee-auth';

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/session',
  '/api/auth/forgot-password',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow internal Next.js assets, static files, and public images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') || // allow backend proxying if any
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Check for active session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const isAuthenticated = Boolean(sessionCookie && sessionCookie.value);

  // 3. Route guarding logic
  const isPublicRoute = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // If unauthenticated and trying to access protected route -> redirect to /login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access /login -> redirect to home dashboard
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Update Supabase session if live Supabase is configured
  return await updateSession(request);
}

// Next.js 16 convention matches all requests except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
