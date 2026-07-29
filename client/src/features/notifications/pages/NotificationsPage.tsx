import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/features/discussions/hooks/useMediaQuery";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { useNotificationsQuery, useUnreadNotificationCountQuery } from "../hooks/useNotificationQueries";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../hooks/useNotificationMutations";
import { useNotificationPageState } from "../hooks/useNotificationPageState";
import { matchesNotificationFilter } from "../notification.display";
import { getNotificationDestination } from "../notification.navigation";
import { NotificationPageHeader } from "../components/NotificationPageHeader";
import { NotificationFilterRail } from "../components/NotificationFilterRail";
import { NotificationListPanel } from "../components/NotificationListPanel";
import { NotificationDetailPanel } from "../components/NotificationDetailPanel";
import { NotificationPageSkeleton } from "../components/NotificationPageSkeleton";
import type { NotificationFilter, NotificationItem } from "../notification.types";

const FILTER_ORDER: NotificationFilter[] = ["all", "unread", "tasks", "discussions", "read"];

export function NotificationsPage() {
  const navigate = useNavigate();
  const isDesktopThreeColumn = useMediaQuery("(min-width: 1280px)");

  const notificationsQuery = useNotificationsQuery(true);
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const markOneReadMutation = useMarkNotificationAsReadMutation();
  const markAllReadMutation = useMarkAllNotificationsAsReadMutation();

  const notifications = useMemo(() => notificationsQuery.data ?? [], [notificationsQuery.data]);

  const {
    q,
    filter,
    sort,
    selectedId,
    visibleNotifications,
    selectedNotification,
    setQuery,
    setFilter,
    setSort,
    selectNotification,
    clearSelection,
  } = useNotificationPageState(notifications, isDesktopThreeColumn);

  const counts = useMemo(() => {
    const result = {} as Record<NotificationFilter, number>;
    for (const candidateFilter of FILTER_ORDER) {
      result[candidateFilter] = notifications.filter((notification) =>
        matchesNotificationFilter(notification, candidateFilter)
      ).length;
    }
    return result;
  }, [notifications]);

  const unreadCount = unreadCountQuery.data ?? 0;

  function handleRefresh() {
    notificationsQuery.refetch();
    unreadCountQuery.refetch();
  }

  function handleClearSearchOrFilter() {
    if (q) setQuery("");
    else if (filter !== "all") setFilter("all");
  }

  function handleNotificationSelect(notification: NotificationItem) {
    if (!notification.isRead) {
      markOneReadMutation.mutate(notification._id);
    }

    const destination = getNotificationDestination(notification);
    if (destination) {
      navigate(destination.path);
      return;
    }

    selectNotification(notification._id);
  }

  const showMobileDetail = !isDesktopThreeColumn && Boolean(selectedId);

  if (notificationsQuery.isLoading) {
    return <NotificationPageSkeleton />;
  }

  if (notificationsQuery.isError) {
    return (
      <div className="space-y-6">
        <NotificationPageHeader
          unreadCount={unreadCount}
          onMarkAllRead={() => markAllReadMutation.mutate()}
          isMarkingAllRead={markAllReadMutation.isPending}
          onRefresh={handleRefresh}
          isRefreshing={notificationsQuery.isFetching}
        />
        <DashboardSectionError
          message={notificationsQuery.error?.message ?? "Unable to load notifications."}
          onRetry={() => notificationsQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <NotificationPageHeader
        unreadCount={unreadCount}
        onMarkAllRead={() => markAllReadMutation.mutate()}
        isMarkingAllRead={markAllReadMutation.isPending}
        onRefresh={handleRefresh}
        isRefreshing={notificationsQuery.isFetching}
      />

      {unreadCountQuery.isError && (
        <p className="text-caption text-danger">Unread count is temporarily unavailable.</p>
      )}

      {showMobileDetail ? (
        <div>
          <Button size="sm" variant="ghost" onClick={clearSelection} className="mb-3 !px-2">
            <ArrowLeft className="h-4 w-4" />
            Back to notifications
          </Button>
          <NotificationDetailPanel
            notification={selectedNotification}
            onMarkAsRead={(id) => markOneReadMutation.mutate(id)}
            isMarkingAsRead={markOneReadMutation.isPending}
            onNavigate={(path) => navigate(path)}
          />
        </div>
      ) : (
        <div
          className={
            isDesktopThreeColumn
              ? "grid items-start grid-cols-[230px_minmax(420px,1fr)_380px] gap-4"
              : "grid grid-cols-1 gap-4"
          }
        >
          <NotificationFilterRail activeFilter={filter} onFilterChange={setFilter} counts={counts} />

          <NotificationListPanel
            filter={filter}
            sort={sort}
            onSortChange={setSort}
            visibleNotifications={visibleNotifications}
            totalLoadedCount={notifications.length}
            hasSearchQuery={Boolean(q)}
            selectedId={selectedId}
            onSelect={handleNotificationSelect}
            onClearSearchOrFilter={handleClearSearchOrFilter}
          />

          {isDesktopThreeColumn && (
            <NotificationDetailPanel
              notification={selectedNotification}
              onMarkAsRead={(id) => markOneReadMutation.mutate(id)}
              isMarkingAsRead={markOneReadMutation.isPending}
              onNavigate={(path) => navigate(path)}
            />
          )}
        </div>
      )}
    </main>
  );
}
