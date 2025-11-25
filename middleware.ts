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
  const pathname = request.nextUrl.pathname

  // Allow setup pages
  if (pathname === '/coach-setup' || pathname === '/rep-setup') {
    return applyNoCacheHeaders(NextResponse.next())
  }

  // Add cache control headers for protected routes
  const protectedRoutes = ['/admin', '/coach', '/sales']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    const response = NextResponse.next()
    response.headers.set('Surrogate-Control', 'no-store')
    return applyNoCacheHeaders(response)
  }

  // Redirect logged-in users away from login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    const token = request.cookies.get('token')?.value
    
    if (token) {
      const payload = decodeToken(token)
      if (payload) {
        const dashboardRoutes: Record<string, string> = {
          admin: '/admin/company-management',
          coach: '/coach/team-management',
          sales: '/sales'
        }
        const redirectUrl = dashboardRoutes[payload.role] || '/sales'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    
    return applyNoCacheHeaders(NextResponse.next())
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/sales/:path*', '/login', '/signup', '/coach-setup', '/rep-setup']
}
