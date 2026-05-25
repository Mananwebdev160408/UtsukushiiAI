import path from "path";
import { config } from "../config";
import { projectService } from "./projectService";
import { panelService } from "./panelService";
import { renderJobRepository } from "../repositories/renderJobRepository";
import { generateId } from "../utils";
import { AppError } from "../errors";
import { emitToUser } from "../services/websocketService";

export class DetectService {
  private resolveWorkerInputPath(fileUrl: string): string {
    if (!fileUrl) throw new AppError("Missing file path for detect request", 422, "MISSING_DETECT_INPUT");
    if (fileUrl.startsWith("/uploads/")) {
      const relativePath = fileUrl.replace(/^\/uploads\//, "");
      return path.join(config.storage.path, relativePath);
    }
    return fileUrl;
  }

  async startDetect(userId: string, projectId: string, opts: any) {
    const project = await projectService.getProject(userId, projectId);

    const chapters = Array.isArray(project.mangaChapters) ? project.mangaChapters : [];
    const latestChapter = chapters[chapters.length - 1];
    if (!latestChapter?.fileUrl) {
      throw new AppError("Project must include at least one manga chapter before detection", 422, "MISSING_MANGA");
    }

    // Create a lightweight job record so frontend can poll if desired
    const job = await renderJobRepository.create({
      _id: generateId("rnd"),
      userId,
      projectId,
      status: "queued",
      progress: 0,
      type: "detect",
    });

    // Dispatch to worker
    const workerPayload = {
      project_id: job._id.toString(),
      manga_path: this.resolveWorkerInputPath(latestChapter.fileUrl),
      options: opts || {},
    };

    const response = await fetch(`${config.mlWorker.url}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workerPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      await renderJobRepository.update(job._id.toString(), {
        status: "failed",
        error: { code: "WORKER_DETECT_FAILED", message: errorText || response.statusText },
      });
      // Emit failure to user via websocket
      try { emitToUser(userId, 'render:job:update', { jobId: job._id.toString(), status: 'failed', error: errorText || response.statusText }); } catch (e) {}
      throw new AppError(`Worker rejected detect job: ${errorText || response.statusText}`, 502, "WORKER_DETECT_FAILED");
    }

    // Read worker response to obtain detections (if worker returns them)
    const body = await response.json().catch(() => null);

    await renderJobRepository.updateStatus(job._id.toString(), "processing", 1);
    try { emitToUser(userId, 'render:job:update', { jobId: job._id.toString(), status: 'processing', progress: 1 }); } catch (e) {}

    const detections = body && (body as any).detections ? (body as any).detections : [];

    const createdPanels: any[] = [];
    if (detections.length > 0) {
      // Determine pageIndex (use latest chapter index)
      const pageIndex = Math.max(0, chapters.length - 1);

      // Persist each detection as a Panel
      for (let i = 0; i < detections.length; i++) {
        const d = detections[i];
        const bbox = d.bbox || d.box || null;
        if (!bbox) continue;

        const payload = {
          pageIndex,
          order: i,
          bbox: {
            x: Number(bbox.x),
            y: Number(bbox.y),
            width: Number(bbox.width),
            height: Number(bbox.height),
          },
        };

        try {
          const created = await panelService.createPanel(userId, projectId, payload);
          createdPanels.push(created);
          // Emit per-panel create progress
          try { emitToUser(userId, 'render:panel:created', { jobId: job._id.toString(), panelId: created._id || created.id || created }); } catch (e) {}
        } catch (err) {
          // Log but continue
          console.warn('Failed to create panel from detection', err);
        }
      }
    }

    // Mark job completed
    await renderJobRepository.updateStatus(job._id.toString(), "completed", 100);
    try { emitToUser(userId, 'render:job:update', { jobId: job._id.toString(), status: 'completed', progress: 100, panels: createdPanels.length }); } catch (e) {}

    return { job, panels: createdPanels };
  }
}

export const detectService = new DetectService();
