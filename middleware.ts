import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

// Add paths that should be protected by authentication
const protectedPaths = [
  '/api/users',
  '/api/roles',
  '/api/permissions'
]

// Add paths that should be accessible without authentication
const publicPaths = [
  '/api/auth/login',
  '/api/auth/logout'
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Skip middleware for public paths
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // Check if path should be protected
  if (protectedPaths.some(p => path.startsWith(p))) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    try {
      // Verify JWT token
      verify(token, process.env.JWT_SECRET || 'your-secret-key')
      return NextResponse.next()
    } catch (error) {
        console.error("Invalid Token: ", (error as Error).message)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
} 