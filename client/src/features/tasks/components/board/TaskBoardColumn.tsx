import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "../../task.filters";
import type { Task, TaskStatus } from "../../types/task.types";
import { SortableTaskCard } from "./SortableTaskCard";

const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: "bg-muted",
  IN_PROGRESS: "bg-secondary",
  IN_REVIEW: "bg-warning",
  DONE: "bg-success",
};

interface TaskBoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  now: number;
  onTaskClick: (task: Task) => void;
  reorderDisabled: boolean;
  onAddTask?: () => void;
}

export function TaskBoardColumn({ status, tasks, now, onTaskClick, reorderDisabled, onAddTask }: TaskBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-[280px] shrink-0 flex-col rounded-xl border border-border bg-surface/40">
      <div className="flex items-center justify-between px-3 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
          {STATUS_LABEL[status]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="rounded-full bg-border/50 px-2 py-0.5 text-xs font-medium text-muted">{tasks.length}</span>
          {onAddTask && (
            <button
              type="button"
              onClick={onAddTask}
              aria-label={`Add task to ${STATUS_LABEL[status]}`}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/50 hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 transition-colors",
          isOver && "bg-primary/5"
        )}
      >
        <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} now={now} onClick={() => onTaskClick(task)} disabled={reorderDisabled} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/70 px-3 py-6 text-center text-caption">
            No items
          </div>
        )}
      </div>
    </div>
  );
}
