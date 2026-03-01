import rateLimit from "express-rate-limit";
import { config } from "../config";
import { RateLimitError } from "../errors";

export const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  handler: (req, res, next) => {
    next(new RateLimitError());
  },
  standardHeaders: true,
  legacyHeaders: false,
});
