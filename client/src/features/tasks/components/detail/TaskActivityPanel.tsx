import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRelativeTime } from "@/lib/date";
import {
  getActivityActionCopy,
  getActivityActionIcon,
  getActivityStatusChange,
} from "@/features/activity/activity.display";
import { useProjectActivitiesQuery } from "@/features/activity/hooks/useActivityQueries";

interface TaskActivityPanelProps {
  projectId: string;
  taskId: string;
}

const SUPPORTED_TASK_ACTIVITY = new Set([
  "task.created",
  "task.status_changed",
]);

export function TaskActivityPanel({
  projectId,
  taskId,
}: TaskActivityPanelProps) {
  const activitiesQuery = useProjectActivitiesQuery(projectId);
  const taskActivities = (activitiesQuery.data ?? []).filter(
    (activity) =>
      activity.entityType === "task" &&
      activity.entityId === taskId &&
      SUPPORTED_TASK_ACTIVITY.has(activity.action),
  );

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <h2 className="text-h3 mb-1 text-foreground">Activity</h2>
      <p className="mb-3 text-[11px] text-muted/80">
        Recent task activity from the latest project events.
      </p>

      {activitiesQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-2.5">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activitiesQuery.isError && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Unable to load activity.</span>
          <button
            type="button"
            onClick={() => void activitiesQuery.refetch()}
            className="font-medium text-primary hover:text-primary/80"
          >
            Retry
          </button>
        </div>
      )}

      {!activitiesQuery.isLoading &&
        !activitiesQuery.isError &&
        taskActivities.length === 0 && (
          <p className="text-sm text-muted">
            No recent activity is available for this task.
          </p>
        )}

      {!activitiesQuery.isLoading &&
        !activitiesQuery.isError &&
        taskActivities.length > 0 && (
          <ul className="space-y-3">
            {taskActivities.map((activity) => {
              const Icon = getActivityActionIcon(activity.action);
              const statusChange = getActivityStatusChange(activity);

              return (
                <li key={activity._id} className="flex gap-2.5">
                  {activity.actor ? (
                    <Avatar
                      src={activity.actor.avatar}
                      name={activity.actor.name}
                      size="sm"
                    />
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-border/50 text-muted">
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
                    </p>
                    {statusChange && (
                      <p className="mt-0.5 text-xs text-muted">
                        {statusChange}
                      </p>
                    )}
                    <p
                      className="mt-0.5 text-[11px] text-muted/70"
                      title={formatDateTime(activity.createdAt)}
                    >
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
    </section>
  );
}
