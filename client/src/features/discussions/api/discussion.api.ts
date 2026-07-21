import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { DiscussionListResult } from "../types/discussion.types";

export async function getProjectDiscussionsRequest(projectId: string, search: string): Promise<DiscussionListResult> {
  return axiosClient
    .get<ApiResponse<DiscussionListResult>>(`/projects/${projectId}/discussions`, {
      params: {
        limit: 50,
        ...(search ? { search } : {}),
      },
    })
    .then((res) => res.data.data);
}
