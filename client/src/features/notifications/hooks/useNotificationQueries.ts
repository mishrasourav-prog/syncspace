import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { useAuthStore } from "@/app/store";
import {
  getNotificationsRequest,
  getUnreadNotificationCountRequest,
} from "../api/notification.api";
import { notificationQueryKeys } from "../notification.queryKeys";
import type { NotificationItem } from "../notification.types";

export function useNotificationsQuery(enabled: boolean) {
  return useQuery<NotificationItem[], ApiErrorShape>({
    queryKey: notificationQueryKeys.list(),
    queryFn: getNotificationsRequest,
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadNotificationCountQuery() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.user));

  return useQuery<number, ApiErrorShape>({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: getUnreadNotificationCountRequest,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30_000 : false,
    refetchOnWindowFocus: true,
  });
}
