import bcrypt from "bcryptjs"

// Password functions
export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}
