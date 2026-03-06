import Redis from "ioredis";
import { config } from "../config";
import { logger } from "../utils/logger";

class CacheClient {
  private static instance: Redis;

  public static getInstance(): Redis {
    if (!CacheClient.instance) {
      CacheClient.instance = new Redis(config.redis.url, {
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      CacheClient.instance.on("connect", () => {
        logger.info("Redis cache client connected");
      });

      CacheClient.instance.on("error", (error) => {
        logger.error("Redis cache client error:", error);
      });
    }

    return CacheClient.instance;
  }
}

export const redisClient = CacheClient.getInstance();
