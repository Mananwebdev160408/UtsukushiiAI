import { Request, Response, NextFunction } from "express";
import { projectService } from "../services";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = await projectService.createProject(
      req.user!.userId,
      req.body,
    );
    res.status(201).json({ status: "success", data: { project } });
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset, search } = req.query;
    const result = await projectService.listProjects(req.user!.userId, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      search: search as string,
    });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = await projectService.getProject(
      req.user!.userId,
      req.params.id as string,
    );
    res.status(200).json({ status: "success", data: { project } });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = await projectService.updateProject(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );
    res.status(200).json({ status: "success", data: { project } });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await projectService.deleteProject(
      req.user!.userId,
      req.params.id as string,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
