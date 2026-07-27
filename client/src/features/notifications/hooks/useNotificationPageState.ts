import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  matchesNotificationFilter,
  matchesNotificationSearch,
} from "../notification.display";
import type {
  NotificationFilter,
  NotificationItem,
  NotificationSort,
} from "../notification.types";

const VALID_FILTERS: readonly NotificationFilter[] = [
  "all",
  "unread",
  "tasks",
  "discussions",
  "read",
];
const VALID_SORTS: readonly NotificationSort[] = ["newest", "oldest"];

function parseFilter(value: string | null): NotificationFilter {
  return (VALID_FILTERS as readonly string[]).includes(value ?? "")
    ? (value as NotificationFilter)
    : "all";
}

function parseSort(value: string | null): NotificationSort {
  return (VALID_SORTS as readonly string[]).includes(value ?? "")
    ? (value as NotificationSort)
    : "newest";
}

export interface UseNotificationPageStateResult {
  q: string;
  filter: NotificationFilter;
  sort: NotificationSort;
  selectedId: string | null;
  visibleNotifications: NotificationItem[];
  selectedNotification: NotificationItem | null;
  setQuery: (value: string) => void;
  setFilter: (value: NotificationFilter) => void;
  setSort: (value: NotificationSort) => void;
  selectNotification: (id: string | null) => void;
  clearSelection: () => void;
}

export function useNotificationPageState(
  notifications: NotificationItem[],
  isDesktopMasterDetail: boolean
): UseNotificationPageStateResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const filter = parseFilter(searchParams.get("filter"));
  const sort = parseSort(searchParams.get("sort"));
  const selectedId = searchParams.get("selected");

  const visibleNotifications = useMemo(() => {
    const filtered = notifications.filter(
      (notification) =>
        matchesNotificationFilter(notification, filter) &&
        matchesNotificationSearch(notification, q)
    );

    return [...filtered].sort((a, b) => {
      const difference =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      return sort === "newest" ? -difference : difference;
    });
  }, [filter, notifications, q, sort]);

  const selectedNotification = useMemo(
    () =>
      selectedId
        ? notifications.find((notification) => notification._id === selectedId) ?? null
        : null,
    [notifications, selectedId]
  );

  const updateParams = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setQuery = useCallback(
    (value: string) => {
      const constrained = value.slice(0, 200);
      updateParams((next) => {
        if (constrained) next.set("q", constrained);
        else next.delete("q");
      });
    },
    [updateParams]
  );

  const setFilter = useCallback(
    (value: NotificationFilter) => {
      updateParams((next) => {
        if (value === "all") next.delete("filter");
        else next.set("filter", value);
      });
    },
    [updateParams]
  );

  const setSort = useCallback(
    (value: NotificationSort) => {
      updateParams((next) => {
        if (value === "newest") next.delete("sort");
        else next.set("sort", value);
      });
    },
    [updateParams]
  );

  const selectNotification = useCallback(
    (id: string | null) => {
      updateParams((next) => {
        if (id) next.set("selected", id);
        else next.delete("selected");
      });
    },
    [updateParams]
  );

  const clearSelection = useCallback(() => {
    updateParams((next) => {
      next.delete("selected");
    });
  }, [updateParams]);

  useEffect(() => {
    const selectedExists = selectedId
      ? notifications.some((notification) => notification._id === selectedId)
      : false;

    if (selectedId && !selectedExists) {
      clearSelection();
      return;
    }

    if (!isDesktopMasterDetail) return;

    const selectedIsVisible = selectedId
      ? visibleNotifications.some((notification) => notification._id === selectedId)
      : false;

    if (selectedIsVisible) return;

    const fallback = visibleNotifications[0];
    if (fallback) {
      selectNotification(fallback._id);
    } else if (selectedId) {
      clearSelection();
    }
  }, [
    clearSelection,
    isDesktopMasterDetail,
    notifications,
    selectNotification,
    selectedId,
    visibleNotifications,
  ]);

  return {
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
  };
}
