import { CalendarDays, CalendarPlus } from "lucide-react";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  ALL_STATUSES,
  PRIORITY_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
  isTaskDueToday,
  isTaskOverdue,
} from "../../task.filters";
import type { Task, TaskPriority, TaskStatus } from "../../types/task.types";

const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: "bg-muted",
  IN_PROGRESS: "bg-primary",
  IN_REVIEW: "bg-warning",
  DONE: "bg-success",
};

const PRIORITY_TEXT: Record<TaskPriority, string> = {
  URGENT: "text-danger",
  HIGH: "text-danger",
  MEDIUM: "text-warning",
  LOW: "text-success",
};

interface TaskDetailMetadataProps {
  task: Task;
  canEditMetadata: boolean;
  canChangeStatus: boolean;
  isUpdatingStatus: boolean;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
}

export function TaskDetailMetadata({
  task,
  canEditMetadata,
  canChangeStatus,
  isUpdatingStatus,
  onStatusChange,
  onEdit,
}: TaskDetailMetadataProps) {
  const now = Date.now();
  const overdue = isTaskOverdue(task, now);
  const dueToday = isTaskDueToday(task, now);

  const dueDateContent = (
    <>
      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
      {task.dueDate ? formatDate(task.dueDate) : "No due date"}
      {overdue && (
        <span className="text-[11px] font-normal text-danger">· Overdue</span>
      )}
      {dueToday && (
        <span className="text-[11px] font-normal text-warning">
          · Due today
        </span>
      )}
    </>
  );

  const startDateContent = (
    <>
      <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
      {task.startDate ? formatDate(task.startDate) : "No start date"}
    </>
  );

  const dueDateClassName = cn(
    "flex items-center gap-1.5 text-sm",
    overdue
      ? "font-medium text-danger"
      : dueToday
        ? "font-medium text-warning"
        : "text-foreground",
  );

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
      <div>
        <dt className="text-caption mb-1.5">Status</dt>
        <dd>
          {canChangeStatus ? (
            <select
              value={task.status}
              disabled={isUpdatingStatus}
              onChange={(event) =>
                onStatusChange(event.target.value as TaskStatus)
              }
              aria-label="Change task status"
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-muted/60 disabled:opacity-60"
            >
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-foreground">
              <span
                className={cn("h-2 w-2 rounded-full", STATUS_DOT[task.status])}
                aria-hidden
              />
              {STATUS_LABEL[task.status]}
            </span>
          )}
        </dd>
      </div>

      <div>
        <dt className="text-caption mb-1.5">Priority</dt>
        <dd
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            PRIORITY_TEXT[task.priority],
          )}
        >
          {PRIORITY_LABEL[task.priority]}
        </dd>
      </div>

      <div>
        <dt className="text-caption mb-1.5">Type</dt>
        <dd className="text-sm text-foreground">{TYPE_LABEL[task.type]}</dd>
      </div>

      <div>
        <dt className="text-caption mb-1.5">Due Date</dt>
        <dd>
          {canEditMetadata ? (
            <button
              type="button"
              onClick={onEdit}
              className={cn(
                dueDateClassName,
                "transition-colors hover:text-foreground",
              )}
              aria-label="Edit due date"
            >
              {dueDateContent}
            </button>
          ) : (
            <span className={dueDateClassName}>{dueDateContent}</span>
          )}
        </dd>
      </div>

      <div>
        <dt className="text-caption mb-1.5">Start Date</dt>
        <dd>
          {canEditMetadata ? (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-foreground"
              aria-label="Edit start date"
            >
              {startDateContent}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-foreground">
              {startDateContent}
            </span>
          )}
        </dd>
      </div>
    </dl>
  );
}
