import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import {
  getActivityActionCopy,
  getActivityActionIcon,
  getActivityEntityTitle,
  getActivityStatusChange,
} from "../activity.display";
import type { Activity } from "../types/activity.types";

function ActivityRowSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

interface ActivityFeedListProps {
  headingId: string;
  title: string;
  emptyMessage: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  activities: Activity[];
  initialVisible: number;

  getSecondaryLabel?: (activity: Activity) => string | null;
}

export function ActivityFeedList({
  headingId,
  title,
  emptyMessage,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  activities,
  initialVisible,
  getSecondaryLabel,
}: ActivityFeedListProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleActivities = showAll
    ? activities
    : activities.slice(0, initialVisible);
  const hasMore = activities.length > initialVisible;

  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h2 id={headingId} className="text-h3 text-foreground">
          {title}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <div>
            {Array.from({ length: 6 }).map((_, index) => (
              <ActivityRowSkeleton key={index} />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-4">
            <DashboardSectionError
              compact
              message={errorMessage ?? "Unable to load activity."}
              onRetry={onRetry}
            />
          </div>
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <div className="px-4 py-10 text-center text-caption">
            {emptyMessage}
          </div>
        )}

        {visibleActivities.map((activity) => {
          const Icon = getActivityActionIcon(activity.action);
          const entityTitle = getActivityEntityTitle(activity);
          const statusChange = getActivityStatusChange(activity);
          const secondaryLabel = getSecondaryLabel?.(activity) ?? null;

          return (
            <div
              key={activity._id}
              className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0"
            >
              {activity.actor ? (
                <Avatar
                  src={activity.actor.avatar}
                  name={activity.actor.name}
                  size="sm"
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border/50 text-muted">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-medium">
                    {activity.actor?.name ?? "System"}
                  </span>{" "}
                  <span className="text-muted">
                    {getActivityActionCopy(activity.action)}
                  </span>
                  {entityTitle && (
                    <span className="font-medium"> {entityTitle}</span>
                  )}
                </p>
                {statusChange && (
                  <p className="mt-0.5 text-xs text-muted">{statusChange}</p>
                )}
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted/70">
                  {secondaryLabel && (
                    <span className="truncate">{secondaryLabel}</span>
                  )}
                  {secondaryLabel && <span aria-hidden>·</span>}
                  <span>{formatRelativeTime(activity.createdAt)}</span>
                </p>
              </div>
            </div>
          );
        })}

        {!isLoading && !isError && hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="w-full py-3 text-center text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            {showAll ? "Show less" : `View all ${activities.length} activity`}
          </button>
        )}
      </div>
    </>
  );
}
