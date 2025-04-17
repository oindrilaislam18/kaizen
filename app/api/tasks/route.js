import { NextResponse } from "next/server"
import { getTasks, createTask } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getAuthenticatedUser } from "@/lib/auth-helpers"

// Get all tasks for a user
export async function GET(request) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const tasks = await getTasks(userId)
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// Update the POST function with better error handling
export async function POST(request) {
  try {
    const body = await request.json()
    console.log("Creating task with data:", body)

    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const task = {
      _id: new ObjectId().toString(),
      userId,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      priority: body.priority,
      category: body.category,
      status: body.status || "todo",
      assignee: body.assignee,
    }

    console.log("Formatted task object:", task)
    const result = await createTask(task)
    console.log("Task created successfully:", result)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 })
  }
}
