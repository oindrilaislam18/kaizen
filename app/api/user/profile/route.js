import { NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/db"
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

    // Don't return the password
    const { password, ...userWithoutPassword } = userDetails

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
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
