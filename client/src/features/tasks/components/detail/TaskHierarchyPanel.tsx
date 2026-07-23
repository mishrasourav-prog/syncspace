import { Link } from "react-router-dom";
import { AlertCircle, CheckSquare, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "../../types/task.types";

interface TaskHierarchyPanelProps {
  task: Task;
  workspaceId: string;
  projectId: string;
  parentTask: Task | null | undefined;
  subtaskCount: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function TaskHierarchyPanel({
  task,
  workspaceId,
  projectId,
  parentTask,
  subtaskCount,
  isLoading,
  isError,
  onRetry,
}: TaskHierarchyPanelProps) {
  const basePath = `/workspaces/${workspaceId}/projects/${projectId}/tasks`;

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <h2 className="text-h3 mb-3 flex items-center gap-1.5 text-foreground">
        <GitBranch className="h-4 w-4 text-muted" />
        Hierarchy
      </h2>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {isError && (
        <div className="text-sm text-muted">
          <p>Unable to load hierarchy information.</p>
          <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          <div>
            <p className="text-caption mb-1">Parent work item</p>
            {!task.parentTask ? (
              <p className="text-sm text-muted">Root work item</p>
            ) : parentTask === null ? (
              <p className="text-sm text-muted">Parent work item unavailable</p>
            ) : parentTask === undefined ? (
              <p className="text-sm text-muted">Parent work item unavailable</p>
            ) : (
              <Link
                to={`${basePath}/${parentTask._id}`}
                className="flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-primary"
              >
                {parentTask.type === "issue" ? (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-muted" />
                ) : (
                  <CheckSquare className="h-3.5 w-3.5 shrink-0 text-muted" />
                )}
                <span className="truncate">{parentTask.title}</span>
                {parentTask.isArchived && <Badge variant="warning">Archived</Badge>}
              </Link>
            )}
          </div>

          <div>
            <p className="text-caption mb-1">Direct subtasks</p>
            <p className="text-sm text-foreground">
              {subtaskCount === 0 ? "None" : `${subtaskCount} subtask${subtaskCount === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
