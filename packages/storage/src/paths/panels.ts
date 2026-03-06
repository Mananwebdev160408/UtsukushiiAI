import path from "path";
import { storageBuckets } from "../buckets";

export const getPanelPath = (
  projectId: string,
  panelId: string,
  fileName?: string,
): string => {
  const base = path.join(storageBuckets.panels, projectId, panelId);
  return fileName ? path.join(base, fileName) : base;
};
