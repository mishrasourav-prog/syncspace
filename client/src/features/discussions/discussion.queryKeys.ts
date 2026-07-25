export const discussionQueryKeys = {
  all: ["discussions"] as const,
  project: (projectId: string) => [...discussionQueryKeys.all, "project", projectId] as const,

  /** Prefix covering every search variant of the Project Overview preview panel query, for invalidation. */
  projectListAll: (projectId: string) => [...discussionQueryKeys.project(projectId), "list"] as const,

  /** Single-page query used by the Project Overview preview panel. */
  projectList: (projectId: string, search: string) =>
    [...discussionQueryKeys.projectListAll(projectId), search] as const,

  /** Parent key for the cursor-paginated infinite query backing the Discussions List page. */
  infinite: (projectId: string) => [...discussionQueryKeys.project(projectId), "infinite"] as const,

  infiniteList: (projectId: string, search: string) => [...discussionQueryKeys.infinite(projectId), search] as const,

  /** Nested beneath the project prefix so project-access-revocation cleanup removes it automatically. */
  detail: (projectId: string, discussionId: string) =>
    [...discussionQueryKeys.project(projectId), "detail", discussionId] as const,

  replies: (projectId: string, discussionId: string) =>
    [...discussionQueryKeys.project(projectId), "replies", discussionId] as const,

  repliesList: (projectId: string, discussionId: string, limit: number) =>
    [...discussionQueryKeys.replies(projectId, discussionId), limit] as const,
};
