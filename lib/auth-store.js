// Simple in-memory store for authentication
// This is a fallback when MongoDB connection fails

const users = [
  {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    // Password: "password123" (hashed)
    password: "$2a$10$8KVxn4Y0.H2jVQYCTAVF7.9K1W8X5pQCZZBLYPRNUXGMQCXD5YnBC",
  },
]

const sessions = {}

export const authStore = {
  // User methods
  getUserByEmail: (email) => {
    return users.find((user) => user.email === email) || null
  },

  getUserById: (id) => {
    return users.find((user) => user.id === id) || null
  },

  createUser: (userData) => {
    const id = String(users.length + 1)
    const newUser = { id, ...userData }
    users.push(newUser)
    return newUser
  },

  // Session methods
  createSession: (userId, token) => {
    sessions[token] = userId
    return token
  },

  getSession: (token) => {
    return sessions[token] || null
  },

  deleteSession: (token) => {
    delete sessions[token]
  },
}
