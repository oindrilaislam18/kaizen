import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { authStore } from "./auth-store"

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "kaizen-app-secret-key"
const TOKEN_NAME = "kaizen_auth_token"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Token functions
export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("Token verification error:", error.message)
    return null
  }
}

// Cookie functions
export function setAuthCookie(res, payload) {
  const token = createToken(payload)

  res.cookies.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  })

  return token
}

export function removeAuthCookie(res) {
  res.cookies.set({
    name: TOKEN_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  })
}

// Password functions
export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

// Authentication functions
export async function authenticateUser(email, password) {
  try {
    // Try to get user from MongoDB first
    let user = null

    try {
      // Import dynamically to avoid issues if MongoDB is not available
      const { getUserByEmail } = await import("./db-auth")
      user = await getUserByEmail(email)
    } catch (error) {
      console.warn("MongoDB authentication failed, falling back to in-memory store:", error.message)
    }

    // Fall back to in-memory store if MongoDB fails
    if (!user) {
      user = authStore.getUserByEmail(email)
    }

    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    const isPasswordValid = await comparePasswords(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: "Invalid credentials" }
    }

    return {
      success: true,
      user: {
        id: user._id?.toString() || user.id,
        name: user.name,
        email: user.email,
      },
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function getUserFromToken(token) {
  try {
    const decoded = verifyToken(token)

    if (!decoded || !decoded.id) {
      return null
    }

    // Try to get user from MongoDB first
    let user = null

    try {
      // Import dynamically to avoid issues if MongoDB is not available
      const { getUserById } = await import("./db-auth")
      user = await getUserById(decoded.id)
    } catch (error) {
      console.warn("MongoDB user lookup failed, falling back to in-memory store:", error.message)
    }

    // Fall back to in-memory store if MongoDB fails
    if (!user) {
      user = authStore.getUserById(decoded.id)
    }

    if (!user) {
      return null
    }

    return {
      id: user._id?.toString() || user.id,
      name: user.name,
      email: user.email,
    }
  } catch (error) {
    console.error("Get user from token error:", error)
    return null
  }
}
