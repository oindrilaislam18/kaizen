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

// List of API paths that require authentication
const protectedApiPaths = ["/api/tasks", "/api/teams", "/api/user", "/api/analytics"]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if the path is a protected page
  const isProtectedPage = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Check if the path is a protected API route
  const isProtectedApi = protectedApiPaths.some((path) => pathname.startsWith(path))

  if (isProtectedPage || isProtectedApi) {
    const token = await getToken({
      req: request,
      secret: process.env.JWT_SECRET || "kaizen-app-secret-key",
    })

    // If not authenticated
    if (!token) {
      // For API routes, return 401 Unauthorized
      if (isProtectedApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // For pages, redirect to login
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
