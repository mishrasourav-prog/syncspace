import { useMemo } from "react";
import type { Task } from "../types/task.types";
import {
    Skeleton,
} from "@/components/ui/skeleton";

import {
    DashboardSectionError,
} from "@/features/workspaces/components/dashboard/DashboardSectionError";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

interface ProjectCompletionPanelProps {
    tasks:
        Task[];

    isLoading:
        boolean;

    isError:
        boolean;

    errorMessage?:
        string;

    onRetry:
        () => void;
}
export function ProjectCompletionPanel({ 
    tasks,
    isLoading,
    isError,
    errorMessage,
    onRetry, }: ProjectCompletionPanelProps) {
  const stats = useMemo(() => {
    const activeItems = tasks.filter((task) => !task.isArchived);
    const totalActive = activeItems.length;
    const doneActive = activeItems.filter((task) => task.status === "DONE").length;
    const completionPercentage = totalActive === 0 ? 0 : Math.round((doneActive / totalActive) * 100);

    // eslint-disable-next-line react-hooks/purity -- a display-only "now" snapshot for relative-time bucketing; does not affect memoization correctness.
    const now = Date.now();
    const sevenDaysAgo = now - 7 * DAY_MS;

    const completedLast7Days = activeItems.filter(
      (task) => task.completedAt && new Date(task.completedAt).getTime() >= sevenDaysAgo
    ).length;

    const overdueCount = activeItems.filter(
      (task) => task.dueDate && task.status !== "DONE" && new Date(task.dueDate).getTime() < now
    ).length;

    const unassignedCount = activeItems.filter((task) => task.assignees.length === 0).length;

    const todayStart = startOfDay(new Date());
    const dailyCounts: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const dayStart = todayStart - i * DAY_MS;
      const dayEnd = dayStart + DAY_MS;
      const count = activeItems.filter((task) => {
        if (!task.completedAt) return false;
        const completedTime = new Date(task.completedAt).getTime();
        return completedTime >= dayStart && completedTime < dayEnd;
      }).length;
      const label = new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" });
      dailyCounts.push({ label, count });
    }

    return { totalActive, doneActive, completionPercentage, completedLast7Days, overdueCount, unassignedCount, dailyCounts };
  }, [tasks]);

  const maxDailyCount = Math.max(1, ...stats.dailyCounts.map((day) => day.count));

  if (
    isLoading
) {
    return (
        <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
            <Skeleton className="h-5 w-28" />

            <div className="mt-4 flex items-end justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="mt-3 h-2 w-full rounded-full" />

            <div className="mt-4 grid grid-cols-3 gap-2">
                {
                    Array.from({
                        length:
                            3,
                    }).map(
                        (
                            _,
                            index
                        ) => (
                            <Skeleton
                                key={
                                    index
                                }
                                className="h-14 rounded-lg"
                            />
                        )
                    )
                }
            </div>

            <Skeleton className="mt-4 h-20 w-full rounded-lg" />
        </div>
    );
}

if (
    isError
) {
    return (
        <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
            <h3 className="mb-4 text-h3 text-foreground">
                Completion
            </h3>

            <DashboardSectionError
                compact
                message={
                    errorMessage ??
                    "Unable to load completion information."
                }
                onRetry={
                    onRetry
                }
            />
        </div>
    );
}

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <h3 className="text-h3 text-foreground">Completion</h3>

      <div className="mt-3">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-semibold text-foreground">{stats.completionPercentage}%</span>
          <span className="pb-1 text-caption">
            {stats.doneActive} of {stats.totalActive} done
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-background/50 px-2 py-2">
          <dt className="text-caption">Completed (7d)</dt>
          <dd className="mt-0.5 text-sm font-semibold text-success">{stats.completedLast7Days}</dd>
        </div>
        <div className="rounded-lg bg-background/50 px-2 py-2">
          <dt className="text-caption">Overdue</dt>
          <dd className="mt-0.5 text-sm font-semibold text-danger">{stats.overdueCount}</dd>
        </div>
        <div className="rounded-lg bg-background/50 px-2 py-2">
          <dt className="text-caption">Unassigned</dt>
          <dd className="mt-0.5 text-sm font-semibold text-warning">{stats.unassignedCount}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="mb-2 text-caption">Completed items, last 7 days</p>
        <div className="flex h-16 items-end gap-2" role="img" aria-label="Completed work items over the last 7 days">
          {stats.dailyCounts.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary/70"
                style={{ height: `${Math.max(4, (day.count / maxDailyCount) * 48)}px` }}
                title={`${day.label}: ${day.count} completed`}
              />
              <span className="text-[10px] text-muted">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
