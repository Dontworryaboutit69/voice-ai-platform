import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Let the marketing homepage render at /
  return NextResponse.next();
}

export const config = {
  // Only match specific routes that need middleware in the future
  matcher: [],
};
