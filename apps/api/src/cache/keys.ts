export const CacheKeys = {
  session: (userId: string) => `session:${userId}`,
  project: (projectId: string) => `project:${projectId}`,
  projectPanels: (projectId: string) => `project:${projectId}:panels`,
  renderJob: (jobId: string) => `render:${jobId}`,
};
