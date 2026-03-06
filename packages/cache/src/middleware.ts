import { Request, Response, NextFunction } from "express";
import { redisClient } from "@utsukushii/api/src/cache/client";
import { logger } from "@utsukushii/api/src/utils/logger";
import { serialize, deserialize } from "./serializers";

/**
 * Express middleware to cache responses
 * @param keyPrefix Custom prefix for the cache key, defaults to the request path
 * @param ttl Time to live in seconds
 */
export const cacheMiddleware = (keyPrefix?: string, ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = keyPrefix ? `${keyPrefix}:${req.originalUrl}` : req.originalUrl;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        logger.debug(`Cache hit for ${key}`);
        const parsed = deserialize(cachedData);
        if (parsed) {
          return res.json(parsed);
        }
      }

      logger.debug(`Cache miss for ${key}`);

      // We need to intercept the response json method to cache it before sending
      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        // Only cache successful status codes (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const stringified = serialize(body);
          if (stringified) {
            redisClient.setex(key, ttl, stringified).catch((err) => {
              logger.error(`Failed to set cache for ${key}`, err);
            });
          }
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error for ${key}:`, error);
      // Proceed without caching if Redis fails
      next();
    }
  };
};
