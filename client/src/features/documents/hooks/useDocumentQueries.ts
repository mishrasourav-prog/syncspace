import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getProjectDocumentsRequest } from "../api/document.api";
import { documentQueryKeys } from "../document.queryKeys";
import type { ProjectDocumentListResult } from "../types/document.types";

export function useProjectDocumentsQuery(projectId: string | undefined, search: string) {
  return useQuery<ProjectDocumentListResult, ApiErrorShape>({
    queryKey: documentQueryKeys.projectList(projectId ?? "", search),
    queryFn: () => getProjectDocumentsRequest(projectId!, search),
    enabled: Boolean(projectId),
  });
}
