import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store";
import { notificationQueryKeys } from "@/features/notifications/notification.queryKeys";
import { workspaceQueryKeys } from "@/features/workspaces/workspace.queryKeys";
import { workspaceInvitationQueryKeys } from "@/features/workspace-invitations/workspaceInvitation.queryKeys";
import { projectQueryKeys } from "@/features/projects/project.queryKeys";
import { workspaceMemberQueryKeys } from "@/features/workspace-members/workspaceMember.queryKeys";
import { projectMemberQueryKeys } from "@/features/project-members/projectMember.queryKeys";
import { projectInvitationQueryKeys } from "@/features/project-invitations/projectInvitation.queryKeys";
import { taskQueryKeys } from "@/features/tasks/task.queryKeys";
import { documentQueryKeys } from "@/features/documents/document.queryKeys";
import { discussionQueryKeys } from "@/features/discussions/discussion.queryKeys";
import { activityQueryKeys } from "@/features/activity/activity.queryKeys";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import { socket } from "./socket";

/*
Mounted once for the whole authenticated application shell.

Owns the single Socket.IO connection lifecycle: connects when the user is
authenticated, disconnects on logout, and reacts to global realtime events.
*/
export function useSocketLifecycle() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      if (socket.connected) socket.disconnect();
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    function handleNotificationNew() {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });
    }

    function handleWorkspaceRevoked(payload: {
      workspaceId: string;
      projectIds: string[];
      reason: "removed" | "left";
    }) {
      queryClient.setQueryData<WorkspaceSummary[]>(workspaceQueryKeys.list(), (previous) =>
        previous?.filter((workspace) => workspace._id !== payload.workspaceId)
      );
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: workspaceInvitationQueryKeys.list() });
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

    function handleProjectRevoked(payload: { workspaceId: string; projectId: string; reason: "removed" | "left" }) {
      queryClient.removeQueries({ queryKey: projectQueryKeys.detail(payload.projectId) });
      queryClient.removeQueries({ queryKey: projectMemberQueryKeys.list(payload.projectId) });
      queryClient.removeQueries({ queryKey: projectInvitationQueryKeys.list(payload.projectId) });
      queryClient.removeQueries({ queryKey: taskQueryKeys.project(payload.projectId) });
      queryClient.removeQueries({ queryKey: documentQueryKeys.project(payload.projectId) });
      queryClient.removeQueries({ queryKey: discussionQueryKeys.project(payload.projectId) });
      queryClient.removeQueries({ queryKey: activityQueryKeys.project(payload.projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.workspaceList(payload.workspaceId) });

      if (location.pathname.startsWith(`/workspaces/${payload.workspaceId}/projects/${payload.projectId}`)) {
        navigate(`/workspaces/${payload.workspaceId}#projects`, { replace: true });
      }

      if (payload.reason === "removed") {
        toast.info("Your access to that project was removed.");
      }
    }

    socket.on("notification:new", handleNotificationNew);
    socket.on("access:workspace-revoked", handleWorkspaceRevoked);
    socket.on("access:project-revoked", handleProjectRevoked);

    return () => {
      socket.off("notification:new", handleNotificationNew);
      socket.off("access:workspace-revoked", handleWorkspaceRevoked);
      socket.off("access:project-revoked", handleProjectRevoked);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
