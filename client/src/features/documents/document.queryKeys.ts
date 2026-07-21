export const documentQueryKeys = {
  all: ["documents"] as const,
  project: (projectId: string) => [...documentQueryKeys.all, "project", projectId] as const,
  projectList: (projectId: string, search: string) =>
    [...documentQueryKeys.project(projectId), "list", search] as const,
};
