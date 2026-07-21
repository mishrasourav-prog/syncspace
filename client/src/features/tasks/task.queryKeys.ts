export const taskQueryKeys = {
  all: ["tasks"] as const,
  projectList: (projectId: string) => [...taskQueryKeys.all, "project", projectId] as const,
};
