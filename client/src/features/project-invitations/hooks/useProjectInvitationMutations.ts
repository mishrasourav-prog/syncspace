import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiErrorShape } from "@/lib/axios";
import { notificationQueryKeys } from "@/features/notifications/notification.queryKeys";
import { projectMemberQueryKeys } from "@/features/project-members/projectMember.queryKeys";
import { projectQueryKeys } from "@/features/projects/project.queryKeys";
import { workspaceQueryKeys } from "@/features/workspaces/workspace.queryKeys";
import {
  acceptProjectInvitationRequest,
  cancelProjectInvitationRequest,
  inviteProjectMemberRequest,
  rejectProjectInvitationRequest,
  type InviteProjectMemberPayload,
} from "../api/projectInvitation.api";
import { projectInvitationQueryKeys } from "../projectInvitation.queryKeys";
import type { ProjectInvitation } from "../types/projectInvitation.types";

export function useInviteProjectMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectInvitation, ApiErrorShape, InviteProjectMemberPayload>({
    mutationFn: (payload) => inviteProjectMemberRequest(projectId, payload),
    onSuccess: (createdInvitation) => {
      queryClient.setQueryData<ProjectInvitation[]>(
        projectInvitationQueryKeys.list(projectId),
        (previous) => (previous ? [createdInvitation, ...previous] : [createdInvitation])
      );
      void queryClient.invalidateQueries({ queryKey: projectInvitationQueryKeys.list(projectId) });
    },
  });
}

export function useCancelProjectInvitationMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: cancelProjectInvitationRequest,
    onSuccess: (_data, invitationId) => {
      queryClient.setQueryData<ProjectInvitation[]>(
        projectInvitationQueryKeys.list(projectId),
        (previous) => previous?.filter((invitation) => invitation._id !== invitationId)
      );
      void queryClient.invalidateQueries({ queryKey: projectInvitationQueryKeys.list(projectId) });
    },
  });
}

export function useAcceptProjectInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, ProjectInvitation>({
    mutationFn: (invitation) => acceptProjectInvitationRequest(invitation._id),
    onSuccess: (_data, invitation) => {
      queryClient.setQueryData<ProjectInvitation[]>(projectInvitationQueryKeys.my(), (previous) =>
        previous?.filter((item) => item._id !== invitation._id)
      );
      void queryClient.invalidateQueries({ queryKey: projectInvitationQueryKeys.my() });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      if (invitation.workspace) {
        void queryClient.invalidateQueries({
          queryKey: projectQueryKeys.workspaceList(invitation.workspace),
        });
        void queryClient.invalidateQueries({
          queryKey: workspaceQueryKeys.detail(invitation.workspace),
        });
      }
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(invitation.project) });
      void queryClient.invalidateQueries({ queryKey: projectMemberQueryKeys.list(invitation.project) });
    },
  });
}

export function useRejectProjectInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, ProjectInvitation>({
    mutationFn: (invitation) => rejectProjectInvitationRequest(invitation._id),
    onSuccess: (_data, invitation) => {
      queryClient.setQueryData<ProjectInvitation[]>(projectInvitationQueryKeys.my(), (previous) =>
        previous?.filter((item) => item._id !== invitation._id)
      );
      void queryClient.invalidateQueries({ queryKey: projectInvitationQueryKeys.my() });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
