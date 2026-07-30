import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationListItem } from "./NotificationListItem";
import type {
  NotificationFilter,
  NotificationItem,
  NotificationSort,
} from "../notification.types";

const FILTER_LABELS: Record<NotificationFilter, string> = {
  all: "All Notifications",
  unread: "Unread Notifications",
  tasks: "Task & Issue Notifications",
  discussions: "Discussion Notifications",
  read: "Read Notifications",
};

interface NotificationListPanelProps {
  filter: NotificationFilter;
  sort: NotificationSort;
  onSortChange: (sort: NotificationSort) => void;
  visibleNotifications: NotificationItem[];
  totalLoadedCount: number;
  hasSearchQuery: boolean;
  selectedId: string | null;
  onSelect: (notification: NotificationItem) => void;
  onClearSearchOrFilter: () => void;
}

export function NotificationListPanel({
  filter,
  sort,
  onSortChange,
  visibleNotifications,
  totalLoadedCount,
  hasSearchQuery,
  selectedId,
  onSelect,
  onClearSearchOrFilter,
}: NotificationListPanelProps) {
  return (
    <section
      aria-label="Notification list"
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface/60 shadow-soft"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-h3 text-foreground">{FILTER_LABELS[filter]}</h2>
          <p className="text-caption" aria-live="polite">
            {visibleNotifications.length}{" "}
            {visibleNotifications.length === 1
              ? "notification"
              : "notifications"}{" "}
            shown
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-auto gap-1.5 px-2.5 text-xs"
            aria-label="Sort notifications"
          >
            {sort === "newest" ? (
              <ArrowDownAZ className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpAZ className="h-3.5 w-3.5" />
            )}
            {sort === "newest" ? "Newest first" : "Oldest first"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortChange("newest")}>
              Newest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("oldest")}>
              Oldest first
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleNotifications.length === 0 ? (
          <NotificationEmptyState
            filter={filter}
            hasSearchQuery={hasSearchQuery}
            onClear={onClearSearchOrFilter}
          />
        ) : (
          <ul role="list">
            {visibleNotifications.map((notification) => (
              <li key={notification._id}>
                <NotificationListItem
                  notification={notification}
                  isSelected={selectedId === notification._id}
                  onSelect={() => onSelect(notification)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalLoadedCount > 0 && (
        <div className="shrink-0 border-t border-border px-4 py-2.5 text-center text-caption">
          {totalLoadedCount >= 50 ? (
            <span>
              Showing your latest 50 notifications. Older notifications are not
              available through the current API.
            </span>
          ) : (
            <span>Showing the latest {totalLoadedCount} notifications.</span>
          )}
        </div>
      )}
    </section>
  );
}
