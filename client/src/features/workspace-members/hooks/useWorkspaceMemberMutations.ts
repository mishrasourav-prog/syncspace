import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  removeWorkspaceMemberRequest,
  updateWorkspaceMemberRoleRequest,
} from "../api/workspaceMember.api";
import { workspaceMemberQueryKeys } from "../workspaceMember.queryKeys";
import type {
  AssignableWorkspaceRole,
  WorkspaceMember,
} from "../types/workspaceMember.types";

export function useUpdateWorkspaceMemberRoleMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    WorkspaceMember,
    ApiErrorShape,
    { memberId: string; role: AssignableWorkspaceRole }
  >({
    mutationFn: ({ memberId, role }) =>
      updateWorkspaceMemberRoleRequest(workspaceId, memberId, role),
    onSuccess: (updatedMember) => {
      queryClient.setQueryData<WorkspaceMember[]>(
        workspaceMemberQueryKeys.list(workspaceId),
        (previous) =>
          previous?.map((member) =>
            member._id === updatedMember._id ? updatedMember : member,
          ),
      );
      queryClient.invalidateQueries({
        queryKey: workspaceMemberQueryKeys.list(workspaceId),
      });
    },
  });
}

export function useRemoveWorkspaceMemberMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: (memberId) =>
      removeWorkspaceMemberRequest(workspaceId, memberId),
    onSuccess: (_data, memberId) => {
      queryClient.setQueryData<WorkspaceMember[]>(
        workspaceMemberQueryKeys.list(workspaceId),
        (previous) => previous?.filter((member) => member._id !== memberId),
      );
      queryClient.invalidateQueries({
        queryKey: workspaceMemberQueryKeys.list(workspaceId),
      });
    },
  });
}
