import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect root directly to Elite Dental agent dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/agents/f02fd2dc-32d7-42b8-8378-126d354798f7', request.url));
  }
}

export const config = {
  matcher: '/',
};
