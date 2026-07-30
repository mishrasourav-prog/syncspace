import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "../types/task.types";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";

type WorkFilter = "all" | "task" | "issue";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: "hsl(var(--secondary))",
  IN_PROGRESS: "hsl(var(--warning))",
  IN_REVIEW: "hsl(var(--primary))",
  DONE: "hsl(var(--success))",
};

const RADIUS = 60;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Segment {
  status: TaskStatus;
  count: number;
  fraction: number;
  dashArray: string;
  dashOffset: number;
}

interface WorkItemStatusOverviewProps {
  tasks: Task[];

  isLoading: boolean;

  isError: boolean;

  errorMessage?: string;

  onRetry: () => void;
}

export function WorkItemStatusOverview({
  tasks,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: WorkItemStatusOverviewProps) {
  const [filter, setFilter] = useState<WorkFilter>("all");

  const activeItems = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !task.isArchived && (filter === "all" || task.type === filter),
      ),
    [tasks, filter],
  );

  const counts = useMemo(() => {
    const result: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };
    for (const item of activeItems) result[item.status] += 1;
    return result;
  }, [activeItems]);

  const total = activeItems.length;

  const segments = STATUS_ORDER.reduce<{ items: Segment[]; offset: number }>(
    (acc, status) => {
      const count = counts[status];
      const fraction = total === 0 ? 0 : count / total;
      const length = fraction * CIRCUMFERENCE;
      const segment: Segment = {
        status,
        count,
        fraction,
        dashArray: `${length} ${CIRCUMFERENCE - length}`,
        dashOffset: -acc.offset,
      };
      return { items: [...acc.items, segment], offset: acc.offset + length };
    },
    { items: [], offset: 0 },
  ).items;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>

        <div className="flex h-40 items-center justify-center gap-8">
          <Skeleton className="h-32 w-32 rounded-full" />

          <div className="w-48 space-y-3">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
        <h3 className="mb-4 text-h3 text-foreground">Work Item Status</h3>

        <DashboardSectionError
          compact
          message={errorMessage ?? "Unable to load work-item status."}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-h3 text-foreground">Work Item Status</h3>
        <div className="flex rounded-md border border-border p-0.5 text-xs">
          {(["all", "task", "issue"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={cn(
                "rounded px-2.5 py-1 font-medium transition-colors",
                filter === option
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              {option === "all"
                ? "All Work"
                : option === "task"
                  ? "Tasks"
                  : "Issues"}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <div className="flex h-40 items-center justify-center text-caption">
          No active work items
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-around">
          <div className="relative h-[160px] w-[160px] shrink-0">
            <svg
              viewBox="0 0 160 160"
              className="h-full w-full -rotate-90"
              role="img"
              aria-label={`${total} active work items by status`}
            >
              <circle
                cx="80"
                cy="80"
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={STROKE}
              />
              {segments
                .filter((segment) => segment.count > 0)
                .map((segment) => (
                  <circle
                    key={segment.status}
                    cx="80"
                    cy="80"
                    r={RADIUS}
                    fill="none"
                    stroke={STATUS_COLOR[segment.status]}
                    strokeWidth={STROKE}
                    strokeDasharray={segment.dashArray}
                    strokeDashoffset={segment.dashOffset}
                    strokeLinecap="butt"
                  />
                ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-foreground">
                {total}
              </span>
              <span className="text-caption">Total</span>
            </div>
          </div>

          <ul className="w-full max-w-[220px] space-y-2">
            {STATUS_ORDER.map((status) => {
              const count = counts[status];
              const percentage =
                total === 0 ? 0 : Math.round((count / total) * 100);

              return (
                <li
                  key={status}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[status] }}
                      aria-hidden
                    />
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="text-muted">
                    {count} ({percentage}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
