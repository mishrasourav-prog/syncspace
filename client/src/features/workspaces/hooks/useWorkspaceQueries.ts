import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  getUserWorkspacesRequest,
  getWorkspaceRequest,
} from "../api/workspace.api";
import { workspaceQueryKeys } from "../workspace.queryKeys";
import type { WorkspaceSummary } from "../types/workspace.types";

export function useWorkspacesQuery() {
  return useQuery<WorkspaceSummary[], ApiErrorShape>({
    queryKey: workspaceQueryKeys.list(),
    queryFn: getUserWorkspacesRequest,
  });
}

export function useWorkspaceQuery(workspaceId: string | undefined) {
  return useQuery<WorkspaceSummary, ApiErrorShape>({
    queryKey: workspaceQueryKeys.detail(workspaceId ?? ""),
    queryFn: () => getWorkspaceRequest(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}
