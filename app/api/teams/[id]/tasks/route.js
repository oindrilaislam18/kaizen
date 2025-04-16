import { NextResponse } from "next/server"
import { getTeamTasks, createTeamTask } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const teamId = params.id
    const tasks = await getTeamTasks(teamId)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching team tasks:", error)
    return NextResponse.json({ error: "Failed to fetch team tasks" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const teamId = params.id
    const body = await request.json()

    // In a real app, you would get the userId from the session
    const userId = "user123"

    const task = {
      userId,
      teamId,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      priority: body.priority,
      category: body.category,
      status: body.status || "todo",
      assignee: body.assignee,
    }

    const result = await createTeamTask(task)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating team task:", error)
    return NextResponse.json({ error: "Failed to create team task" }, { status: 500 })
  }
}
