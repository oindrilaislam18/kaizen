import { ObjectId } from "mongodb"

export class User {
  constructor(data) {
    this._id = data._id || new ObjectId().toString()
    this.name = data.name || ""
    this.email = data.email || ""
    this.password = data.password || ""
    this.avatar = data.avatar || null
    this.role = data.role || "user"
    this.settings = data.settings || {
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
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}
