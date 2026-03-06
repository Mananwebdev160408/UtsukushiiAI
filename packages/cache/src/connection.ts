import { redisClient } from "@utsukushii/api/src/cache/client";
import { logger } from "@utsukushii/api/src/utils/logger";

export const connectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status === "ready") {
      logger.info("Redis is already connected");
      return;
    }

    // ioredis connects automatically, but we can wait for the ready event
    await new Promise<void>((resolve, reject) => {
      redisClient.once("ready", () => {
        logger.info("Successfully connected to Redis");
        resolve();
      });

      redisClient.once("error", (err) => {
        logger.error("Failed to connect to Redis", err);
        reject(err);
      });
    });
  } catch (error) {
    logger.error("Error establishing Redis connection:", error);
    throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status !== "end") {
      await redisClient.quit();
      logger.info("Disconnected from Redis gracefully");
    }
  } catch (error) {
    logger.error("Error disconnecting from Redis:", error);
    throw error;
  }
};
