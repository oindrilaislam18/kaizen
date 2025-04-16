import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  // Get all cookies
  const cookies = request.cookies.getAll()

  // Get the auth token
  const authToken = request.cookies.get("kaizen_auth_token")?.value

  // Verify the token
  const decodedToken = authToken ? verifyToken(authToken) : null

  return NextResponse.json({
    cookies: cookies.map((c) => ({ name: c.name, value: c.value.substring(0, 10) + "..." })),
    hasAuthToken: !!authToken,
    tokenValid: !!decodedToken,
    decodedToken: decodedToken
      ? {
          id: decodedToken.id,
          email: decodedToken.email,
          name: decodedToken.name,
          exp: new Date(decodedToken.exp * 1000).toISOString(),
        }
      : null,
  })
}
