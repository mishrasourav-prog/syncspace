export const taskQueryKeys = {
  all: ["tasks"] as const,

  project: (projectId: string) =>
    [...taskQueryKeys.all, "project", projectId] as const,

  projectList: (projectId: string) =>
    [...taskQueryKeys.project(projectId), "list"] as const,

  detail: (projectId: string, taskId: string) =>
    [...taskQueryKeys.project(projectId), "detail", taskId] as const,

  assignees: (projectId: string, taskId: string) =>
    [...taskQueryKeys.detail(projectId, taskId), "assignees"] as const,

  assignmentRequests: (projectId: string, taskId: string) =>
    [
      ...taskQueryKeys.detail(projectId, taskId),
      "assignment-requests",
    ] as const,
};
