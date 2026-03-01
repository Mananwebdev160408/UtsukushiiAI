import { Project, IProject } from "../models/Project";
import { BaseRepository } from "./BaseRepository";

export class ProjectRepository extends BaseRepository<IProject> {
  constructor() {
    super(Project);
  }

  async findByUserId(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<IProject[]> {
    return this.model
      .find({ userId })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.model.countDocuments({ userId });
  }

  async searchByTitle(userId: string, query: string): Promise<IProject[]> {
    return this.model.find({
      userId,
      title: { $regex: query, $options: "i" },
    });
  }
}

export const projectRepository = new ProjectRepository();
