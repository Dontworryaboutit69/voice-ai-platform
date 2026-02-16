import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect root to /agents dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/agents', request.url));
  }
}

export const config = {
  matcher: '/',
};
