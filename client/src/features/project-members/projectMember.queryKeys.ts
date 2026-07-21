export const projectMemberQueryKeys = {
  all: ["project-members"] as const,
  list: (projectId: string) => [...projectMemberQueryKeys.all, projectId] as const,
};
