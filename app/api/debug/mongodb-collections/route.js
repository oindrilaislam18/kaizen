import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("kaizen")

    // Get collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Get users (with sensitive data removed)
    const users = await db.collection("users").find({}).toArray()
    const safeUsers = users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      // Exclude password and other sensitive fields
    }))

    return NextResponse.json({
      status: "success",
      collections: collectionNames,
      users: safeUsers,
    })
  } catch (error) {
    console.error("MongoDB collections debug failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to get MongoDB collections",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
