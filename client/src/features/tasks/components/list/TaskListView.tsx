import { CheckSquare } from "lucide-react";
import type { Task } from "../../types/task.types";
import { TaskListRow } from "./TaskListRow";

interface TaskListViewProps {
  tasks: Task[];
  now: number;
  onTaskClick: (task: Task) => void;
  emptyMessage: string;
}

export function TaskListView({
  tasks,
  now,
  onTaskClick,
  emptyMessage,
}: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
        <CheckSquare className="mx-auto h-6 w-6 text-muted" />
        <p className="mt-2 text-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskListRow
          key={task._id}
          task={task}
          now={now}
          onClick={() => onTaskClick(task)}
        />
      ))}
    </div>
  );
}
