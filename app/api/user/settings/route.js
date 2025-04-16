import { NextResponse } from "next/server"
import { getUserById, updateUserSettings } from "@/lib/db"

export async function GET(request) {
  try {
    // In a real app, you would get the userId from the session
    const userId = "user123"

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user.settings)
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json({ error: "Failed to fetch user settings" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // In a real app, you would get the userId from the session
    const userId = "user123"

    const body = await request.json()

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const result = await updateUserSettings(userId, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 })
  }
}
