import { type NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

function redirectWithSession(
  request: NextRequest,
  pathname: string,
  sessionResponse: NextResponse
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = '';
  const redirectResponse = NextResponse.redirect(redirectUrl);
  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminSignIn = pathname === '/admin/sign-in' || pathname.startsWith('/admin/sign-in/');

  if (isDashboardRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/sign-in';
    redirectUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  if (isAdminSignIn && user) {
    return redirectWithSession(request, '/dashboard/overview', response);
  }

  // Legacy Clerk auth URLs → admin sign-in (no customer auth)
  if (pathname.startsWith('/auth/sign-in') || pathname.startsWith('/auth/sign-up')) {
    return redirectWithSession(request, '/admin/sign-in', response);
  }

  return response;
}

export const config = {
  // Keep auth refresh off the public storefront so those pages can stay static.
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*', '/api/:path*']
};
