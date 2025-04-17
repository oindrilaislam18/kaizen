import { NextResponse } from "next/server"
import { getUserById, updateUserSettings } from "@/lib/db"
import { getAuthenticatedUser } from "@/lib/auth-helpers"

export async function GET(request) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const userDetails = await getUserById(userId)
    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userDetails.settings)
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json({ error: "Failed to fetch user settings" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const body = await request.json()

    const userDetails = await getUserById(userId)
    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const result = await updateUserSettings(userId, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 })
  }
}
