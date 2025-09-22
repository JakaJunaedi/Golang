// middleware.ts (di root project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['user', 'manager', 'admin'],
  '/admin': ['admin'],
  '/manager': ['manager', 'admin'],
  '/profile': ['user', 'manager', 'admin'],
} as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (protectedRoute) {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Here you could decode JWT and check roles if needed
    // For now, we'll let the client-side handle role-based access
  }

  // Handle auth pages when user is already logged in
  if (['/login', '/register'].includes(pathname)) {
    const token = request.cookies.get('accessToken')?.value;
    
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};