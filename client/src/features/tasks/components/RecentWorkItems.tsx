import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, CheckSquare, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { useUpdateTaskStatusMutation } from "../hooks/useTaskMutations";
import type { Task, TaskStatus } from "../types/task.types";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";

const INITIAL_VISIBLE = 5;

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const PRIORITY_CLASS: Record<Task["priority"], string> = {
  LOW: "text-muted",
  MEDIUM: "text-warning",
  HIGH: "text-danger",
  URGENT: "text-danger",
};

function isOverdue(task: Task): boolean {
  return (
    Boolean(task.dueDate) &&
    task.status !== "DONE" &&
    new Date(task.dueDate!).getTime() < Date.now()
  );
}

interface RecentWorkItemsProps {
  projectId: string;

  workspaceId: string;

  tasks: Task[];

  search: string;

  canUpdateStatus: boolean;

  canCreateTask: boolean;

  isLoading: boolean;

  isError: boolean;

  errorMessage?: string;

  onRetry: () => void;

  onCreateTask: () => void;
}

export function RecentWorkItems({
  projectId,
  workspaceId,
  tasks,
  search,
  canUpdateStatus,
  canCreateTask,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreateTask,
}: RecentWorkItemsProps) {
  const [showAll, setShowAll] = useState(false);
  const updateStatusMutation = useUpdateTaskStatusMutation(projectId);

  const rootItems = useMemo(
    () => tasks.filter((task) => !task.isArchived && !task.parentTask),
    [tasks],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rootItems;

    return rootItems.filter((task) => {
      const assigneeMatch = task.assignees.some(
        (assignee) =>
          assignee.name.toLowerCase().includes(query) ||
          assignee.username.toLowerCase().includes(query),
      );
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.type.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query) ||
        assigneeMatch
      );
    });
  }, [rootItems, search]);

  const sortedItems = useMemo(() => {
    const now = Date.now();

    function rank(task: Task): number {
      if (task.dueDate) {
        return new Date(task.dueDate).getTime() < now && task.status !== "DONE"
          ? 0
          : 1;
      }
      return 2;
    }

    return [...filteredItems].sort((a, b) => {
      const rankDiff = rank(a) - rank(b);
      if (rankDiff !== 0) return rankDiff;

      if (rank(a) <= 1) {
        return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredItems]);

  const visibleItems = showAll
    ? sortedItems
    : sortedItems.slice(0, INITIAL_VISIBLE);
  const hasMore = sortedItems.length > INITIAL_VISIBLE;

  function handleStatusChange(task: Task, status: TaskStatus) {
    if (status === task.status) return;

    updateStatusMutation.mutate(
      { taskId: task._id, status },
      {
        onSuccess: () => toast.success("Status updated."),
        onError: (error) =>
          toast.error(error.message ?? "Unable to update status."),
      },
    );
  }
  if (isLoading) {
    return (
      <section
        id="tasks"
        aria-labelledby="recent-work-items-heading"
        className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>

        <div className="space-y-2">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-3"
            >
              <Skeleton className="h-7 w-7 shrink-0 rounded-md" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>

              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        id="tasks"
        aria-labelledby="recent-work-items-heading"
        className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2
            id="recent-work-items-heading"
            className="text-h3 text-foreground"
          >
            Recent Tasks &amp; Issues
          </h2>
          <Link
            to={`/workspaces/${workspaceId}/projects/${projectId}/tasks`}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Open board
          </Link>
        </div>

        <DashboardSectionError
          compact
          message={errorMessage ?? "Unable to load tasks and issues."}
          onRetry={onRetry}
        />
      </section>
    );
  }

  return (
    <section
      id="tasks"
      aria-labelledby="recent-work-items-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="recent-work-items-heading" className="text-h3 text-foreground">
          Recent Tasks &amp; Issues
          <span className="ml-2 text-caption">{sortedItems.length}</span>
        </h2>
        <div className="flex items-center gap-2">
          <Link
            to={`/workspaces/${workspaceId}/projects/${projectId}/tasks`}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Open board
          </Link>
          {canCreateTask && (
            <Button size="sm" onClick={onCreateTask}>
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {sortedItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
          <CheckSquare className="mx-auto h-6 w-6 text-muted" />
          <p className="mt-2 text-body">
            {tasks.length === 0
              ? "No tasks or issues yet."
              : "No work items match your search."}
          </p>
        </div>
      )}

      {sortedItems.length > 0 && (
        <div className="space-y-2">
          {visibleItems.map((task) => {
            const overdue = isOverdue(task);
            const TypeIcon = task.type === "issue" ? AlertCircle : CheckSquare;
            const isUpdatingThis =
              updateStatusMutation.isPending &&
              updateStatusMutation.variables?.taskId === task._id;

            return (
              <div
                key={task._id}
                className="flex flex-col gap-2 rounded-lg border border-border/60 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    task.type === "issue"
                      ? "bg-danger/15 text-danger"
                      : "bg-secondary/15 text-secondary",
                  )}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-caption">
                    <Badge variant="neutral">{task.type}</Badge>
                    <span className={PRIORITY_CLASS[task.priority]}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                    <span
                      className={
                        overdue ? "font-medium text-danger" : undefined
                      }
                    >
                      {task.dueDate
                        ? `Due ${formatDate(task.dueDate)}`
                        : "No due date"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
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
                    </div>
                  ) : (
                    <span className="text-caption">Unassigned</span>
                  )}

                  <select
                    aria-label={`Change status for ${task.title}`}
                    value={task.status}
                    disabled={!canUpdateStatus || isUpdatingThis}
                    onChange={(event) =>
                      handleStatusChange(task, event.target.value as TaskStatus)
                    }
                    className={cn(
                      "rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none transition-colors focus:border-muted/60",
                      (!canUpdateStatus || isUpdatingThis) && "opacity-60",
                    )}
                  >
                    {(Object.keys(STATUS_LABEL) as TaskStatus[]).map(
                      (status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="w-full rounded-lg py-2 text-center text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              {showAll ? "Show less" : "View all work items"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
