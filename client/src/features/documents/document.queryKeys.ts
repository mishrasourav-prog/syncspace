export const documentQueryKeys = {
  all: ["documents"] as const,
  project: (projectId: string) =>
    [...documentQueryKeys.all, "project", projectId] as const,
  projectList: (projectId: string, search: string) =>
    [...documentQueryKeys.project(projectId), "list", search] as const,

  infinite: (projectId: string) =>
    [...documentQueryKeys.project(projectId), "infinite"] as const,

  infiniteList: (projectId: string, isArchived: boolean, search: string) =>
    [...documentQueryKeys.infinite(projectId), isArchived, search] as const,

  detail: (projectId: string, documentId: string) =>
    [...documentQueryKeys.project(projectId), "detail", documentId] as const,
};
