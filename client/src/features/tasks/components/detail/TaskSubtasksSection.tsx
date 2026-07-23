import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "../../task.filters";
import type { Task } from "../../types/task.types";

interface TaskSubtasksSectionProps {
  subtasks: Task[];
  workspaceId: string;
  projectId: string;
  canToggleStatus: boolean;
  canCreateSubtask: boolean;
  isLoading: boolean;
  isError: boolean;
  isUpdatingStatus: boolean;
  pendingSubtaskId?: string;
  onRetry: () => void;
  onToggleComplete: (subtask: Task) => void;
  onAddSubtask: () => void;
}

export function TaskSubtasksSection({
  subtasks,
  workspaceId,
  projectId,
  canToggleStatus,
  canCreateSubtask,
  isLoading,
  isError,
  isUpdatingStatus,
  pendingSubtaskId,
  onRetry,
  onToggleComplete,
  onAddSubtask,
}: TaskSubtasksSectionProps) {
  const completedCount = subtasks.filter((subtask) => subtask.status === "DONE").length;
  const total = subtasks.length;
  const progress = total === 0 ? 0 : (completedCount / total) * 100;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-h3 text-foreground">Subtasks</h2>
        {!isLoading && !isError && total > 0 && (
          <span className="text-caption">
            {completedCount} of {total} completed
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-3 text-sm text-muted">
          <p>Unable to load subtasks.</p>
          <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && total > 0 && (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {!isLoading && !isError && total === 0 ? (
        <p className="text-sm text-muted">No subtasks yet.</p>
      ) : null}

      {!isLoading && !isError && total > 0 && (
        <ul className="space-y-1.5">
          {subtasks.map((subtask) => {
            const isDone = subtask.status === "DONE";
            const isPending = pendingSubtaskId === subtask._id;
            const canToggleThisSubtask = canToggleStatus && !subtask.isArchived;

            return (
              <li
                key={subtask._id}
                className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-background/50 px-3 py-2 sm:flex-nowrap"
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={isDone ? `Mark "${subtask.title}" as To Do` : `Mark "${subtask.title}" as Done`}
                  disabled={!canToggleThisSubtask || isUpdatingStatus || isPending}
                  onClick={() => onToggleComplete(subtask)}
                  title={subtask.isArchived ? "Archived subtasks are read-only." : undefined}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    isDone ? "border-success bg-success text-white" : "border-border bg-background"
                  )}
                >
                  {isDone && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
                      <path
                        d="M2 6.2 4.8 9 10 3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                <Link
                  to={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${subtask._id}`}
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm transition-colors hover:text-primary",
                    isDone ? "text-muted line-through" : "text-foreground"
                  )}
                >
                  {subtask.title}
                </Link>

                {subtask.isArchived && <Badge variant="warning">Archived</Badge>}
                <Badge variant="neutral">{STATUS_LABEL[subtask.status]}</Badge>

                {subtask.assignees.length > 0 && (
                  <div className="flex -space-x-1.5" aria-label={`${subtask.assignees.length} assignees`}>
                    {subtask.assignees.slice(0, 3).map((assignee) => (
                      <Avatar
                        key={assignee._id}
                        src={assignee.avatar}
                        name={assignee.name}
                        size="sm"
                        className="ring-2 ring-background"
                      />
                    ))}
                  </div>
                )}

                <span className="shrink-0 text-[11px] text-muted">
                  {subtask.dueDate ? formatDate(subtask.dueDate) : "No due date"}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {canCreateSubtask && !isLoading && !isError && (
        <button
          type="button"
          onClick={onAddSubtask}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <Plus className="h-3.5 w-3.5" />
          Add subtask
        </button>
      )}
    </div>
  );
}
