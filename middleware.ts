import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/events", "/api/auth"]
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith("/events/") || pathname.startsWith("/api/auth/")
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  const userRole = token.role as string

  // Organizer-only routes
  if (pathname.startsWith("/organizer") && userRole !== "ORGANIZER" && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
