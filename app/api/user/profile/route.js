import { NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/db"

export async function GET(request) {
  try {
    // In a real app, you would get the userId from the session
    const userId = "user123"

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
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

    // Don't update the password through this endpoint
    const { password, ...updateData } = body

    const result = await updateUser(userId, updateData)

    // Don't return the password
    const { password: _, ...resultWithoutPassword } = result

    return NextResponse.json(resultWithoutPassword)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
