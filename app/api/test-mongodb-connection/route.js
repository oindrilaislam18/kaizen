import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    // Test the MongoDB connection
    const client = await clientPromise

    // Try to connect and get server info
    const admin = client.db().admin()
    const serverInfo = await admin.serverInfo()

    // Try to list databases
    const dbList = await client.db().admin().listDatabases()

    return NextResponse.json({
      status: "success",
      message: "MongoDB connected successfully",
      version: serverInfo.version,
      databases: dbList.databases.map((db) => db.name),
      connectionString: process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, "mongodb+srv://$1:****@")
        : "Not found",
    })
  } catch (error) {
    console.error("MongoDB connection test failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to MongoDB",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
