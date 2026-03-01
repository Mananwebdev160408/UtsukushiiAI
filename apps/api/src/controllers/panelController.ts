import { Request, Response, NextFunction } from "express";
import { panelService } from "../services";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const panel = await panelService.createPanel(
      req.user!.userId,
      req.params.projectId as string,
      req.body,
    );
    res.status(201).json({ status: "success", data: { panel } });
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const panels = await panelService.listPanels(
      req.user!.userId,
      req.params.projectId as string,
    );
    res.status(200).json({ status: "success", data: { panels } });
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
    const panel = await panelService.updatePanel(
      req.user!.userId,
      req.params.projectId as string,
      req.params.panelId as string,
      req.body,
    );
    res.status(200).json({ status: "success", data: { panel } });
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
    await panelService.deletePanel(
      req.user!.userId,
      req.params.projectId as string,
      req.params.panelId as string,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const reorder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await panelService.reorderPanels(
      req.user!.userId,
      req.params.projectId as string,
      req.body.orders,
    );
    res.status(200).json({ status: "success", message: "Panels reordered" });
  } catch (error) {
    next(error);
  }
};
