export const workspaceInvitationQueryKeys = {
  all: ["workspace-invitations"] as const,
  list: () => [...workspaceInvitationQueryKeys.all, "list"] as const,
};
