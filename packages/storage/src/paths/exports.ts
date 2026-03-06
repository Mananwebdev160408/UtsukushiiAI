import path from "path";
import { storageBuckets } from "../buckets";

export const getExportPath = (
  projectId: string,
  jobId: string,
  fileName?: string,
): string => {
  const base = path.join(storageBuckets.exports, projectId, jobId);
  return fileName ? path.join(base, fileName) : base;
};
