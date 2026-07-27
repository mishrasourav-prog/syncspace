import { CheckCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationPageHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  isMarkingAllRead: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function NotificationPageHeader({
  unreadCount,
  onMarkAllRead,
  isMarkingAllRead,
  onRefresh,
  isRefreshing,
}: NotificationPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-h2 text-foreground">Notifications</h1>
        <p className="mt-1 text-body text-muted">Stay updated with activity from your tasks, issues, and discussions.</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {unreadCount > 0 && (
          <Button size="sm" variant="secondary" onClick={onMarkAllRead} disabled={isMarkingAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}

        <Button size="sm" variant="secondary" onClick={onRefresh} disabled={isRefreshing} aria-label="Refresh notifications">
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </header>
  );
}
