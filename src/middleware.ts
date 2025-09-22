import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith('/mypage')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname + search); // 로그인 후 복귀용
    return NextResponse.redirect(url);
  }

  // 역할 검사: /mypage/admin | /mypage/user | /mypage/emp등
  try {
    const { role } = jwtDecode<{ role?: string }>(token) || {};
    if (pathname.startsWith('/mypage/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
    if (pathname.startsWith('/mypage/user') && role !== 'USER') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
    if (pathname.startsWith('/mypage/emp') && role !== 'EMP') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  } catch {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/mypage/:path*'],
};
