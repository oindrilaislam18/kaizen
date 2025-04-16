import { ObjectId } from "mongodb"

export class Team {
  constructor(data) {
    this._id = data._id || new ObjectId().toString()
    this.name = data.name || ""
    this.description = data.description || ""
    this.ownerId = data.ownerId || ""
    this.members = data.members || []
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}
