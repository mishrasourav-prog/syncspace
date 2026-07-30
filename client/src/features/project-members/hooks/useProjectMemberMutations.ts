import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiErrorShape } from "@/lib/axios";

import { activityQueryKeys } from "@/features/activity/activity.queryKeys";

import { discussionQueryKeys } from "@/features/discussions/discussion.queryKeys";

import { documentQueryKeys } from "@/features/documents/document.queryKeys";

import { projectInvitationQueryKeys } from "@/features/project-invitations/projectInvitation.queryKeys";

import { projectQueryKeys } from "@/features/projects/project.queryKeys";

import { taskQueryKeys } from "@/features/tasks/task.queryKeys";

import {
  leaveProjectRequest,
  removeProjectMemberRequest,
  updateProjectMemberRoleRequest,
} from "../api/projectMember.api";

import { projectMemberQueryKeys } from "../projectMember.queryKeys";

import type { ProjectMember, ProjectRole } from "../types/projectMember.types";

export function useUpdateProjectMemberRoleMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ProjectMember,
    ApiErrorShape,
    {
      memberId: string;

      role: ProjectRole;
    }
  >({
    mutationFn: ({ memberId, role }) =>
      updateProjectMemberRoleRequest(projectId, memberId, role),

    onSuccess: (updatedMember) => {
      queryClient.setQueryData<ProjectMember[]>(
        projectMemberQueryKeys.list(projectId),
        (previous) =>
          previous?.map((member) =>
            member._id === updatedMember._id ? updatedMember : member,
          ),
      );

      void queryClient.invalidateQueries({
        queryKey: projectMemberQueryKeys.list(projectId),
      });
    },
  });
}

export function useRemoveProjectMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: (memberId) => removeProjectMemberRequest(projectId, memberId),

    onSuccess: (_data, memberId) => {
      queryClient.setQueryData<ProjectMember[]>(
        projectMemberQueryKeys.list(projectId),
        (previous) => previous?.filter((member) => member._id !== memberId),
      );

      void queryClient.invalidateQueries({
        queryKey: projectMemberQueryKeys.list(projectId),
      });
    },
  });
}

export function useLeaveProjectMutation(
  projectId: string,

  workspaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, void>({
    mutationFn: () => leaveProjectRequest(projectId),

    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: projectQueryKeys.detail(projectId),

        exact: true,
      });

      queryClient.removeQueries({
        queryKey: projectMemberQueryKeys.list(projectId),

        exact: true,
      });

      queryClient.removeQueries({
        queryKey: projectInvitationQueryKeys.list(projectId),

        exact: true,
      });

      queryClient.removeQueries({
        queryKey: taskQueryKeys.project(projectId),
      });

      queryClient.removeQueries({
        queryKey: documentQueryKeys.project(projectId),
      });

      queryClient.removeQueries({
        queryKey: discussionQueryKeys.project(projectId),
      });

      queryClient.removeQueries({
        queryKey: activityQueryKeys.project(projectId),

        exact: true,
      });

      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: projectQueryKeys.workspaceList(workspaceId),
        });
      }
    },
  });
}
