import path from "path";

// Note: In a real app this would use config from the app
// Since it's a shared package, we define a default base or expect it to be passed
const DEFAULT_STORAGE_PATH =
  process.env.STORAGE_PATH || path.join(process.cwd(), "uploads");

export const storageBuckets = {
  manga: path.join(DEFAULT_STORAGE_PATH, "manga"),
  audio: path.join(DEFAULT_STORAGE_PATH, "audio"),
  exports: path.join(DEFAULT_STORAGE_PATH, "exports"),
  panels: path.join(DEFAULT_STORAGE_PATH, "panels"),
  temp: path.join(DEFAULT_STORAGE_PATH, "temp"),
};

// Ensure all exported bucket paths are absolute
export const getBucketPath = (bucket: keyof typeof storageBuckets): string => {
  return storageBuckets[bucket];
};
