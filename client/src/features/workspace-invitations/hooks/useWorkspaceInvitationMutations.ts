// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import type { ApiErrorShape } from "@/lib/axios";
// import { acceptInvitationRequest, rejectInvitationRequest } from "../api/workspaceInvitation.api";
// import { workspaceInvitationQueryKeys } from "../workspaceInvitation.queryKeys";
// import { workspaceQueryKeys } from "@/features/workspaces/workspace.queryKeys";

// export function useAcceptInvitationMutation() {
//   const queryClient = useQueryClient();

//   return useMutation<void, ApiErrorShape, string>({
//     mutationFn: acceptInvitationRequest,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: workspaceInvitationQueryKeys.list() });
//       queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
//     },
//   });
// }

// export function useRejectInvitationMutation() {
//   const queryClient = useQueryClient();

//   return useMutation<void, ApiErrorShape, string>({
//     mutationFn: rejectInvitationRequest,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: workspaceInvitationQueryKeys.list() });
//     },
//   });
// }

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  acceptInvitationRequest,
  inviteWorkspaceMemberRequest,
  rejectInvitationRequest,
  type InviteWorkspaceMemberPayload,
} from "../api/workspaceInvitation.api";
import { workspaceInvitationQueryKeys } from "../workspaceInvitation.queryKeys";
import { workspaceQueryKeys } from "@/features/workspaces/workspace.queryKeys";
import type { WorkspaceInvitation } from "../workspaceInvitation.types";

/*
Inviting a user does not change workspace membership until the invitee
accepts, so this intentionally does not touch the member-list cache.
*/
export function useInviteWorkspaceMemberMutation(workspaceId: string) {
  return useMutation<WorkspaceInvitation, ApiErrorShape, InviteWorkspaceMemberPayload>({
    mutationFn: (payload) => inviteWorkspaceMemberRequest(workspaceId, payload),
  });
}

export function useAcceptInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: acceptInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceInvitationQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
    },
  });
}

export function useRejectInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: rejectInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceInvitationQueryKeys.list() });
    },
  });
}
