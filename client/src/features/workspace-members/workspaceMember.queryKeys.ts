export const workspaceMemberQueryKeys = {
  all: ["workspace-members"] as const,
  list: (workspaceId: string) =>
    [...workspaceMemberQueryKeys.all, workspaceId] as const,
};
