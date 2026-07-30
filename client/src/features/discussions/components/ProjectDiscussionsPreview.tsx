import { Link, useParams } from "react-router-dom";
import { Lock, MessageSquare, Pin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { useProjectDiscussionsQuery } from "../hooks/useDiscussionQueries";

const PREVIEW_LIMIT = 5;

function DiscussionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

interface ProjectDiscussionsPreviewProps {
  projectId: string;
  search: string;
}

export function ProjectDiscussionsPreview({
  projectId,
  search,
}: ProjectDiscussionsPreviewProps) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const discussionsQuery = useProjectDiscussionsQuery(projectId, search);
  const discussionsPath = `/workspaces/${workspaceId}/projects/${projectId}/discussions`;

  const discussions = discussionsQuery.data?.discussions ?? [];
  const nextCursor = discussionsQuery.data?.nextCursor ?? null;
  const visibleDiscussions = discussions.slice(0, PREVIEW_LIMIT);
  const countLabel = nextCursor ? `${discussions.length}+` : discussions.length;

  return (
    <section
      id="discussions"
      aria-labelledby="project-discussions-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          id="project-discussions-heading"
          className="text-h3 text-foreground"
        >
          Discussions
          {!discussionsQuery.isLoading && !discussionsQuery.isError && (
            <span className="ml-2 text-caption">{countLabel}</span>
          )}
        </h2>
        <Link
          to={discussionsPath}
          className="shrink-0 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
        </Link>
      </div>

      {discussionsQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <DiscussionRowSkeleton key={index} />
          ))}
        </div>
      )}

      {discussionsQuery.isError && (
        <DashboardSectionError
          message={
            discussionsQuery.error?.message ?? "Unable to load discussions."
          }
          onRetry={() => discussionsQuery.refetch()}
        />
      )}

      {!discussionsQuery.isLoading &&
        !discussionsQuery.isError &&
        discussions.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
            <MessageSquare className="mx-auto h-6 w-6 text-muted" />
            <p className="mt-2 text-body">
              {search
                ? "No discussions match your search."
                : "No discussions yet."}
            </p>
          </div>
        )}

      {!discussionsQuery.isLoading &&
        !discussionsQuery.isError &&
        visibleDiscussions.length > 0 && (
          <div className="space-y-2">
            {visibleDiscussions.map((discussion) => (
              <Link
                key={discussion._id}
                to={`${discussionsPath}/${discussion._id}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:bg-surface/70"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                    {discussion.isPinned && (
                      <Pin
                        className="h-3 w-3 shrink-0 text-warning"
                        aria-label="Pinned"
                      />
                    )}
                    {discussion.isLocked && (
                      <Lock
                        className="h-3 w-3 shrink-0 text-muted"
                        aria-label="Locked"
                      />
                    )}
                    <span className="truncate">{discussion.title}</span>
                  </p>
                  <p className="truncate text-caption">
                    {discussion.author?.name ?? "Former member"} ·{" "}
                    {discussion.replyCount}{" "}
                    {discussion.replyCount === 1 ? "reply" : "replies"}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted">
                  {formatRelativeTime(discussion.updatedAt)}
                </span>
              </Link>
            ))}

            {(discussions.length > PREVIEW_LIMIT || nextCursor) && (
              <p className="pt-1 text-center text-[11px] text-muted/70">
                Open Discussions to browse the complete cursor-paginated list.
              </p>
            )}
          </div>
        )}
    </section>
  );
}
