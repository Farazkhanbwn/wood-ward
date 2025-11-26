import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to apply no-cache headers
function applyNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

// Helper function to decode and validate JWT token
function decodeToken(token: string): { role: string; exp?: number } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    
    // Check token expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }
    
    // Validate role
    const validRoles = ['admin', 'coach', 'sales']
    if (!payload.role || !validRoles.includes(payload.role)) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const pathname = request.nextUrl.pathname

  console.log('🔍 Middleware - Path:', pathname)
  console.log('🍪 Middleware - Token present:', !!token)
  console.log('🍪 All cookies:', request.cookies.getAll().map(c => c.name))

  // Allow setup pages FIRST - without any token checks
  if (pathname === '/coach-setup' || pathname === '/rep-setup') {
    const response = NextResponse.next()
    if (token) {
      response.cookies.delete('token')
    }
    return applyNoCacheHeaders(response)
  }

  // Protected routes
  const protectedRoutes = ['/admin', '/coach', '/sales']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Add cache control headers for ALL protected routes (with or without token)
  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      return applyNoCacheHeaders(NextResponse.redirect(new URL('/login', request.url)))
    }

    // If token exists, continue with cache headers
    const response = NextResponse.next()
    response.headers.set('Surrogate-Control', 'no-store')
    return applyNoCacheHeaders(response)
  }

  // If logged in and trying to access login/signup, redirect to appropriate dashboard
  if (token && (pathname === '/login' || pathname === '/signup')) {
    const payload = decodeToken(token.value)
    
    if (!payload) {
      // Invalid or expired token, clear it and allow access
      const response = NextResponse.next()
      response.cookies.delete('token')
      return response
    }
    
    const roleRoutes: Record<string, string> = {
      admin: '/admin/company-management',
      coach: '/coach/team-management',
      sales: '/sales'
    }
    
    const redirectPath = roleRoutes[payload.role]
    if (redirectPath) {
      return applyNoCacheHeaders(NextResponse.redirect(new URL(redirectPath, request.url)))
    }
  }

  // Add cache headers for login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return applyNoCacheHeaders(NextResponse.next())
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/sales/:path*', '/login', '/signup', '/coach-setup', '/rep-setup']
}
