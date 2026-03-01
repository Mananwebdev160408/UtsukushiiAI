import { renderJobRepository } from "../repositories/renderJobRepository";
import { projectService } from "./projectService";
import { NotFoundError } from "../errors";
import { logger } from "../utils/logger";

export class RenderService {
  async startRender(userId: string, projectId: string, settings: any) {
    const project = await projectService.getProject(userId, projectId);

    // Create job record
    const job = await renderJobRepository.create({
      userId,
      projectId,
      settings: settings || project.settings,
      status: "pending",
      progress: 0,
    });

    // Dispatch to worker
    await this.dispatchJob(job);

    return job;
  }

  private async dispatchJob(job: any) {
    // This is where we would push to Redis/BullMQ
    // For now, we simulate the worker pickup
    logger.info(`Dispatching job ${job._id} to worker queue...`);
    this.mockProcessJob(job._id);
  }

  async getRenderStatus(userId: string, jobId: string) {
    const job = await renderJobRepository.findById(jobId);
    if (!job) throw new NotFoundError("RenderJob", jobId);
    if (job.userId !== userId) throw new Error("Forbidden"); // simplified for now
    return job;
  }

  async listRenderJobs(
    userId: string,
    query: { limit?: number; offset?: number },
  ) {
    return renderJobRepository.findByUserId(userId, query.limit, query.offset);
  }

  async cancelRender(userId: string, jobId: string) {
    const job = await this.getRenderStatus(userId, jobId);
    if (job.status === "completed" || job.status === "failed") {
      throw new Error("Cannot cancel a finished job");
    }
    return renderJobRepository.updateStatus(jobId, "cancelled");
  }

  private async mockProcessJob(jobId: string) {
    // This would typically be handled by a worker
    setTimeout(async () => {
      await renderJobRepository.updateStatus(jobId, "processing", 10);
    }, 1000);
  }
}

export const renderService = new RenderService();
