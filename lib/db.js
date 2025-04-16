import clientPromise from "./mongodb"
import { User } from "./models/user"
import { Task } from "./models/task"
import { Team } from "./models/team"

// Helper function to get database connection
export async function getDatabase() {
  const client = await clientPromise
  return client.db("kaizen")
}

// Tasks collection helpers
export async function getTasks(userId) {
  const db = await getDatabase()
  const tasks = await db.collection("tasks").find({ userId, teamId: null }).sort({ createdAt: -1 }).toArray()
  return tasks.map((task) => new Task(task))
}

export async function getTaskById(id) {
  const db = await getDatabase()
  const task = await db.collection("tasks").findOne({ _id: id })
  return task ? new Task(task) : null
}

export async function createTask(taskData) {
  const db = await getDatabase()
  const task = new Task(taskData)
  await db.collection("tasks").insertOne(task)
  return task
}

export async function updateTask(id, taskData) {
  const db = await getDatabase()
  const updatedTask = { ...taskData, updatedAt: new Date() }
  await db.collection("tasks").updateOne({ _id: id }, { $set: updatedTask })
  return { _id: id, ...updatedTask }
}

export async function deleteTask(id) {
  const db = await getDatabase()
  await db.collection("tasks").deleteOne({ _id: id })
  return { _id: id }
}

// Team tasks collection helpers
export async function getTeamTasks(teamId) {
  const db = await getDatabase()
  const tasks = await db.collection("tasks").find({ teamId }).sort({ createdAt: -1 }).toArray()
  return tasks.map((task) => new Task(task))
}

export async function getAssignedTasks(userId) {
  const db = await getDatabase()
  const tasks = await db
    .collection("tasks")
    .find({
      $or: [{ "assignee.id": userId }, { assignee: userId }],
    })
    .sort({ createdAt: -1 })
    .toArray()
  return tasks.map((task) => new Task(task))
}

export async function createTeamTask(taskData) {
  const db = await getDatabase()
  const task = new Task({ ...taskData, isTeamTask: true })
  await db.collection("tasks").insertOne(task)
  return task
}

// Teams collection helpers
export async function getTeams(userId) {
  const db = await getDatabase()
  const teams = await db
    .collection("teams")
    .find({
      $or: [{ ownerId: userId }, { "members.id": userId }],
    })
    .sort({ createdAt: -1 })
    .toArray()
  return teams.map((team) => new Team(team))
}

export async function getTeamById(id) {
  const db = await getDatabase()
  const team = await db.collection("teams").findOne({ _id: id })
  return team ? new Team(team) : null
}

export async function createTeam(teamData) {
  const db = await getDatabase()
  const team = new Team(teamData)
  await db.collection("teams").insertOne(team)
  return team
}

export async function updateTeam(id, teamData) {
  const db = await getDatabase()
  const updatedTeam = { ...teamData, updatedAt: new Date() }
  await db.collection("teams").updateOne({ _id: id }, { $set: updatedTeam })
  return { _id: id, ...updatedTeam }
}

export async function deleteTeam(id) {
  const db = await getDatabase()
  await db.collection("teams").deleteOne({ _id: id })
  // Also delete all tasks associated with this team
  await db.collection("tasks").deleteMany({ teamId: id })
  return { _id: id }
}

export async function addTeamMember(teamId, member) {
  const db = await getDatabase()
  await db.collection("teams").updateOne(
    { _id: teamId },
    {
      $push: { members: member },
      $set: { updatedAt: new Date() },
    },
  )
  return { teamId, member }
}

export async function removeTeamMember(teamId, memberId) {
  const db = await getDatabase()
  await db.collection("teams").updateOne(
    { _id: teamId },
    {
      $pull: { members: { id: memberId } },
      $set: { updatedAt: new Date() },
    },
  )
  return { teamId, memberId }
}

// Users collection helpers
export async function getUserByEmail(email) {
  const db = await getDatabase()
  const user = await db.collection("users").findOne({ email })
  return user ? new User(user) : null
}

export async function getUserById(id) {
  const db = await getDatabase()
  const user = await db.collection("users").findOne({ _id: id })
  return user ? new User(user) : null
}

export async function createUser(userData) {
  const db = await getDatabase()
  const user = new User(userData)
  await db.collection("users").insertOne(user)
  return user
}

export async function updateUser(id, userData) {
  const db = await getDatabase()
  const updatedUser = { ...userData, updatedAt: new Date() }
  await db.collection("users").updateOne({ _id: id }, { $set: updatedUser })
  return { _id: id, ...updatedUser }
}

export async function updateUserSettings(id, settings) {
  const db = await getDatabase()
  await db.collection("users").updateOne(
    { _id: id },
    {
      $set: {
        settings,
        updatedAt: new Date(),
      },
    },
  )
  return { _id: id, settings }
}

// Analytics helpers
export async function getTaskStats(userId) {
  const db = await getDatabase()

  // Get total tasks count
  const totalTasks = await db.collection("tasks").countDocuments({ userId })

  // Get tasks by status
  const tasksByStatus = await db
    .collection("tasks")
    .aggregate([{ $match: { userId } }, { $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray()

  // Get tasks by priority
  const tasksByPriority = await db
    .collection("tasks")
    .aggregate([{ $match: { userId } }, { $group: { _id: "$priority", count: { $sum: 1 } } }])
    .toArray()

  // Get tasks by category
  const tasksByCategory = await db
    .collection("tasks")
    .aggregate([{ $match: { userId } }, { $group: { _id: "$category", count: { $sum: 1 } } }])
    .toArray()

  // Get tasks created per day (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const tasksCreatedPerDay = await db
    .collection("tasks")
    .aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray()

  // Get tasks completed per day (last 7 days)
  const tasksCompletedPerDay = await db
    .collection("tasks")
    .aggregate([
      {
        $match: {
          userId,
          status: "completed",
          updatedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray()

  return {
    totalTasks,
    tasksByStatus: tasksByStatus.map((item) => ({ name: item._id, value: item.count })),
    tasksByPriority: tasksByPriority.map((item) => ({ name: item._id, value: item.count })),
    tasksByCategory: tasksByCategory.map((item) => ({ name: item._id, value: item.count })),
    tasksCreatedPerDay: tasksCreatedPerDay.map((item) => ({ name: item._id, value: item.count })),
    tasksCompletedPerDay: tasksCompletedPerDay.map((item) => ({ name: item._id, value: item.count })),
  }
}
