import { AlertCircle, CheckCircle2, CheckSquare } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { formatDate, formatRelativeTime } from "@/lib/date";

import { cn } from "@/lib/utils";

import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  isTaskOverdue,
} from "../../task.filters";

import type { Task } from "../../types/task.types";

const PRIORITY_BADGE_VARIANT: Record<
  Task["priority"],
  "danger" | "warning" | "success" | "neutral"
> = {
  URGENT: "danger",
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "success",
};

const STATUS_BADGE_VARIANT: Record<
  Task["status"],
  "neutral" | "secondary" | "warning" | "success"
> = {
  TODO: "neutral",
  IN_PROGRESS: "secondary",
  IN_REVIEW: "warning",
  DONE: "success",
};

interface TaskListRowProps {
  task: Task;

  now: number;

  onClick: () => void;
}

export function TaskListRow({ task, now, onClick }: TaskListRowProps) {
  const overdue = isTaskOverdue(task, now);

  const TypeIcon = task.type === "issue" ? AlertCircle : CheckSquare;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-lg border border-border/60 px-3 py-2.5 text-left transition-colors hover:border-muted/40 hover:bg-background/40 sm:flex-row sm:items-center sm:gap-3"
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          task.type === "issue"
            ? "bg-primary/15 text-primary"
            : "bg-secondary/15 text-secondary",
        )}
      >
        <TypeIcon className="h-3.5 w-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          {task.status === "DONE" && (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
          )}

          <p
            className={cn(
              "truncate text-sm font-medium text-foreground",
              task.status === "DONE" && "text-muted line-through",
            )}
          >
            {task.title}
          </p>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant={STATUS_BADGE_VARIANT[task.status]}>
            {STATUS_LABEL[task.status]}
          </Badge>

          <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>
            {PRIORITY_LABEL[task.priority]}
          </Badge>

          {task.isArchived && <Badge variant="warning">Archived</Badge>}

          <span className="text-[11px] text-muted">
            Updated {formatRelativeTime(task.updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={cn(
            "text-xs",
            overdue ? "font-medium text-danger" : "text-muted",
          )}
        >
          {task.dueDate ? formatDate(task.dueDate) : "No due date"}
        </span>

        {task.assignees.length > 0 ? (
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((assignee) => (
              <Avatar
                key={assignee._id}
                src={assignee.avatar}
                name={assignee.name}
                size="sm"
                className="ring-2 ring-surface"
              />
            ))}

            {task.assignees.length > 3 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-border/60 text-[10px] font-medium text-foreground ring-2 ring-surface">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="text-caption">Unassigned</span>
        )}
      </div>
    </button>
  );
}
