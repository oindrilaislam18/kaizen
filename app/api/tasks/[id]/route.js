import { NextResponse } from "next/server"
import { getTaskById, updateTask, deleteTask } from "@/lib/db"

// Get a specific task
export async function GET(request, { params }) {
  try {
    const id = params.id
    const task = await getTaskById(id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

// Update a task
export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()

    // Check if task exists
    const existingTask = await getTaskById(id)
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Update task
    const updatedTask = {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      priority: body.priority,
      category: body.category,
      status: body.status,
      assignee: body.assignee,
    }

    await updateTask(id, updatedTask)

    return NextResponse.json({ ...existingTask, ...updatedTask })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// Delete a task
export async function DELETE(request, { params }) {
  try {
    const id = params.id

    // Check if task exists
    const existingTask = await getTaskById(id)
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await deleteTask(id)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
