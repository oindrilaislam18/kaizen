import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get("kaizen_auth_token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    // Get user from token
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
