import { redisClient } from "./client";

export function cached(ttlSeconds: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Very basic cache key based on method name and JSON stringified args
      // In production, we'd want stronger cache key logic based on the entity
      const cacheKey = `cached:${propertyKey}:${JSON.stringify(args)}`;

      try {
        const cachedValue = await redisClient.get(cacheKey);
        if (cachedValue) {
          return JSON.parse(cachedValue);
        }
      } catch (err) {
        // Log error but proceed without breaking the application logic
        console.error("Cache read error:", err);
      }

      const result = await originalMethod.apply(this, args);

      try {
        if (result !== undefined && result !== null) {
          await redisClient.set(
            cacheKey,
            JSON.stringify(result),
            "EX",
            ttlSeconds,
          );
        }
      } catch (err) {
        console.error("Cache write error:", err);
      }

      return result;
    };

    return descriptor;
  };
}
