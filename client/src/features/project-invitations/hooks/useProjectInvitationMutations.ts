import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  cancelProjectInvitationRequest,
  inviteProjectMemberRequest,
  type InviteProjectMemberPayload,
} from "../api/projectInvitation.api";
import { projectInvitationQueryKeys } from "../projectInvitation.queryKeys";
import type { ProjectInvitation } from "../types/projectInvitation.types";

export function useInviteProjectMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectInvitation, ApiErrorShape, InviteProjectMemberPayload>({
    mutationFn: (payload) => inviteProjectMemberRequest(projectId, payload),
    onSuccess: (createdInvitation) => {
      queryClient.setQueryData<ProjectInvitation[]>(projectInvitationQueryKeys.list(projectId), (previous) =>
        previous ? [createdInvitation, ...previous] : [createdInvitation]
      );
      queryClient.invalidateQueries({ queryKey: projectInvitationQueryKeys.list(projectId) });
    },
  });
}

export function useCancelProjectInvitationMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: (invitationId) => cancelProjectInvitationRequest(invitationId),
    onSuccess: (_data, invitationId) => {
      queryClient.setQueryData<ProjectInvitation[]>(projectInvitationQueryKeys.list(projectId), (previous) =>
        previous?.filter((invitation) => invitation._id !== invitationId)
      );
      queryClient.invalidateQueries({ queryKey: projectInvitationQueryKeys.list(projectId) });
    },
  });
}
