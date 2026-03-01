import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { logger } from "../utils/logger";
import { config } from "../config";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    logger.warn(`${req.method} ${req.path} - ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Unhandled errors
  logger.error(`${req.method} ${req.path} - Unhandled Error: ${err.message}`, {
    stack: err.stack,
  });

  const statusCode = 500;
  const message = config.isProd ? "Internal server error" : err.message;

  res.status(statusCode).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message,
    ...(config.isDev && { stack: err.stack }),
  });
};
