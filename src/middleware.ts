import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/admin', '/applicant', '/emp'];

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const { role } = jwtDecode(token) as { role: string };
      if (
        (pathname.startsWith('/admin') && role !== 'ADMIN') ||
        (pathname.startsWith('/applicant') && role !== 'USER') ||
        (pathname.startsWith('/emp') && role !== 'EMP')
      ) {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/applicant/:path*', '/emp/:path*'],
};
