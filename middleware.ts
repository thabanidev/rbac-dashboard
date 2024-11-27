import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  // If there's no token and we're not on the login page, redirect to login
  if (!token && !request.nextUrl.pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    if (token) {
      // Verify the token using jose instead of jsonwebtoken
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || '1234'
      )
      
      await jwtVerify(token, secret)
    }
  } catch (error) {
    console.error('Token verification failed:', (error as Error).message)
    // If token verification fails, clear the cookie and redirect to login
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

