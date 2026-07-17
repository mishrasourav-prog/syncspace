import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { markAllNotificationsAsReadRequest, markNotificationAsReadRequest } from "../api/notification.api";
import { notificationQueryKeys } from "../notification.queryKeys";
import type { NotificationItem } from "../notification.types";

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<NotificationItem, ApiErrorShape, string>({
    mutationFn: markNotificationAsReadRequest,
    onSuccess: (updatedNotification) => {
      queryClient.setQueryData<NotificationItem[]>(notificationQueryKeys.list(), (previous) =>
        previous?.map((notification) =>
          notification._id === updatedNotification._id ? updatedNotification : notification
        )
      );
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, void>({
    mutationFn: markAllNotificationsAsReadRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });
    },
  });
}
