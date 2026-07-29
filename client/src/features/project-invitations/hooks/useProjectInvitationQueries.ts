import { useQuery } from "@tanstack/react-query";

import type { ApiErrorShape } from "@/lib/axios";
import {
  getMyProjectInvitationsRequest,
  getPendingProjectInvitationsRequest,
} from "../api/projectInvitation.api";
import { projectInvitationQueryKeys } from "../projectInvitation.queryKeys";
import type { ProjectInvitation } from "../types/projectInvitation.types";

export function useProjectInvitationsQuery(
  projectId: string | undefined,
  enabled = true
) {
  return useQuery<ProjectInvitation[], ApiErrorShape>({
    queryKey: projectInvitationQueryKeys.list(projectId ?? ""),
    queryFn: () => (projectId ? getPendingProjectInvitationsRequest(projectId) : Promise.resolve([])),
    enabled: Boolean(projectId) && enabled,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}

export function useMyProjectInvitationsQuery() {
  return useQuery<ProjectInvitation[], ApiErrorShape>({
    queryKey: projectInvitationQueryKeys.my(),
    queryFn: getMyProjectInvitationsRequest,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}
