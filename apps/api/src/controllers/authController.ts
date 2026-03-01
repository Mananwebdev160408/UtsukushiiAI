import { Request, Response, NextFunction } from "express";
import { authService } from "../services";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user!.userId, refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).json({ status: "success", data: { user: req.user } });
  } catch (error) {
    next(error);
  }
};
