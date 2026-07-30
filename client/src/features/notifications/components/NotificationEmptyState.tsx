import { BellOff, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NotificationFilter } from "../notification.types";

const FILTER_EMPTY_COPY: Record<
  NotificationFilter,
  { title: string; description: string }
> = {
  all: {
    title: "You’re all caught up.",
    description: "No notifications are available yet.",
  },
  unread: { title: "You have no unread notifications.", description: "" },
  tasks: {
    title: "No task or issue notifications",
    description:
      "No task or issue notifications are in your latest notifications.",
  },
  discussions: {
    title: "No discussion notifications",
    description:
      "No discussion notifications are in your latest notifications.",
  },
  read: {
    title: "No read notifications",
    description: "No read notifications are in your latest notifications.",
  },
};

interface NotificationEmptyStateProps {
  filter: NotificationFilter;
  hasSearchQuery: boolean;
  onClear: () => void;
}

export function NotificationEmptyState({
  filter,
  hasSearchQuery,
  onClear,
}: NotificationEmptyStateProps) {
  if (hasSearchQuery) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
        <SearchX className="h-6 w-6 text-muted" />
        <p className="text-body">No notifications match your search.</p>
        <Button size="sm" variant="secondary" onClick={onClear}>
          Clear search
        </Button>
      </div>
    );
  }

  const copy = FILTER_EMPTY_COPY[filter];

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
      <BellOff className="h-6 w-6 text-muted" />
      <div>
        <p className="text-body font-medium text-foreground">{copy.title}</p>
        {copy.description && (
          <p className="mt-1 text-caption">{copy.description}</p>
        )}
      </div>
      {filter !== "all" && (
        <Button size="sm" variant="secondary" onClick={onClear}>
          Clear filter
        </Button>
      )}
    </div>
  );
}
