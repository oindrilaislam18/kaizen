import { NextResponse } from "next/server"
import { authenticateUser, setAuthCookie } from "@/lib/auth"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const result = await authenticateUser(email, password)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      user: result.user,
    })

    // Set auth cookie
    setAuthCookie(response, {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
