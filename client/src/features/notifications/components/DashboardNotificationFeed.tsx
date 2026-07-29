import { CheckCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { formatRelativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../hooks/useNotificationMutations";
import {
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from "../hooks/useNotificationQueries";
import { getNotificationDestination } from "../notification.navigation";
import { NotificationTypeIcon } from "./NotificationTypeIcon";

function NotificationRowSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
  );
}

export function DashboardNotificationFeed() {
  const navigate = useNavigate();
  const notificationsQuery = useNotificationsQuery(true);
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const markOneReadMutation = useMarkNotificationAsReadMutation();
  const markAllReadMutation = useMarkAllNotificationsAsReadMutation();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadCountQuery.data ?? 0;

  return (
    <section
      id="notifications"
      aria-labelledby="notification-feed-heading"
      className="flex max-h-[calc(100vh-7.5rem)] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface/60 shadow-soft lg:sticky lg:top-[6.5rem]"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 id="notification-feed-heading" className="text-h3 text-foreground">
          Notifications
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/notifications" className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
            View all
          </Link>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {notificationsQuery.isLoading && (
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <NotificationRowSkeleton key={index} />
            ))}
          </div>
        )}

        {notificationsQuery.isError && (
          <div className="p-4">
            <DashboardSectionError
              compact
              message={notificationsQuery.error?.message ?? "Unable to load notifications."}
              onRetry={() => notificationsQuery.refetch()}
            />
          </div>
        )}

        {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 && (
          <div className="px-4 py-10 text-center text-caption">You&apos;re all caught up.</div>
        )}

        {notifications.map((notification) => {
          const destination = getNotificationDestination(notification);

          return (
            <button
              key={notification._id}
              type="button"
              onClick={() => {
                if (!notification.isRead) {
                  markOneReadMutation.mutate(notification._id);
                }

                navigate(destination?.path ?? "/notifications");
              }}
              className={cn(
                "flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-border/20",
                !notification.isRead && "bg-primary/5"
              )}
            >
              {notification.actor ? (
                <Avatar src={notification.actor.avatar} name={notification.actor.name} size="sm" />
              ) : (
                <NotificationTypeIcon type={notification.type} className="h-8 w-8" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
                  {!notification.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{notification.message}</p>
                <p className="mt-1 text-[11px] text-muted/70">{formatRelativeTime(notification.createdAt)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
