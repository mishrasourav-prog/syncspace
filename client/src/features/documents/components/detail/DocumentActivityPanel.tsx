import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRelativeTime } from "@/lib/date";
import { useProjectActivitiesQuery } from "@/features/activity/hooks/useActivityQueries";
import type { Activity } from "@/features/activity/types/activity.types";

const SUPPORTED_DOCUMENT_ACTIVITY = new Set(["document.created", "document.updated", "document.archived", "document.restored"]);

const ACTION_VERB: Record<string, string> = {
  "document.created": "created",
  "document.updated": "updated",
  "document.archived": "archived",
  "document.restored": "restored",
};

function describeActivity(activity: Activity): string {
  const verb = ACTION_VERB[activity.action] ?? "updated";
  const revision = activity.metadata?.revision;
  const revisionText = typeof revision === "number" ? ` this document to revision ${revision}` : " this document";
  return `${verb}${revisionText}.`;
}

interface DocumentActivityPanelProps {
  projectId: string;
  documentId: string;
}

export function DocumentActivityPanel({ projectId, documentId }: DocumentActivityPanelProps) {
  const activitiesQuery = useProjectActivitiesQuery(projectId);

  const documentActivities = (activitiesQuery.data ?? []).filter(
    (activity) =>
      activity.entityType === "document" && activity.entityId === documentId && SUPPORTED_DOCUMENT_ACTIVITY.has(activity.action)
  );

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <h2 className="text-h3 mb-1 text-foreground">Activity</h2>
      <p className="mb-3 text-[11px] text-muted/80">Recent document activity from the latest project events.</p>

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

      {!activitiesQuery.isLoading && !activitiesQuery.isError && documentActivities.length === 0 && (
        <p className="text-sm text-muted">No recent activity is available for this document.</p>
      )}

      {!activitiesQuery.isLoading && !activitiesQuery.isError && documentActivities.length > 0 && (
        <ul className="space-y-3">
          {documentActivities.map((activity) => (
            <li key={activity._id} className="flex gap-2.5">
              {activity.actor ? (
                <Avatar src={activity.actor.avatar} name={activity.actor.name} size="sm" />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-border/50 text-[10px] text-muted">
                  ?
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.actor?.name ?? "Unavailable member"}</span>{" "}
                  <span className="text-muted">{describeActivity(activity)}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted/70" title={formatDateTime(activity.createdAt)}>
                  {formatRelativeTime(activity.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
