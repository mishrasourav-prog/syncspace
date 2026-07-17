import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store";
import { notificationQueryKeys } from "@/features/notifications/notification.queryKeys";
import { workspaceQueryKeys } from "@/features/workspaces/workspace.queryKeys";
import { workspaceInvitationQueryKeys } from "@/features/workspace-invitations/workspaceInvitation.queryKeys";
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

      if (location.pathname === `/workspaces/${payload.workspaceId}`) {
        navigate("/dashboard", { replace: true });
      }

      toast.info(
        payload.reason === "removed"
          ? "Your access to that workspace was removed."
          : "You left that workspace."
      );
    }

    socket.on("notification:new", handleNotificationNew);
    socket.on("access:workspace-revoked", handleWorkspaceRevoked);

    return () => {
      socket.off("notification:new", handleNotificationNew);
      socket.off("access:workspace-revoked", handleWorkspaceRevoked);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
