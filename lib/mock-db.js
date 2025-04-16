// In-memory user store
const users = [
  {
    _id: "user1",
    name: "Test User",
    email: "test@example.com",
    // Password: "password123"
    password: "$2a$10$8KVxn4Y0.H2jVQYCTAVF7.9K1W8X5pQCZZBLYPRNUXGMQCXD5YnBC",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "user2",
    name: "Gmail Test User",
    email: "test@gmail.com",
    // Password: "password123"
    password: "$2a$10$8KVxn4Y0.H2jVQYCTAVF7.9K1W8X5pQCZZBLYPRNUXGMQCXD5YnBC",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// In-memory task store
const tasks = [
  {
    _id: "task1",
    userId: "user1",
    title: "Complete project",
    description: "Finish the Kaizen project",
    dueDate: "2023-12-31",
    priority: "high",
    category: "Work",
    status: "in-progress",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// User functions
export async function getUserByEmail(email) {
  return users.find((user) => user.email === email) || null
}

export async function getUserById(id) {
  return users.find((user) => user._id === id) || null
}

export async function createUser(userData) {
  const newUser = {
    _id: `user${users.length + 1}`,
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  users.push(newUser)
  return newUser
}

// Task functions
export async function getTasks(userId) {
  return tasks.filter((task) => task.userId === userId)
}

export async function getTaskById(id) {
  return tasks.find((task) => task._id === id) || null
}

export async function createTask(taskData) {
  const newTask = {
    _id: `task${tasks.length + 1}`,
    ...taskData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  tasks.push(newTask)
  return newTask
}

export async function updateTask(id, taskData) {
  const index = tasks.findIndex((task) => task._id === id)
  if (index === -1) return null

  tasks[index] = {
    ...tasks[index],
    ...taskData,
    updatedAt: new Date(),
  }

  return tasks[index]
}

export async function deleteTask(id) {
  const index = tasks.findIndex((task) => task._id === id)
  if (index === -1) return null

  const deletedTask = tasks[index]
  tasks.splice(index, 1)

  return deletedTask
}
