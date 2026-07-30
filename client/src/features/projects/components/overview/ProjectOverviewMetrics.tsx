import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckSquare, FileText, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/features/tasks/types/task.types";
import type { ProjectMember } from "@/features/project-members/types/projectMember.types";

interface MetricCardProps {
  icon: LucideIcon;
  iconClassName: string;
  value: number | string;
  label: string;
  helper: string;
}

function MetricCard({
  icon: Icon,
  iconClassName,
  value,
  label,
  helper,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold text-foreground">{value}</p>
          <p className="truncate text-caption">{label}</p>
        </div>
      </div>
      <p className="mt-2 truncate text-[11px] text-muted/70">{helper}</p>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}

interface ProjectOverviewMetricsProps {
  tasks: Task[];
  members: ProjectMember[];
  documentCount: number | null;
  documentCountHasMore: boolean;
  isLoadingTasks: boolean;
  isLoadingMembers: boolean;
  isLoadingDocuments: boolean;
  hasTasksError: boolean;
  hasMembersError: boolean;
  hasDocumentsError: boolean;
}

export function ProjectOverviewMetrics({
  tasks,
  members,
  documentCount,
  documentCountHasMore,
  isLoadingTasks,
  isLoadingMembers,
  isLoadingDocuments,
  hasTasksError,
  hasMembersError,
  hasDocumentsError,
}: ProjectOverviewMetricsProps) {
  const activeItems = tasks.filter((task) => !task.isArchived);
  const activeTasks = activeItems.filter((task) => task.type === "task");
  const activeIssues = activeItems.filter((task) => task.type === "issue");
  const doneTasks = activeTasks.filter((task) => task.status === "DONE").length;
  const openIssues = activeIssues.filter(
    (task) => task.status !== "DONE",
  ).length;
  const adminCount = members.filter((member) => member.role === "admin").length;

  return (
    <div
      id="overview"
      className="scroll-mt-24 grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      {isLoadingTasks ? (
        <>
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </>
      ) : hasTasksError ? (
        <>
          <MetricCard
            icon={CheckSquare}
            iconClassName="bg-secondary/15 text-secondary"
            value="—"
            label="Tasks"
            helper="Unavailable"
          />
          <MetricCard
            icon={AlertCircle}
            iconClassName="bg-danger/15 text-danger"
            value="—"
            label="Issues"
            helper="Unavailable"
          />
        </>
      ) : (
        <>
          <MetricCard
            icon={CheckSquare}
            iconClassName="bg-secondary/15 text-secondary"
            value={activeTasks.length}
            label="Tasks"
            helper={`${doneTasks} done`}
          />
          <MetricCard
            icon={AlertCircle}
            iconClassName="bg-danger/15 text-danger"
            value={activeIssues.length}
            label="Issues"
            helper={`${openIssues} open`}
          />
        </>
      )}

      {isLoadingDocuments ? (
        <MetricCardSkeleton />
      ) : hasDocumentsError ? (
        <MetricCard
          icon={FileText}
          iconClassName="bg-success/15 text-success"
          value="—"
          label="Documents"
          helper="Unavailable"
        />
      ) : (
        <MetricCard
          icon={FileText}
          iconClassName="bg-success/15 text-success"
          value={
            documentCountHasMore ? `${documentCount}+` : (documentCount ?? 0)
          }
          label="Documents"
          helper={documentCountHasMore ? "Showing most recent" : "Total"}
        />
      )}

      {isLoadingMembers ? (
        <MetricCardSkeleton />
      ) : hasMembersError ? (
        <MetricCard
          icon={Users}
          iconClassName="bg-primary/15 text-primary"
          value="—"
          label="Members"
          helper="Unavailable"
        />
      ) : (
        <MetricCard
          icon={Users}
          iconClassName="bg-primary/15 text-primary"
          value={members.length}
          label="Members"
          helper={`${adminCount} admin${adminCount === 1 ? "" : "s"}`}
        />
      )}
    </div>
  );
}
