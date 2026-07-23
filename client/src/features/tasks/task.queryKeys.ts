export const taskQueryKeys = {
  all: ["tasks"] as const,

  /**
   * Parent key for every task resource belonging to one project.
   * Removing this prefix clears the project list, task details, comments,
   * and detailed assignee records after access is revoked or the user leaves.
   */
  project: (projectId: string) =>
    [...taskQueryKeys.all, "project", projectId] as const,

  projectList: (projectId: string) =>
    [...taskQueryKeys.project(projectId), "list"] as const,

  detail: (projectId: string, taskId: string) =>
    [...taskQueryKeys.project(projectId), "detail", taskId] as const,

  assignees: (projectId: string, taskId: string) =>
    [...taskQueryKeys.detail(projectId, taskId), "assignees"] as const,
};
