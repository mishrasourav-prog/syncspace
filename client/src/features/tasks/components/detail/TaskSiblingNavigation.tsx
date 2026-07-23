import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Task } from "../../types/task.types";

interface TaskSiblingNavigationProps {
  workspaceId: string;
  projectId: string;
  orderedTasks: Task[];
  currentTaskId: string;
}

/**
 * "Back to Tasks & Issues" plus previous/next controls derived from the
 * already-loaded project task list, ordered by `position` then `_id` to
 * match the server's own ordering. No server endpoint exists for this.
 */
export function TaskSiblingNavigation({
  workspaceId,
  projectId,
  orderedTasks,
  currentTaskId,
}: TaskSiblingNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromTasksSearch = (location.state as { fromTasksSearch?: string } | null)?.fromTasksSearch;

  const tasksPath = `/workspaces/${workspaceId}/projects/${projectId}/tasks`;
  const backHref = fromTasksSearch ? `${tasksPath}${fromTasksSearch}` : tasksPath;

  const currentIndex = orderedTasks.findIndex((task) => task._id === currentTaskId);
  const previousTask = currentIndex > 0 ? orderedTasks[currentIndex - 1] : undefined;
  const nextTask =
    currentIndex >= 0 && currentIndex < orderedTasks.length - 1 ? orderedTasks[currentIndex + 1] : undefined;

  function goTo(task: Task) {
    navigate(`${tasksPath}/${task._id}`, { state: fromTasksSearch ? { fromTasksSearch } : undefined });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link
        to={backHref}
        className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Tasks &amp; Issues
      </Link>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => previousTask && goTo(previousTask)}
          disabled={!previousTask}
          aria-label={previousTask ? `Previous: ${previousTask.title}` : "No previous task"}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-border/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => nextTask && goTo(nextTask)}
          disabled={!nextTask}
          aria-label={nextTask ? `Next: ${nextTask.title}` : "No next task"}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-border/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
