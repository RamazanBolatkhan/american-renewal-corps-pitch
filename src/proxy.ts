import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * Fast redirect for visitors with no session cookie. This only checks that a cookie exists;
 * the real role check happens on the server in every admin page and action.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
