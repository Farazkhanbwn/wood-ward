import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function applyNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

function decodeToken(token: string): { role: string; userId: string; exp?: number } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    const validRoles = ['admin', 'coach', 'sales']
    if (!payload.role || !validRoles.includes(payload.role)) return null
    return payload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('token')

  console.log('🔍 [MIDDLEWARE] Path:', pathname)
  console.log('🍪 [MIDDLEWARE] Token exists:', !!token)
  console.log('🍪 [MIDDLEWARE] Token value:', token?.value ? token.value.substring(0, 30) + '...' : 'NONE')

  // Setup pages - clear token
  if (pathname === '/coach-setup' || pathname === '/rep-setup') {
    console.log('📝 [SETUP PAGE] Clearing token')
    const response = NextResponse.next()
    if (token) response.cookies.delete('token')
    return applyNoCacheHeaders(response)
  }

  // Protected routes
  const protectedRoutes = ['/admin', '/coach', '/sales']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    console.log('🔒 [PROTECTED ROUTE] Checking access...')
    
    if (!token?.value) {
      console.log('❌ [NO TOKEN] Redirecting to login')
      return applyNoCacheHeaders(NextResponse.redirect(new URL('/login', request.url)))
    }
    
    // Validate token
    console.log('🔐 [VALIDATING] Token...')
    const payload = decodeToken(token.value)
    
    if (!payload) {
      console.log('❌ [INVALID TOKEN] Token expired or invalid, redirecting to login')
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return applyNoCacheHeaders(response)
    }

    console.log('✅ [VALID TOKEN] User:', payload.userId, 'Role:', payload.role)
    const response = NextResponse.next()
    response.headers.set('Surrogate-Control', 'no-store')
    return applyNoCacheHeaders(response)
  }

  // Redirect logged-in users from login/signup
  if (token?.value && (pathname === '/login' || pathname === '/signup')) {
    console.log('🔄 [LOGGED IN] User on login/signup page, checking redirect...')
    const payload = decodeToken(token.value)
    
    if (!payload) {
      console.log('❌ [INVALID TOKEN] Clearing and allowing access to', pathname)
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
      console.log('🔄 [REDIRECT] To dashboard:', redirectPath)
      return applyNoCacheHeaders(NextResponse.redirect(new URL(redirectPath, request.url)))
    }
  }

  if (pathname === '/login' || pathname === '/signup') {
    console.log('🔓 [PUBLIC PAGE] Allowing access')
    return applyNoCacheHeaders(NextResponse.next())
  }

  console.log('➡️ [DEFAULT] Passing through')
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/sales/:path*', '/login', '/signup', '/coach-setup', '/rep-setup']
}
