import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/types/user'

/**
 * Decode JWT payload without verifying signature.
 * Signature verification is the backend's responsibility.
 */
function decodeJwtPayload(token: string): { role?: UserRole } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    // Base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonStr = atob(base64)
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

/** Routes that buyers can access */
const BUYER_ROUTES = [
  '/explore',
  '/laundry',
  '/order',
  '/my-orders',
  '/profile',
]

/** Check if a pathname matches buyer routes */
function isBuyerRoute(pathname: string): boolean {
  return BUYER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

/** Check if a pathname matches seller routes */
function isSellerRoute(pathname: string): boolean {
  return pathname === '/seller' || pathname.startsWith('/seller/')
}

/** Check if a pathname matches driver routes */
function isDriverRoute(pathname: string): boolean {
  return pathname === '/driver' || pathname.startsWith('/driver/')
}

/** Get the default dashboard URL for a given role */
function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case 'buyer':
      return '/explore'
    case 'seller':
      return '/seller/dashboard'
    case 'driver':
      return '/driver/dashboard'
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // DEV BYPASS: skip auth when NEXT_PUBLIC_BYPASS_AUTH=true
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
    return NextResponse.next()
  }

  // Read JWT token from cookie
  const token = request.cookies.get('auth-token')?.value

  // If no token or can't decode → redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const payload = decodeJwtPayload(token)

  if (!payload || !payload.role) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const { role } = payload

  // Role-based access control
  switch (role) {
    case 'buyer':
      // Buyers cannot access seller or driver routes
      if (isSellerRoute(pathname) || isDriverRoute(pathname)) {
        const redirectUrl = new URL('/explore', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      break

    case 'seller':
      // Sellers cannot access driver routes or buyer routes
      if (isDriverRoute(pathname) || isBuyerRoute(pathname)) {
        const redirectUrl = new URL('/seller/dashboard', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      break

    case 'driver':
      // Drivers cannot access seller routes or buyer routes
      if (isSellerRoute(pathname) || isBuyerRoute(pathname)) {
        const redirectUrl = new URL('/driver/dashboard', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      break

    default: {
      // Unknown role → redirect to login
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow the request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/explore/:path*',
    '/laundry/:path*',
    '/order/:path*',
    '/my-orders/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/seller/:path*',
    '/driver/:path*',
  ],
}
