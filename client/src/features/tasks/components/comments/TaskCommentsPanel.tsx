import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTaskCommentsQuery } from "../../hooks/useTaskCommentQueries";
import type { Task } from "../../types/task.types";
import { TaskCommentComposer } from "./TaskCommentComposer";
import { TaskCommentItem } from "./TaskCommentItem";
import {
  canCreateComment,
  canDeleteComment,
  canEditComment,
} from "../../task.permissions";
import type { Project } from "@/features/projects/types/project.types";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";

interface TaskCommentsPanelProps {
  projectId: string;
  task: Task;
  project: Project;
  workspace: WorkspaceSummary;
  role: ProjectRole | undefined;
  currentUserId: string | undefined;
}

export function TaskCommentsPanel({
  projectId,
  task,
  project,
  workspace,
  role,
  currentUserId,
}: TaskCommentsPanelProps) {
  const commentsQuery = useTaskCommentsQuery(projectId, task._id);

  const comments = commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [];
  const loadedCount = comments.length;
  const hasMore = commentsQuery.hasNextPage ?? false;

  const canComment = canCreateComment(task, project, workspace, role);
  const disabledReason = task.isArchived
    ? "This task is archived and read-only. Comments cannot be added."
    : project.isArchived
      ? "This project is archived. This task is read-only."
      : workspace.isArchived
        ? "This workspace is archived. This task is read-only."
        : "You don't have permission to comment on this task.";

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-h3 text-foreground">Comments</h2>
        <span className="rounded-full bg-border/50 px-2 py-0.5 text-[11px] font-medium text-muted">
          {hasMore ? `${loadedCount}+` : loadedCount}
        </span>
      </div>

      <div className="mb-5">
        <TaskCommentComposer
          projectId={projectId}
          taskId={task._id}
          canComment={canComment}
          disabledReason={disabledReason}
        />
      </div>

      {commentsQuery.isLoading && (
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

      {commentsQuery.isError && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>{commentsQuery.error?.message ?? "Unable to load comments."}</span>
          <button
            type="button"
            onClick={() => void commentsQuery.refetch()}
            className="font-medium text-primary hover:text-primary/80"
          >
            Retry
          </button>
        </div>
      )}

      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && (
        <p className="text-sm text-muted">No comments yet. Start the conversation.</p>
      )}

      {!commentsQuery.isError && comments.length > 0 && (
        <div className="divide-y divide-border/60">
          {comments.map((comment) => (
            <TaskCommentItem
              key={comment._id}
              projectId={projectId}
              taskId={task._id}
              comment={comment}
              canEdit={canEditComment(comment, task, project, workspace, currentUserId)}
              canDelete={canDeleteComment(
                comment,
                task,
                project,
                workspace,
                role,
                currentUserId
              )}
            />
          ))}
        </div>
      )}

      {!commentsQuery.isError && hasMore && (
        <div className="mt-3 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void commentsQuery.fetchNextPage()}
            disabled={commentsQuery.isFetchingNextPage}
          >
            {commentsQuery.isFetchingNextPage ? "Loading..." : "Load more comments"}
          </Button>
        </div>
      )}
    </section>
  );
}
