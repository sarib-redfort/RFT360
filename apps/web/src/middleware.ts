import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Gates the CMS. Any unauthenticated request to `/admin/*` is redirected to the
 * login page (with a `callbackUrl` so the user returns where they intended).
 * Fine-grained per-action permission is still enforced server-side by the API's
 * `RolesGuard` — this is the first line, not the only one.
 */
export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith('/admin');
  if (isAdmin && !req.auth) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  // Run on admin routes only; keep the public site out of the auth middleware.
  matcher: ['/admin/:path*'],
};
