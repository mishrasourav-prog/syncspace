import { useMemo, useState } from "react";

import { Avatar } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";

import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";

import { formatDate } from "@/lib/date";

import { PRIORITY_LABEL, isTaskOverdue } from "../task.filters";

import type { Task, TaskPriority } from "../types/task.types";

const SUMMARY_PRIORITIES: TaskPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

const PRIORITY_DOT: Record<TaskPriority, string> = {
  URGENT: "bg-danger",
  HIGH: "bg-danger/70",
  MEDIUM: "bg-warning",
  LOW: "bg-success",
};

const PRIORITY_STROKE: Record<TaskPriority, string> = {
  URGENT: "hsl(var(--danger))",
  HIGH: "hsl(var(--danger) / 0.72)",
  MEDIUM: "hsl(var(--warning))",
  LOW: "hsl(var(--success))",
};

const RADIUS = 42;

const STROKE = 16;

const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const UPCOMING_LIMIT = 3;

const ASSIGNEE_LIMIT = 4;

interface TaskSummaryRailProps {
  tasks: Task[];

  now: number;

  isLoading: boolean;

  isError: boolean;

  errorMessage?: string;

  isFiltered: boolean;

  onRetry: () => void;

  onSelectTask: (task: Task) => void;
}

export function TaskSummaryRail({
  tasks,
  now,
  isLoading,
  isError,
  errorMessage,
  isFiltered,
  onRetry,
  onSelectTask,
}: TaskSummaryRailProps) {
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const [showAllAssignees, setShowAllAssignees] = useState(false);

  const total = tasks.length;

  const taskCount = tasks.filter((item) => item.type === "task").length;

  const issueCount = tasks.filter((item) => item.type === "issue").length;

  const completedCount = tasks.filter((item) => item.status === "DONE").length;

  const priorityCounts = useMemo(() => {
    const result: Record<TaskPriority, number> = {
      URGENT: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    for (const item of tasks) {
      result[item.priority] += 1;
    }

    return result;
  }, [tasks]);

  const highOrUrgentCount = priorityCounts.URGENT + priorityCounts.HIGH;

  const donutSegments = useMemo(
    () =>
      SUMMARY_PRIORITIES.filter(
        (priority) => priorityCounts[priority] > 0,
      ).reduce<{
        offset: number;

        segments: Array<{
          priority: TaskPriority;

          dashArray: string;

          dashOffset: number;
        }>;
      }>(
        (result, priority) => {
          const fraction = total === 0 ? 0 : priorityCounts[priority] / total;

          const length = fraction * CIRCUMFERENCE;

          return {
            offset: result.offset + length,

            segments: [
              ...result.segments,
              {
                priority,
                dashArray: `${length} ${CIRCUMFERENCE - length}`,
                dashOffset: -result.offset,
              },
            ],
          };
        },
        {
          offset: 0,

          segments: [],
        },
      ).segments,
    [priorityCounts, total],
  );

  const upcomingDue = useMemo(
    () =>
      tasks
        .filter(
          (item) =>
            !item.isArchived && Boolean(item.dueDate) && item.status !== "DONE",
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate ?? 0).getTime() -
            new Date(b.dueDate ?? 0).getTime(),
        ),
    [tasks],
  );

  const topAssignees = useMemo(() => {
    const counts = new Map<
      string,
      {
        name: string;

        avatar?: string;

        count: number;
      }
    >();

    for (const item of tasks) {
      for (const assignee of item.assignees) {
        const existing = counts.get(assignee._id);

        if (existing) {
          existing.count += 1;
        } else {
          counts.set(assignee._id, {
            name: assignee.name,
            avatar: assignee.avatar,
            count: 1,
          });
        }
      }
    }

    return Array.from(counts.entries())
      .map(([id, value]) => ({
        id,
        ...value,
      }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  const visibleUpcoming = showAllUpcoming
    ? upcomingDue
    : upcomingDue.slice(0, UPCOMING_LIMIT);

  const visibleAssignees = showAllAssignees
    ? topAssignees
    : topAssignees.slice(0, ASSIGNEE_LIMIT);

  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className={index === 1 ? "h-40 rounded-xl" : "h-32 rounded-xl"}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
        <h2 className="mb-3 text-h3 text-foreground">Task summary</h2>

        <DashboardSectionError
          compact
          message={errorMessage ?? "Unable to load the task summary."}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <aside aria-label="Task summary" className="space-y-5">
      <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-h3 text-foreground">Summary</h2>

          {isFiltered && <Badge variant="primary">Filtered</Badge>}
        </div>

        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted">Total</dt>
            <dd className="font-medium text-foreground">{total}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-muted">Tasks</dt>
            <dd className="font-medium text-foreground">{taskCount}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-muted">Issues</dt>
            <dd className="font-medium text-foreground">{issueCount}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-muted">Completed</dt>
            <dd className="font-medium text-success">{completedCount}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
        <h2 className="text-h3 text-foreground">Priority</h2>

        {total === 0 ? (
          <p className="mt-3 text-caption">No work items in this view.</p>
        ) : (
          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-[92px] w-[92px] shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full -rotate-90"
                role="img"
                aria-label="Priority breakdown"
              >
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth={STROKE}
                />

                {donutSegments.map((segment) => (
                  <circle
                    key={segment.priority}
                    cx="50"
                    cy="50"
                    r={RADIUS}
                    fill="none"
                    stroke={PRIORITY_STROKE[segment.priority]}
                    strokeWidth={STROKE}
                    strokeDasharray={segment.dashArray}
                    strokeDashoffset={segment.dashOffset}
                  />
                ))}
              </svg>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {highOrUrgentCount}
                </span>
                <span className="text-[10px] text-muted">High+</span>
              </div>
            </div>

            <ul className="min-w-0 flex-1 space-y-1.5">
              {SUMMARY_PRIORITIES.map((priority) => (
                <li
                  key={priority}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[priority]}`}
                      aria-hidden
                    />
                    {PRIORITY_LABEL[priority]}
                  </span>

                  <span className="text-muted">{priorityCounts[priority]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-h3 text-foreground">Upcoming Due Dates</h2>

          {upcomingDue.length > UPCOMING_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAllUpcoming((previous) => !previous)}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              {showAllUpcoming ? "Show less" : "View all"}
            </button>
          )}
        </div>

        {visibleUpcoming.length === 0 ? (
          <p className="mt-3 text-caption">Nothing due soon.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {visibleUpcoming.map((item) => {
              const firstAssignee = item.assignees[0];

              return (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => onSelectTask(item)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-border/30"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {firstAssignee && (
                        <Avatar
                          src={firstAssignee.avatar}
                          name={firstAssignee.name}
                          size="sm"
                        />
                      )}

                      <span className="min-w-0 truncate text-sm text-foreground">
                        {item.title}
                      </span>
                    </span>

                    <span
                      className={`shrink-0 text-xs ${isTaskOverdue(item, now) ? "font-medium text-danger" : "text-muted"}`}
                    >
                      {item.dueDate ? formatDate(item.dueDate) : "—"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-h3 text-foreground">Top Assignees</h2>

          {topAssignees.length > ASSIGNEE_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAllAssignees((previous) => !previous)}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              {showAllAssignees ? "Show less" : "View all"}
            </button>
          )}
        </div>

        {visibleAssignees.length === 0 ? (
          <p className="mt-3 text-caption">No assignees yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {visibleAssignees.map((assignee) => (
              <li
                key={assignee.id}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar
                    src={assignee.avatar}
                    name={assignee.name}
                    size="sm"
                  />
                  <span className="truncate text-sm text-foreground">
                    {assignee.name}
                  </span>
                </span>

                <span className="shrink-0 text-xs text-muted">
                  {assignee.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
