import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    // Test the MongoDB connection
    const client = await clientPromise
    const db = client.db("kaizen")

    // Try to get the collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    return NextResponse.json({
      status: "success",
      message: "MongoDB connected successfully",
      database: "kaizen",
      collections: collectionNames,
    })
  } catch (error) {
    console.error("MongoDB connection test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to MongoDB",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
