import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../errors";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    // In a real app, we might fetch the user from DB here and attach to req
    // For now, we'll just attach the payload info
    req.user = payload as any;

    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
