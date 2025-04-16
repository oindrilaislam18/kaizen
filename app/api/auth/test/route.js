import { NextResponse } from "next/server"

export async function GET(request) {
  // Get the token from cookies
  const token = request.cookies.get("kaizen_auth_token")?.value

  return NextResponse.json({
    message: "Auth test endpoint",
    hasToken: !!token,
    token: token ? token.substring(0, 10) + "..." : null,
    cookies: Object.fromEntries(
      Array.from(request.cookies.getAll()).map((cookie) => [cookie.name, cookie.value.substring(0, 5) + "..."]),
    ),
  })
}
