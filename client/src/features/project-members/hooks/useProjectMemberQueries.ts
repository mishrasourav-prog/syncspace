import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getProjectMembersRequest } from "../api/projectMember.api";
import { projectMemberQueryKeys } from "../projectMember.queryKeys";
import type { ProjectMember } from "../types/projectMember.types";

export function useProjectMembersQuery(projectId: string | undefined) {
  return useQuery<ProjectMember[], ApiErrorShape>({
    queryKey: projectMemberQueryKeys.list(projectId ?? ""),
    queryFn: () => getProjectMembersRequest(projectId!),
    enabled: Boolean(projectId),
  });
}
