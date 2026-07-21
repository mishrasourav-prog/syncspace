export const discussionQueryKeys = {
  all: ["discussions"] as const,
  project: (projectId: string) => [...discussionQueryKeys.all, "project", projectId] as const,
  projectList: (projectId: string, search: string) =>
    [...discussionQueryKeys.project(projectId), "list", search] as const,
};
