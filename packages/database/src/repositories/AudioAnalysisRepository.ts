import { AudioAnalysis, IAudioAnalysis } from "../models/AudioAnalysis";
import { BaseRepository } from "./BaseRepository";

export class AudioAnalysisRepository extends BaseRepository<IAudioAnalysis> {
  constructor() {
    super(AudioAnalysis);
  }

  async findByProjectId(projectId: string): Promise<IAudioAnalysis | null> {
    return this.model.findOne({ projectId });
  }

  async upsert(
    projectId: string,
    data: Partial<IAudioAnalysis>,
  ): Promise<IAudioAnalysis> {
    return this.model.findOneAndUpdate(
      { projectId },
      { $set: data },
      { new: true, upsert: true },
    );
  }
}

export const audioAnalysisRepository = new AudioAnalysisRepository();
