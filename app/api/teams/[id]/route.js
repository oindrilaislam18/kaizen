import { NextResponse } from "next/server"
import { getTeamById, updateTeam, deleteTeam } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const id = params.id
    const team = await getTeamById(id)

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()

    // Check if team exists
    const existingTeam = await getTeamById(id)
    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Update team
    const updatedTeam = {
      name: body.name,
      description: body.description,
      members: body.members,
    }

    const result = await updateTeam(id, updatedTeam)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id

    // Check if team exists
    const existingTeam = await getTeamById(id)
    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    await deleteTeam(id)
    return NextResponse.json({ message: "Team deleted successfully" })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
  }
}
