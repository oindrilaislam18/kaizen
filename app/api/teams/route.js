import { NextResponse } from "next/server"
import { getTeams, createTeam } from "@/lib/db"
import { getAuthenticatedUser } from "@/lib/auth-helpers"

export async function GET(request) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const teams = await getTeams(userId)
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const team = {
      name: body.name,
      description: body.description,
      ownerId: userId,
      members: body.members || [],
    }

    const result = await createTeam(team)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
