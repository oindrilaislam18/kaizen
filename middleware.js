import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// List of paths that require authentication
const protectedPaths = [
  "/dashboard",
  "/dashboard/tasks",
  "/dashboard/team",
  "/dashboard/calendar",
  "/dashboard/analytics",
  "/dashboard/settings",
  "/dashboard/profile",
]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isProtectedPath) {
    const token = await getToken({
      req: request,
      secret: process.env.JWT_SECRET || "kaizen-app-secret-key",
    })

    // If not authenticated, redirect to login
    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
