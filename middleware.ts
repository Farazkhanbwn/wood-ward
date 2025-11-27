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

  // Allow setup pages FIRST - without any token checks
  if (pathname === '/coach-setup' || pathname === '/rep-setup') {
    const response = NextResponse.next()
    if (token) {
      response.cookies.delete('token')
    }
    return applyNoCacheHeaders(response)
  }

  // Protected routes - just add cache headers, client-side will handle auth
  const protectedRoutes = ['/admin', '/coach', '/sales']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Allow access, client-side will check localStorage and redirect if needed
    const response = NextResponse.next()
    response.headers.set('Surrogate-Control', 'no-store')
    return applyNoCacheHeaders(response)
  }

  // Login/signup pages - client-side will handle redirect if already logged in

  // Add cache headers for login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return applyNoCacheHeaders(NextResponse.next())
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/sales/:path*', '/login', '/signup', '/coach-setup', '/rep-setup']
}
