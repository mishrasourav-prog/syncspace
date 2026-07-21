import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { ProjectDocumentListResult } from "../types/document.types";

export async function getProjectDocumentsRequest(
  projectId: string,
  search: string
): Promise<ProjectDocumentListResult> {
  return axiosClient
    .get<ApiResponse<ProjectDocumentListResult>>(`/projects/${projectId}/documents`, {
      params: {
        isArchived: false,
        limit: 50,
        ...(search ? { search } : {}),
      },
    })
    .then((res) => res.data.data);
}
