import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-utils"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    console.log("Signup attempt:", { name, email, passwordLength: password?.length })

    if (!name || !email || !password) {
      console.log("Missing required fields:", { name: !!name, email: !!email, password: !!password })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      // Get MongoDB client
      const client = await clientPromise
      const db = client.db("kaizen")

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({ email })

      if (existingUser) {
        console.log("User already exists:", email)
        return NextResponse.json({ error: "User already exists" }, { status: 400 })
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
          id: result.insertedId.toString(),
          name,
          email,
        },
        { status: 201 },
      )
    } catch (dbError) {
      console.error("Database operation failed:", dbError)
      return NextResponse.json({ error: "Database operation failed", details: dbError.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to create user", details: error.message }, { status: 500 })
  }
}
