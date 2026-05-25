import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected Routes Middleware (4.4)
 *
 * Since tokens are stored in localStorage (client-only), we use a cookie-based
 * signal written at login time. The API client also sets `utsukushii-session`
 * cookie to allow the edge middleware to detect authentication state.
 *
 * Fallback: if the cookie is absent, the client-side AuthGuard will handle the
 * redirect after hydration.
 */

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
];

const PROTECTED_PREFIXES = [
  '/projects',
  '/settings',
  '/renders',
  '/presets',
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname.startsWith('/api'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // Check for auth cookie (set by the login flow)
  const sessionCookie = request.cookies.get('utsukushii-session');

  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
