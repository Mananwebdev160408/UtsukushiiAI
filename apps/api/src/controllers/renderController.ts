import { Request, Response, NextFunction } from "express";
import { renderService } from "../services";

export const startRender = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const job = await renderService.startRender(
      req.user!.userId,
      req.body.projectId,
      req.body.settings,
    );
    res.status(202).json({ status: "success", data: { job } });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const job = await renderService.getRenderStatus(
      req.user!.userId,
      req.params.jobId as string,
    );
    res.status(200).json({ status: "success", data: { job } });
  } catch (error) {
    next(error);
  }
};

export const listJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { limit, offset } = req.query;
    const jobs = await renderService.listRenderJobs(req.user!.userId, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.status(200).json({ status: "success", data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const cancel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await renderService.cancelRender(
      req.user!.userId,
      req.params.jobId as string,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
