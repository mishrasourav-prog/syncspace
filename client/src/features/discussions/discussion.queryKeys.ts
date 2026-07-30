export const discussionQueryKeys = {
  all: ["discussions"] as const,
  project: (projectId: string) =>
    [...discussionQueryKeys.all, "project", projectId] as const,

  projectListAll: (projectId: string) =>
    [...discussionQueryKeys.project(projectId), "list"] as const,

  projectList: (projectId: string, search: string) =>
    [...discussionQueryKeys.projectListAll(projectId), search] as const,

  infinite: (projectId: string) =>
    [...discussionQueryKeys.project(projectId), "infinite"] as const,

  infiniteList: (projectId: string, search: string) =>
    [...discussionQueryKeys.infinite(projectId), search] as const,

  detail: (projectId: string, discussionId: string) =>
    [
      ...discussionQueryKeys.project(projectId),
      "detail",
      discussionId,
    ] as const,

  replies: (projectId: string, discussionId: string) =>
    [
      ...discussionQueryKeys.project(projectId),
      "replies",
      discussionId,
    ] as const,

  repliesList: (projectId: string, discussionId: string, limit: number) =>
    [...discussionQueryKeys.replies(projectId, discussionId), limit] as const,
};
