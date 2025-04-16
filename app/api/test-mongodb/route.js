import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    // Test the MongoDB connection
    const client = await clientPromise

    // Get server info
    const serverInfo = await client.db().admin().serverInfo()

    return NextResponse.json({
      status: "success",
      message: "MongoDB connected successfully",
      version: serverInfo.version,
      connection: {
        host: client.options.hosts?.[0] || "unknown",
        readPreference: client.readPreference?.mode || "unknown",
      },
      // Don't include sensitive information like username/password
    })
  } catch (error) {
    console.error("MongoDB connection test failed:", error)

    // Provide a helpful error message based on the error type
    let errorMessage = "Failed to connect to MongoDB"
    let errorDetails = null

    if (error.name === "MongoServerError") {
      if (error.code === 8000 && error.codeName === "AtlasError") {
        errorMessage = "MongoDB Atlas authentication failed"
        errorDetails = "Your username or password in the connection string is incorrect"
      } else if (error.code === 18) {
        errorMessage = "MongoDB authentication failed"
        errorDetails = "Invalid username or password"
      } else if (error.code === 13) {
        errorMessage = "MongoDB authorization failed"
        errorDetails = "The user does not have permission to access the database"
      }
    } else if (error.name === "MongoNetworkError") {
      errorMessage = "MongoDB network error"
      errorDetails = "Could not connect to the MongoDB server. Check your network or connection string."
    }

    return NextResponse.json(
      {
        status: "error",
        message: errorMessage,
        details: errorDetails,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
