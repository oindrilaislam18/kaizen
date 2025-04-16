import { NextResponse } from "next/server"
import { getTeams, createTeam } from "@/lib/db"

export async function GET(request) {
  try {
    // In a real app, you would get the userId from the session
    const userId = "user123"

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

    // In a real app, you would get the userId from the session
    const userId = "user123"

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
