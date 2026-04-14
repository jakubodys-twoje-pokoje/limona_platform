import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Optional IP whitelist
    const allowedIps = process.env.ADMIN_ALLOWED_IPS?.split(',').filter(Boolean) ?? [];
    if (allowedIps.length > 0) {
      const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '';
      if (!allowedIps.includes(ip.trim())) {
        return NextResponse.rewrite(new URL('/login', req.url));
      }
    }

    if (!token || !['superadmin', 'moderator'].includes(token.rola as string)) {
      return NextResponse.rewrite(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/dashboard/:path*', '/zgloszenia/:path*', '/inwestorzy/:path*', '/oferty/:path*', '/materialy/:path*', '/platnosci/:path*', '/ustawienia/:path*'],
};
