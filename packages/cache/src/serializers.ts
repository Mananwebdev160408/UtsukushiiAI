import { logger } from "@utsukushii/api/src/utils/logger";

/**
 * Safely stringifies an object to JSON, handling potential circular references or errors
 */
export const serialize = <T>(data: T): string | null => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    logger.error("Error serializing data for cache:", error);
    return null;
  }
};

/**
 * Safely parses a JSON string back into an object
 */
export const deserialize = <T>(data: string | null): T | null => {
  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error("Error deserializing cache data:", error);
    return null;
  }
};
