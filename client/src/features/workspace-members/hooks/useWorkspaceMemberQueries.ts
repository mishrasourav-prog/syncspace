import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getWorkspaceMembersRequest } from "../api/workspaceMember.api";
import { workspaceMemberQueryKeys } from "../workspaceMember.queryKeys";
import type { WorkspaceMember } from "../types/workspaceMember.types";

export function useWorkspaceMembersQuery(workspaceId: string | undefined) {
  return useQuery<WorkspaceMember[], ApiErrorShape>({
    queryKey: workspaceMemberQueryKeys.list(workspaceId ?? ""),
    queryFn: () => getWorkspaceMembersRequest(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}
