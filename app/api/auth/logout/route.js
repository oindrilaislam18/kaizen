import { NextResponse } from "next/server"
import { removeAuthCookie } from "@/lib/auth"

export async function POST() {
  try {
    const response = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL))
    removeAuthCookie(response)
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
