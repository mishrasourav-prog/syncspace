import { useProjectActivitiesQuery } from "../hooks/useActivityQueries";
import { ActivityFeedList } from "./ActivityFeedList";

const INITIAL_VISIBLE = 8;

interface ProjectActivityFeedProps {
  projectId: string;
}

export function ProjectActivityFeed({ projectId }: ProjectActivityFeedProps) {
  const activitiesQuery = useProjectActivitiesQuery(projectId);
  const activities = activitiesQuery.data ?? [];

  return (
    <section
      id="activity"
      aria-labelledby="project-activity-feed-heading"
      className="flex max-h-[calc(100vh-7.5rem)] scroll-mt-24 flex-col overflow-hidden rounded-xl border border-border bg-surface/60 shadow-soft xl:sticky xl:top-[6.5rem]"
    >
      <ActivityFeedList
        headingId="project-activity-feed-heading"
        title="Activity"
        emptyMessage="No project activity yet."
        isLoading={activitiesQuery.isLoading}
        isError={activitiesQuery.isError}
        errorMessage={activitiesQuery.error?.message}
        onRetry={() => activitiesQuery.refetch()}
        activities={activities}
        initialVisible={INITIAL_VISIBLE}
      />
    </section>
  );
}
