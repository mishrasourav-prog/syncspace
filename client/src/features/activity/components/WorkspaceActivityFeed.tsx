import { useMemo } from "react";
import type { Project } from "@/features/projects/types/project.types";
import { useWorkspaceActivitiesQuery } from "../hooks/useActivityQueries";
import { ActivityFeedList } from "./ActivityFeedList";

const INITIAL_VISIBLE = 8;

interface WorkspaceActivityFeedProps {
  workspaceId: string;
  projects: Project[];
}

export function WorkspaceActivityFeed({ workspaceId, projects }: WorkspaceActivityFeedProps) {
  const activitiesQuery = useWorkspaceActivitiesQuery(workspaceId);
  const activities = activitiesQuery.data ?? [];

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
      <ActivityFeedList
        headingId="activity-feed-heading"
        title="Activity"
        emptyMessage="No workspace activity yet."
        isLoading={activitiesQuery.isLoading}
        isError={activitiesQuery.isError}
        errorMessage={activitiesQuery.error?.message}
        onRetry={() => activitiesQuery.refetch()}
        activities={activities}
        initialVisible={INITIAL_VISIBLE}
        getSecondaryLabel={(activity) => projectNameById.get(activity.project) ?? null}
      />
    </section>
  );
}
