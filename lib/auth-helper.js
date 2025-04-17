import { getToken } from "next-auth/jwt"

// Helper function to get the authenticated user from the request
export async function getAuthenticatedUser(req) {
  try {
    const token = await getToken({
      req,
      secret: process.env.JWT_SECRET || "kaizen-app-secret-key",
    })

    if (!token) {
      return null
    }

    return {
      id: token.id,
      name: token.name,
      email: token.email,
    }
  } catch (error) {
    console.error("Error getting authenticated user:", error)
    return null
  }
}
