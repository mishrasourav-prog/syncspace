import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getProjectDiscussionsRequest } from "../api/discussion.api";
import { discussionQueryKeys } from "../discussion.queryKeys";
import type { DiscussionListResult } from "../types/discussion.types";

export function useProjectDiscussionsQuery(projectId: string | undefined, search: string) {
  return useQuery<DiscussionListResult, ApiErrorShape>({
    queryKey: discussionQueryKeys.projectList(projectId ?? "", search),
    queryFn: () => getProjectDiscussionsRequest(projectId!, search),
    enabled: Boolean(projectId),
  });
}
