import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { Activity } from "../types/activity.types";

export async function getWorkspaceActivitiesRequest(workspaceId: string): Promise<Activity[]> {
  return axiosClient
    .get<ApiResponse<{ activities: Activity[] }>>(`/workspaces/${workspaceId}/activities`)
    .then((res) => res.data.data.activities);
}
