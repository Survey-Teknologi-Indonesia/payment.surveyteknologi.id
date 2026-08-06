import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for the auth token in cookies
  const authToken = request.cookies.get('auth_token')?.value;

  // If the user is trying to access the dashboard and doesn't have a token, redirect to login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If the user is trying to access login but already has a token, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Ensure the middleware is only run for the relevant paths
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
