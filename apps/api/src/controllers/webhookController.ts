import { NextFunction, Request, Response } from "express";
import { projectRepository, renderJobRepository } from "../repositories";
import { emitToUser } from "../services/websocketService";
import { logger } from "../utils/logger";

type WorkerRenderWebhookPayload = {
  project_id: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress?: number;
  output_url?: string;
  duration?: number;
  file_size?: number;
  error?: string;
};

export const handleRenderWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body as WorkerRenderWebhookPayload;
    const jobId = payload?.project_id || (req.body as any)?.job_id;

    if (!jobId) {
      return res
        .status(400)
        .json({ status: "error", message: "project_id or job_id is required" });
    }

    const job = await renderJobRepository.findById(jobId);
    if (!job) {
      logger.warn(`Webhook received for unknown job id: ${jobId}`);
      return res.status(202).json({ status: "accepted", message: "Unknown job" });
    }

    const updateData: any = {
      status: payload.status,
    };

    if (typeof payload.progress === "number") {
      updateData.progress = payload.progress;
    }
    if (payload.output_url) {
      updateData.outputUrl = payload.output_url;
    }
    if (typeof payload.duration === "number") {
      updateData.duration = payload.duration;
    }
    if (typeof payload.file_size === "number") {
      updateData.fileSize = payload.file_size;
    }
    if (payload.error) {
      updateData.error = {
        code: "WORKER_ERROR",
        message: payload.error,
      };
    }

    await renderJobRepository.update(jobId, updateData);

    // Emit socket events to the job owner so frontend can react in real-time
    try {
      const userId = (job as any).userId as string | undefined;
      if (userId) {
        const basePayload = { jobId, projectId: job.projectId, status: payload.status };

        if (payload.status === "queued" || payload.status === "processing") {
          emitToUser(userId, "render:progress", { ...basePayload, progress: payload.progress });
        } else if (payload.status === "completed") {
          emitToUser(userId, "render:complete", {
            ...basePayload,
            // Provide both legacy and frontend-friendly fields
            outputUrl: updateData.outputUrl,
            resultUrl: updateData.outputUrl,
            duration: updateData.duration,
            durationSeconds: updateData.duration,
            fileSize: updateData.fileSize,
            fileSizeBytes: updateData.fileSize,
          });
        } else if (payload.status === "failed") {
          emitToUser(userId, "render:error", { ...basePayload, error: updateData.error });
        } else if (payload.status === "cancelled") {
          emitToUser(userId, "render:cancelled", basePayload);
        }
      }
    } catch (emitErr) {
      logger.warn(`Failed to emit websocket event for job ${jobId}: ${emitErr}`);
    }

    if (payload.status === "completed") {
      await projectRepository.update(job.projectId, { status: "ready" });
    } else if (payload.status === "failed") {
      await projectRepository.update(job.projectId, { status: "error" });
    } else if (payload.status === "queued" || payload.status === "processing") {
      await projectRepository.update(job.projectId, { status: "processing" });
    } else if (payload.status === "cancelled") {
      await projectRepository.update(job.projectId, { status: "draft" });
    }

    return res.status(200).json({ status: "success" });
  } catch (error) {
    next(error);
  }
};
