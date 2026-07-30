import type { HTMLAttributes } from "react";

import { AlertCircle, CheckCircle2, CheckSquare, Clock3 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { formatDate, formatRelativeTime } from "@/lib/date";

import { cn } from "@/lib/utils";

import { PRIORITY_LABEL, isTaskOverdue } from "../../task.filters";

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

interface TaskCardProps {
  task: Task;

  now: number;

  onClick: () => void;

  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;

  isDragging?: boolean;

  isOverlay?: boolean;
}

export function TaskCard({
  task,
  now,
  onClick,
  dragHandleProps,
  isDragging = false,
  isOverlay = false,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task, now);

  const isDone = task.status === "DONE";

  const TypeIcon = task.type === "issue" ? AlertCircle : CheckSquare;

  return (
    <button
      type="button"
      {...dragHandleProps}
      onClick={onClick}
      tabIndex={isOverlay ? -1 : dragHandleProps?.tabIndex}
      aria-hidden={isOverlay || undefined}
      aria-label={`${task.type === "issue" ? "Issue" : "Task"}: ${task.title}`}
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-lg border border-border bg-background/60 p-3 text-left shadow-soft transition-colors hover:border-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",

        dragHandleProps &&
          "touch-manipulation select-none cursor-grab active:cursor-grabbing",

        isDragging && "opacity-40",

        isOverlay && "cursor-grabbing border-primary/40 shadow-elevated",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant={task.type === "issue" ? "primary" : "secondary"}
          className="gap-1"
        >
          <TypeIcon className="h-3 w-3" />
          {task.type === "issue" ? "Issue" : "Task"}
        </Badge>

        <div className="flex items-center gap-1.5">
          {task.isArchived && <Badge variant="warning">Archived</Badge>}

          {isDone && !task.isArchived && (
            <CheckCircle2
              className="h-4 w-4 text-success"
              aria-label="Completed"
            />
          )}
        </div>
      </div>

      <p
        className={cn(
          "line-clamp-2 text-sm font-medium text-foreground",
          isDone && "text-muted line-through",
        )}
      >
        {task.title}
      </p>

      <div className="flex items-center justify-between gap-2">
        {task.assignees.length > 0 ? (
          <div
            className="flex -space-x-1.5"
            aria-label={`${task.assignees.length} assignee${task.assignees.length === 1 ? "" : "s"}`}
          >
            {task.assignees.slice(0, 3).map((assignee) => (
              <Avatar
                key={assignee._id}
                src={assignee.avatar}
                name={assignee.name}
                size="sm"
                className="ring-2 ring-background"
              />
            ))}

            {task.assignees.length > 3 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-border/60 text-[10px] font-medium text-foreground ring-2 ring-background">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="text-caption">Unassigned</span>
        )}

        <span
          className={cn(
            "text-xs",
            overdue ? "font-medium text-danger" : "text-muted",
          )}
        >
          {task.dueDate ? formatDate(task.dueDate) : "No due date"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge
          variant={PRIORITY_BADGE_VARIANT[task.priority]}
          className="w-fit"
        >
          {PRIORITY_LABEL[task.priority]}
        </Badge>

        <span className="flex items-center gap-1 text-[11px] text-muted/80">
          <Clock3 className="h-3 w-3" />
          Updated {formatRelativeTime(task.updatedAt)}
        </span>
      </div>
    </button>
  );
}
