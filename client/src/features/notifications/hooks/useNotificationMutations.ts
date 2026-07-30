import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiErrorShape } from "@/lib/axios";
import {
  markAllNotificationsAsReadRequest,
  markNotificationAsReadRequest,
} from "../api/notification.api";
import { notificationQueryKeys } from "../notification.queryKeys";
import type { NotificationItem } from "../notification.types";

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<NotificationItem, ApiErrorShape, string>({
    mutationFn: markNotificationAsReadRequest,
    onSuccess: (updatedNotification) => {
      const previousList = queryClient.getQueryData<NotificationItem[]>(
        notificationQueryKeys.list(),
      );
      const previousItem = previousList?.find(
        (notification) => notification._id === updatedNotification._id,
      );
      const transitionedFromUnread = previousItem?.isRead === false;

      queryClient.setQueryData<NotificationItem[]>(
        notificationQueryKeys.list(),
        (previous) =>
          previous?.map((notification) =>
            notification._id === updatedNotification._id
              ? updatedNotification
              : notification,
          ),
      );

      if (transitionedFromUnread) {
        queryClient.setQueryData<number>(
          notificationQueryKeys.unreadCount(),
          (previous) =>
            typeof previous === "number" ? Math.max(0, previous - 1) : previous,
        );
      }

      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
    },
    onError: (error) => {
      if (error.status === 404) {
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.list(),
        });
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.unreadCount(),
        });
      }

      toast.error(error.message ?? "Unable to mark this notification as read.");
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, void>({
    mutationFn: markAllNotificationsAsReadRequest,
    onSuccess: () => {
      queryClient.setQueryData<NotificationItem[]>(
        notificationQueryKeys.list(),
        (previous) =>
          previous?.map((notification) =>
            notification.isRead
              ? notification
              : { ...notification, isRead: true },
          ),
      );
      queryClient.setQueryData<number>(notificationQueryKeys.unreadCount(), 0);

      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() });
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
    },
    onError: (error) => {
      toast.error(error.message ?? "Unable to mark all notifications as read.");
    },
  });
}
