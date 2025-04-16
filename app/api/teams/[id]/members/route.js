import { NextResponse } from "next/server"
import { getTeamById, addTeamMember, removeTeamMember } from "@/lib/db"

export async function POST(request, { params }) {
  try {
    const teamId = params.id
    const body = await request.json()

    // Check if team exists
    const existingTeam = await getTeamById(teamId)
    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const result = await addTeamMember(teamId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const teamId = params.id
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    // Check if team exists
    const existingTeam = await getTeamById(teamId)
    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const result = await removeTeamMember(teamId, memberId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error removing team member:", error)
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 })
  }
}
