export const projectInvitationQueryKeys = {
  all: ["project-invitations"] as const,
  list: (projectId: string) => [...projectInvitationQueryKeys.all, projectId] as const,
};
