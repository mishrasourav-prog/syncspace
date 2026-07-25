import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiErrorShape } from "@/lib/axios";
import type { Project } from "@/features/projects/types/project.types";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";
import {
  canCreateReply,
  canDeleteReply,
  canEditReply,
} from "../../discussion.permissions";
import type {
  Discussion,
  DiscussionReply,
  DiscussionReplyListResult,
  DiscussionUserPreview,
} from "../../types/discussion.types";
import { DiscussionReplyComposer } from "./DiscussionReplyComposer";
import { DiscussionReplyItem } from "./DiscussionReplyItem";

interface DiscussionRepliesPanelProps {
  projectId: string;
  discussion: Discussion;
  project: Project;
  workspace: WorkspaceSummary;
  role: ProjectRole | undefined;
  currentUser: DiscussionUserPreview | undefined;
  repliesQuery: UseInfiniteQueryResult<
    InfiniteData<DiscussionReplyListResult>,
    ApiErrorShape
  >;
  replies: DiscussionReply[];
}

export function DiscussionRepliesPanel({
  projectId,
  discussion,
  project,
  workspace,
  role,
  currentUser,
  repliesQuery,
  replies,
}: DiscussionRepliesPanelProps) {
  const hasMore = repliesQuery.hasNextPage ?? false;
  const canReply = canCreateReply(discussion, project, workspace, role);

  const disabledReason = discussion.isLocked
    ? "This discussion is locked. New replies can't be added."
    : project.isArchived
      ? "This project is archived. This discussion is read-only."
      : workspace.isArchived
        ? "This workspace is archived. This discussion is read-only."
        : "You don't have permission to reply to this discussion.";

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 text-foreground">Replies</h2>
          <span className="rounded-full bg-border/50 px-2 py-0.5 text-[11px] font-medium text-muted">
            {discussion.replyCount}
          </span>
        </div>
        <span className="text-[11px] font-medium text-muted/80">
          Oldest first
        </span>
      </div>

      {repliesQuery.isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {repliesQuery.isError && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>
            {repliesQuery.error?.message ?? "Unable to load replies."}
          </span>
          <button
            type="button"
            onClick={() => void repliesQuery.refetch()}
            className="font-medium text-primary hover:text-primary/80"
          >
            Retry
          </button>
        </div>
      )}

      {!repliesQuery.isLoading &&
        !repliesQuery.isError &&
        replies.length === 0 && (
          <p className="text-sm text-muted">
            {canReply ? "No replies yet. Be the first to reply." : "No replies yet."}
          </p>
        )}

      {!repliesQuery.isError && replies.length > 0 && (
        <div className="divide-y divide-border/60">
          {replies.map((reply) => (
            <DiscussionReplyItem
              key={reply._id}
              projectId={projectId}
              discussionId={discussion._id}
              reply={reply}
              canEdit={canEditReply(
                reply,
                discussion,
                project,
                workspace,
                currentUser?._id
              )}
              canDelete={canDeleteReply(
                reply,
                project,
                workspace,
                role,
                currentUser?._id
              )}
            />
          ))}
        </div>
      )}

      {!repliesQuery.isError && hasMore && (
        <div className="mt-3 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void repliesQuery.fetchNextPage()}
            disabled={repliesQuery.isFetchingNextPage}
          >
            {repliesQuery.isFetchingNextPage
              ? "Loading..."
              : "Load more replies"}
          </Button>
        </div>
      )}

      <div className="mt-5 border-t border-border/60 pt-5">
        <DiscussionReplyComposer
          projectId={projectId}
          discussionId={discussion._id}
          currentUser={currentUser}
          disabled={!canReply}
          disabledMessage={disabledReason}
        />
      </div>
    </section>
  );
}
