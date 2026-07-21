import { useState } from "react";
import { Lock, MessageSquare, Pin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { useProjectDiscussionsQuery } from "../hooks/useDiscussionQueries";

const INITIAL_VISIBLE = 5;

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

export function ProjectDiscussionsPreview({ projectId, search }: ProjectDiscussionsPreviewProps) {
  const discussionsQuery = useProjectDiscussionsQuery(projectId, search);
  const [showAll, setShowAll] = useState(false);

  const discussions = discussionsQuery.data?.discussions ?? [];
  const nextCursor = discussionsQuery.data?.nextCursor ?? null;
  const visibleDiscussions = showAll ? discussions : discussions.slice(0, INITIAL_VISIBLE);
  const hasMore = discussions.length > INITIAL_VISIBLE;

  const countLabel = nextCursor ? `${discussions.length}+` : discussions.length;

  return (
    <section
      id="discussions"
      aria-labelledby="project-discussions-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="project-discussions-heading" className="text-h3 text-foreground">
          Discussions
          {!discussionsQuery.isLoading && !discussionsQuery.isError && (
            <span className="ml-2 text-caption">{countLabel}</span>
          )}
        </h2>
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
          message={discussionsQuery.error?.message ?? "Unable to load discussions."}
          onRetry={() => discussionsQuery.refetch()}
        />
      )}

      {!discussionsQuery.isLoading && !discussionsQuery.isError && discussions.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-muted" />
          <p className="mt-2 text-body">{search ? "No discussions match your search." : "No discussions yet."}</p>
        </div>
      )}

      {!discussionsQuery.isLoading && !discussionsQuery.isError && discussions.length > 0 && (
        <div className="space-y-2">
          {visibleDiscussions.map((discussion) => (
            <div key={discussion._id} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                  {discussion.isPinned && <Pin className="h-3 w-3 shrink-0 text-warning" aria-hidden />}
                  {discussion.isLocked && <Lock className="h-3 w-3 shrink-0 text-muted" aria-hidden />}
                  <span className="truncate">{discussion.title}</span>
                </p>
                <p className="truncate text-caption">
                  {discussion.author?.name ?? "Unknown"} · {discussion.replyCount}{" "}
                  {discussion.replyCount === 1 ? "reply" : "replies"}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-muted">{formatRelativeTime(discussion.updatedAt)}</span>
            </div>
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="w-full rounded-lg py-2 text-center text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              {showAll ? "Show less" : "View all"}
            </button>
          )}

          {nextCursor && (
            <p className="pt-1 text-center text-[11px] text-muted/70">Showing the 50 most recent discussions.</p>
          )}
        </div>
      )}
    </section>
  );
}
