export const projectInvitationQueryKeys = {
  all: ["project-invitations"] as const,
  my: () => [...projectInvitationQueryKeys.all, "my"] as const,
  list: (projectId: string) => [...projectInvitationQueryKeys.all, "project", projectId] as const,
};
