import {
  CheckCheck,
  Inbox,
  ListChecks,
  MessageSquare,
  MailOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationFilter } from "../notification.types";

interface FilterRow {
  id: NotificationFilter;
  label: string;
  icon: LucideIcon;
}

const PRIMARY_FILTERS: FilterRow[] = [
  { id: "all", label: "All", icon: Inbox },
  { id: "unread", label: "Unread", icon: MailOpen },
  { id: "tasks", label: "Tasks & Issues", icon: ListChecks },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
];

const SECONDARY_FILTERS: FilterRow[] = [
  { id: "read", label: "Read", icon: CheckCheck },
];

interface NotificationFilterRailProps {
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  counts: Record<NotificationFilter, number>;
}

function FilterButton({
  row,
  isActive,
  count,
  onClick,
}: {
  row: FilterRow;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  const Icon = row.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted hover:bg-border/30 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {row.id === "unread" && count > 0 && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
          aria-hidden
        />
      )}
      <span className="truncate">{row.label}</span>
      <span
        className={cn(
          "ml-auto rounded-md px-1.5 py-0.5 text-xs font-semibold",
          isActive ? "bg-primary/20 text-primary" : "bg-surface text-muted",
        )}
        title="Count within the latest loaded notifications"
      >
        {count}
      </span>
    </button>
  );
}

export function NotificationFilterRail({
  activeFilter,
  onFilterChange,
  counts,
}: NotificationFilterRailProps) {
  return (
    <nav
      aria-label="Notification filters"
      className="self-start rounded-xl border border-border bg-surface/60 p-2 shadow-soft xl:sticky xl:top-20"
    >
      <div className="space-y-0.5">
        {PRIMARY_FILTERS.map((row) => (
          <FilterButton
            key={row.id}
            row={row}
            isActive={activeFilter === row.id}
            count={counts[row.id]}
            onClick={() => onFilterChange(row.id)}
          />
        ))}
      </div>

      <div className="my-2 border-t border-border" />

      <div className="space-y-0.5">
        {SECONDARY_FILTERS.map((row) => (
          <FilterButton
            key={row.id}
            row={row}
            isActive={activeFilter === row.id}
            count={counts[row.id]}
            onClick={() => onFilterChange(row.id)}
          />
        ))}
      </div>
    </nav>
  );
}
