import { ObjectId } from "mongodb"

export class Task {
  constructor(data) {
    this._id = data._id || new ObjectId().toString()
    this.userId = data.userId || ""
    this.title = data.title || ""
    this.description = data.description || ""
    this.dueDate = data.dueDate || null
    this.priority = data.priority || "medium"
    this.category = data.category || "Uncategorized"
    this.status = data.status || "todo"
    this.assignee = data.assignee || null
    this.teamId = data.teamId || null
    this.isTeamTask = !!data.teamId
    this.attachments = data.attachments || []
    this.comments = data.comments || []
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}
