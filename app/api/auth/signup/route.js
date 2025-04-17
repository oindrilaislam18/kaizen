import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-utils"
import clientPromise from "@/lib/mongodb"

// Update the MongoDB timeout to be longer
const MONGODB_TIMEOUT = 15000 // 15 seconds

export async function POST(request) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 },
      )
    }

    const { name, email, password } = body

    console.log("Signup attempt:", { name, email, passwordLength: password?.length })

    if (!name || !email || !password) {
      console.log("Missing required fields:", { name: !!name, email: !!email, password: !!password })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Get MongoDB client with timeout and retry
    let client
    try {
      // Try to connect with timeout
      const clientPromiseWithTimeout = Promise.race([
        clientPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("MongoDB connection timeout")), MONGODB_TIMEOUT)),
      ])

      client = await clientPromiseWithTimeout
      const db = client.db("kaizen")

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({ email })

      if (existingUser) {
        console.log("User already exists:", email)
        return NextResponse.json(
          {
            success: false,
            error: "User already exists",
          },
          { status: 400 },
        )
      }

      // Hash password
      const hashedPassword = await hashPassword(password)
      console.log("Password hashed successfully")

      // Create user
      const result = await db.collection("users").insertOne({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log("User created successfully:", result.insertedId)

      // Return success response (without password)
      return NextResponse.json(
        {
          success: true,
          user: {
            id: result.insertedId.toString(),
            name,
            email,
          },
        },
        { status: 201 },
      )
    } catch (dbError) {
      console.error("Database connection failed:", dbError)

      // Provide more specific error messages based on the error type
      let errorMessage = "Database operation failed"
      if (dbError.message.includes("timeout")) {
        errorMessage = "Database connection timed out. Please try again later."
      } else if (dbError.name === "MongoNetworkError") {
        errorMessage = "Database network error. Please check your connection."
      } else if (dbError.name === "MongoServerSelectionError") {
        errorMessage = "Unable to connect to database server. Please try again later."
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: dbError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
