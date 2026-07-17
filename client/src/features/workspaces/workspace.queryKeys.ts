export const workspaceQueryKeys = {
  all: ["workspaces"] as const,
  list: () => [...workspaceQueryKeys.all, "list"] as const,
  detail: (workspaceId: string) => [...workspaceQueryKeys.all, "detail", workspaceId] as const,
};
