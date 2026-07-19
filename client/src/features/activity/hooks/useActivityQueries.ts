import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getWorkspaceActivitiesRequest } from "../api/activity.api";
import { activityQueryKeys } from "../activity.queryKeys";
import type { Activity } from "../types/activity.types";

export function useWorkspaceActivitiesQuery(workspaceId: string | undefined) {
  return useQuery<Activity[], ApiErrorShape>({
    queryKey: activityQueryKeys.workspace(workspaceId ?? ""),
    queryFn: () => getWorkspaceActivitiesRequest(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}
