export const documentQueryKeys = {
  all: ["documents"] as const,
  project: (projectId: string) => [...documentQueryKeys.all, "project", projectId] as const,
  projectList: (projectId: string, search: string) =>
    [...documentQueryKeys.project(projectId), "list", search] as const,

  /**
   * Parent key for the two cursor-paginated infinite queries (active and
   * archived) backing the Documents List page. Kept separate from
   * `projectList` above, which is the single-page query used only by the
   * Project Overview preview.
   */
  infinite: (projectId: string) => [...documentQueryKeys.project(projectId), "infinite"] as const,

  infiniteList: (projectId: string, isArchived: boolean, search: string) =>
    [...documentQueryKeys.infinite(projectId), isArchived, search] as const,

  /**
   * Single-document detail query used by the Document Editor. Kept beneath
   * the project prefix (rather than under `all` directly) so that the
   * existing project-access-revocation cache cleanup — which invalidates
   * everything under `project(projectId)` — removes it automatically.
   */
  detail: (projectId: string, documentId: string) =>
    [...documentQueryKeys.project(projectId), "detail", documentId] as const,
};
