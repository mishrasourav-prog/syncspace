import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CheckSquare,
  FileText,
  Lock,
  MessageSquare,
  Pin,
  Reply,
  Unlock,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import type { Project } from "@/features/projects/types/project.types";
import { useWorkspaceActivitiesQuery } from "../hooks/useActivityQueries";
import type { Activity, ActivityAction } from "../types/activity.types";

const INITIAL_VISIBLE = 8;

const ACTION_COPY: Record<ActivityAction, string> = {
  "task.created": "created a task",
  "task.status_changed": "changed task status",
  "document.created": "created a document",
  "document.updated": "updated a document",
  "document.archived": "archived a document",
  "document.restored": "restored a document",
  "discussion.created": "started a discussion",
  "discussion.updated": "updated a discussion",
  "discussion.deleted": "deleted a discussion",
  "discussion.pinned": "pinned a discussion",
  "discussion.unpinned": "unpinned a discussion",
  "discussion.locked": "locked a discussion",
  "discussion.unlocked": "unlocked a discussion",
  "discussion.reply_created": "replied to a discussion",
  "discussion.reply_updated": "updated a discussion reply",
  "discussion.reply_deleted": "deleted a discussion reply",
};

const ACTION_ICONS: Partial<Record<ActivityAction, LucideIcon>> = {
  "task.created": CheckSquare,
  "task.status_changed": CheckSquare,
  "document.created": FileText,
  "document.updated": FileText,
  "document.archived": FileText,
  "document.restored": FileText,
  "discussion.created": MessageSquare,
  "discussion.updated": MessageSquare,
  "discussion.deleted": MessageSquare,
  "discussion.pinned": Pin,
  "discussion.unpinned": Pin,
  "discussion.locked": Lock,
  "discussion.unlocked": Unlock,
  "discussion.reply_created": Reply,
  "discussion.reply_updated": Reply,
  "discussion.reply_deleted": Reply,
};

function getActionCopy(action: string): string {
  return ACTION_COPY[action as ActivityAction] ?? "made an update";
}

function getActionIcon(action: string): LucideIcon {
  return ACTION_ICONS[action as ActivityAction] ?? Zap;
}

function getEntityTitle(activity: Activity): string | null {
  const title = activity.metadata?.title ?? activity.metadata?.name;
  return typeof title === "string" && title.trim().length > 0 ? title : null;
}

function getStatusChange(activity: Activity): string | null {
  if (activity.action !== "task.status_changed") return null;
  const previous = activity.metadata?.previousStatus;
  const current = activity.metadata?.currentStatus;
  if (typeof previous === "string" && typeof current === "string") {
    return `${previous} → ${current}`;
  }
  return null;
}

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

interface WorkspaceActivityFeedProps {
  workspaceId: string;
  projects: Project[];
}

export function WorkspaceActivityFeed({ workspaceId, projects }: WorkspaceActivityFeedProps) {
  const activitiesQuery = useWorkspaceActivitiesQuery(workspaceId);
  const [showAll, setShowAll] = useState(false);

  const activities = activitiesQuery.data ?? [];
  const visibleActivities = showAll ? activities : activities.slice(0, INITIAL_VISIBLE);
  const hasMore = activities.length > INITIAL_VISIBLE;

  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const project of projects) map.set(project._id, project.name);
    return map;
  }, [projects]);

  return (
    <section
      id="activity"
      aria-labelledby="activity-feed-heading"
      className="flex max-h-[calc(100vh-7.5rem)] scroll-mt-24 flex-col overflow-hidden rounded-xl border border-border bg-surface/60 shadow-soft xl:sticky xl:top-[6.5rem]"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h2 id="activity-feed-heading" className="text-h3 text-foreground">
          Activity
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activitiesQuery.isLoading && (
          <div>
            {Array.from({ length: 6 }).map((_, index) => (
              <ActivityRowSkeleton key={index} />
            ))}
          </div>
        )}

        {activitiesQuery.isError && (
          <div className="p-4">
            <DashboardSectionError
              compact
              message={activitiesQuery.error?.message ?? "Unable to load activity."}
              onRetry={() => activitiesQuery.refetch()}
            />
          </div>
        )}

        {!activitiesQuery.isLoading && !activitiesQuery.isError && activities.length === 0 && (
          <div className="px-4 py-10 text-center text-caption">No workspace activity yet.</div>
        )}

        {visibleActivities.map((activity) => {
          const Icon = getActionIcon(activity.action);
          const entityTitle = getEntityTitle(activity);
          const statusChange = getStatusChange(activity);
          const projectName = projectNameById.get(activity.project);

          return (
            <div key={activity._id} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0">
              {activity.actor ? (
                <Avatar src={activity.actor.avatar} name={activity.actor.name} size="sm" />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border/50 text-muted">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.actor?.name ?? "System"}</span>{" "}
                  <span className="text-muted">{getActionCopy(activity.action)}</span>
                  {entityTitle && <span className="font-medium"> {entityTitle}</span>}
                </p>
                {statusChange && <p className="mt-0.5 text-xs text-muted">{statusChange}</p>}
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted/70">
                  {projectName && <span className="truncate">{projectName}</span>}
                  {projectName && <span aria-hidden>·</span>}
                  <span>{formatRelativeTime(activity.createdAt)}</span>
                </p>
              </div>
            </div>
          );
        })}

        {!activitiesQuery.isLoading && !activitiesQuery.isError && hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="w-full py-3 text-center text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            {showAll ? "Show less" : `View all ${activities.length} activity`}
          </button>
        )}
      </div>
    </section>
  );
}
