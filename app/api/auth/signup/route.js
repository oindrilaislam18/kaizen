import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-utils"
import clientPromise from "@/lib/mongodb"

// Maximum number of connection retries
const MAX_RETRIES = 3
// Base timeout (will be increased with each retry)
const BASE_TIMEOUT = 5000

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

    // Implement retry logic for MongoDB operations
    let lastError = null
    let client = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`MongoDB connection attempt ${attempt} of ${MAX_RETRIES}`)

        // Increase timeout with each retry
        const timeout = BASE_TIMEOUT * attempt

        // Try to connect with timeout
        const clientPromiseWithTimeout = Promise.race([
          clientPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`MongoDB connection timeout (${timeout}ms)`)), timeout),
          ),
        ])

        client = await clientPromiseWithTimeout
        console.log("MongoDB connection successful")

        // If we get here, connection was successful
        break
      } catch (error) {
        lastError = error
        console.error(`MongoDB connection attempt ${attempt} failed:`, error.message)

        // If this is the last attempt, don't wait
        if (attempt < MAX_RETRIES) {
          // Wait before next retry (exponential backoff)
          const backoffTime = 1000 * Math.pow(2, attempt - 1)
          console.log(`Waiting ${backoffTime}ms before next attempt...`)
          await new Promise((resolve) => setTimeout(resolve, backoffTime))
        }
      }
    }

    // If all connection attempts failed
    if (!client) {
      console.error("All MongoDB connection attempts failed")
      return NextResponse.json(
        {
          success: false,
          error: "Unable to connect to database after multiple attempts",
          details: lastError?.message || "Unknown error",
        },
        { status: 500 },
      )
    }

    // Now proceed with database operations
    try {
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
      const settings = {
        theme: "system",
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          teamUpdates: true,
        },
        display: {
          compactView: false,
          showCompletedTasks: true,
        },
      }

      const result = await db.collection("users").insertOne({
        name,
        email,
        password: hashedPassword,
        settings,
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
      console.error("Database operation failed:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database operation failed",
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
