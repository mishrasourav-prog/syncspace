import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/app/store";
import { activityQueryKeys } from "@/features/activity/activity.queryKeys";
import { endAuthenticatedSession } from "@/features/auth/session/endAuthenticatedSession";
import type { SessionRevokedPayload } from "@/features/auth/types/session.types";
import { discussionQueryKeys } from "@/features/discussions/discussion.queryKeys";
import { documentQueryKeys } from "@/features/documents/document.queryKeys";
import { notificationQueryKeys } from "@/features/notifications/notification.queryKeys";
import { projectInvitationQueryKeys } from "@/features/project-invitations/projectInvitation.queryKeys";
import { projectMemberQueryKeys } from "@/features/project-members/projectMember.queryKeys";
import { projectQueryKeys } from "@/features/projects/project.queryKeys";
import { taskQueryKeys } from "@/features/tasks/task.queryKeys";
import { workspaceInvitationQueryKeys } from "@/features/workspace-invitations/workspaceInvitation.queryKeys";
import { workspaceMemberQueryKeys } from "@/features/workspace-members/workspaceMember.queryKeys";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import { workspaceQueryKeys } from "@/features/workspaces/workspace.queryKeys";

import {
  socket,
  type ProjectAccessRevokedPayload,
  type ProjectMemberChangedPayload,
  type WorkspaceAccessRevokedPayload,
  type WorkspaceMemberChangedPayload,
} from "./socket";

/*
Mounted once for the authenticated application shell. It owns the single
Socket.IO connection and global account/access events.
*/
export function useSocketLifecycle() {
  const userId = useAuthStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userId) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    function handleNotificationNew() {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: workspaceInvitationQueryKeys.list() });
      void queryClient.invalidateQueries({ queryKey: projectInvitationQueryKeys.my() });
    }

    function refreshWorkspaceMembership(payload: WorkspaceMemberChangedPayload) {
      void queryClient.invalidateQueries({ queryKey: workspaceMemberQueryKeys.list(payload.workspaceId) });
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(payload.workspaceId) });
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
      void queryClient.invalidateQueries({ queryKey: activityQueryKeys.workspace(payload.workspaceId) });
    }

    function refreshProjectMembership(payload: ProjectMemberChangedPayload) {
      void queryClient.invalidateQueries({ queryKey: projectMemberQueryKeys.list(payload.projectId) });
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(payload.projectId) });
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.workspaceList(payload.workspaceId) });
      void queryClient.invalidateQueries({ queryKey: activityQueryKeys.project(payload.projectId) });
    }

    function handleWorkspaceRevoked(payload: WorkspaceAccessRevokedPayload) {
      queryClient.setQueryData<WorkspaceSummary[]>(workspaceQueryKeys.list(), (previous) =>
        previous?.filter((workspace) => workspace._id !== payload.workspaceId)
      );
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
      void queryClient.invalidateQueries({ queryKey: workspaceInvitationQueryKeys.list() });
      queryClient.removeQueries({ queryKey: workspaceQueryKeys.detail(payload.workspaceId) });
      queryClient.removeQueries({ queryKey: projectQueryKeys.workspaceList(payload.workspaceId) });
      queryClient.removeQueries({ queryKey: workspaceMemberQueryKeys.list(payload.workspaceId) });
      queryClient.removeQueries({ queryKey: activityQueryKeys.workspace(payload.workspaceId) });

      if (location.pathname.startsWith(`/workspaces/${payload.workspaceId}`)) {
        navigate("/dashboard", { replace: true });
      }

      if (payload.reason === "removed") {
        toast.info("Your access to that workspace was removed.");
      }
    }

    function handleProjectRevoked(payload: ProjectAccessRevokedPayload) {
      queryClient.removeQueries({ queryKey: projectQueryKeys.detail(payload.projectId) });
      queryClient.removeQueries({ queryKey: projectMemberQueryKeys.list(payload.projectId) });
      queryClient.removeQueries({ queryKey: projectInvitationQueryKeys.list(payload.projectId) });
      queryClient.removeQueries({ queryKey: taskQueryKeys.project(payload.projectId) });
      queryClient.removeQueries({ queryKey: documentQueryKeys.project(payload.projectId) });
      queryClient.removeQueries({ queryKey: discussionQueryKeys.project(payload.projectId) });
      queryClient.removeQueries({ queryKey: activityQueryKeys.project(payload.projectId) });
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.workspaceList(payload.workspaceId) });

      if (location.pathname.startsWith(`/workspaces/${payload.workspaceId}/projects/${payload.projectId}`)) {
        navigate(`/workspaces/${payload.workspaceId}#projects`, { replace: true });
      }

      if (payload.reason === "removed") {
        toast.info("Your access to that project was removed.");
      }
    }

    function handleAccountSessionRevoked(payload: SessionRevokedPayload) {
      endAuthenticatedSession({
        navigate,
        reason: payload.reason,
      });
    }

    socket.on("notification:new", handleNotificationNew);
    socket.on("workspace:member-added", refreshWorkspaceMembership);
    socket.on("workspace:member-role-changed", refreshWorkspaceMembership);
    socket.on("project:member-added", refreshProjectMembership);
    socket.on("project:member-role-changed", refreshProjectMembership);
    socket.on("access:workspace-revoked", handleWorkspaceRevoked);
    socket.on("access:project-revoked", handleProjectRevoked);
    socket.on("account:session-revoked", handleAccountSessionRevoked);

    return () => {
      socket.off("notification:new", handleNotificationNew);
      socket.off("workspace:member-added", refreshWorkspaceMembership);
      socket.off("workspace:member-role-changed", refreshWorkspaceMembership);
      socket.off("project:member-added", refreshProjectMembership);
      socket.off("project:member-role-changed", refreshProjectMembership);
      socket.off("access:workspace-revoked", handleWorkspaceRevoked);
      socket.off("access:project-revoked", handleProjectRevoked);
      socket.off("account:session-revoked", handleAccountSessionRevoked);
    };
  }, [location.pathname, navigate, queryClient]);
}
