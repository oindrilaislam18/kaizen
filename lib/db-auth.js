import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

// Get the database connection
export async function getDatabase() {
  const client = await clientPromise
  return client.db("kaizen")
}

// User authentication functions
export async function getUserByEmail(email) {
  try {
    const db = await getDatabase()
    const user = await db.collection("users").findOne({ email })
    return user
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

export async function getUserById(id) {
  try {
    const db = await getDatabase()
    const user = await db.collection("users").findOne({
      _id: typeof id === "string" ? new ObjectId(id) : id,
    })
    return user
  } catch (error) {
    console.error("Error getting user by ID:", error)
    throw error
  }
}

export async function createUser(userData) {
  try {
    const db = await getDatabase()
    const result = await db.collection("users").insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      _id: result.insertedId,
      ...userData,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(id, userData) {
  try {
    const db = await getDatabase()
    const result = await db.collection("users").updateOne(
      { _id: typeof id === "string" ? new ObjectId(id) : id },
      {
        $set: {
          ...userData,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}
