import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getMyInvitationsRequest } from "../api/workspaceInvitation.api";
import { workspaceInvitationQueryKeys } from "../workspaceInvitation.queryKeys";
import type { WorkspaceInvitation } from "../workspaceInvitation.types";

export function useMyInvitationsQuery() {
  return useQuery<WorkspaceInvitation[], ApiErrorShape>({
    queryKey: workspaceInvitationQueryKeys.list(),
    queryFn: getMyInvitationsRequest,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}
