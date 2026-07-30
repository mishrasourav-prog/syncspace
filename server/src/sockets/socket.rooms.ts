export const getUserRoom = (userId: string): string => {
  return `user:${userId}`;
};

export const getWorkspaceRoom = (workspaceId: string): string => {
  return `workspace:${workspaceId}`;
};

export const getProjectRoom = (projectId: string): string => {
  return `project:${projectId}`;
};
