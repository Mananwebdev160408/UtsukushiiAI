import path from "path";
import { storageBuckets } from "../buckets";

export const getAudioPath = (projectId: string, fileName?: string): string => {
  const base = path.join(storageBuckets.audio, projectId);
  return fileName ? path.join(base, fileName) : base;
};
