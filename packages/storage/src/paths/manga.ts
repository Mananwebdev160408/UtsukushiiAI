import path from "path";
import { storageBuckets } from "../buckets";

export const getMangaPath = (projectId: string, fileName?: string): string => {
  const base = path.join(storageBuckets.manga, projectId);
  return fileName ? path.join(base, fileName) : base;
};
