import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { NotificationItem } from "../notification.types";

export async function getNotificationsRequest(): Promise<NotificationItem[]> {
  return axiosClient
    .get<ApiResponse<{ notifications: NotificationItem[] }>>("/notifications")
    .then((res) => res.data.data!.notifications);
}

export async function getUnreadNotificationCountRequest(): Promise<number> {
  return axiosClient
    .get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count")
    .then((res) => res.data.data!.unreadCount);
}

export async function markNotificationAsReadRequest(
  notificationId: string,
): Promise<NotificationItem> {
  return axiosClient
    .patch<ApiResponse<NotificationItem>>(
      `/notifications/${notificationId}/read`,
    )
    .then((res) => res.data.data!);
}

export async function markAllNotificationsAsReadRequest(): Promise<void> {
  await axiosClient.patch<ApiResponse<void>>("/notifications/read-all");
}
