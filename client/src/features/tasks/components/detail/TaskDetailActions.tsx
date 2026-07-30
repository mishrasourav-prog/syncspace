import { Archive, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "../../types/task.types";

interface TaskDetailActionsProps {
  task: Task;
  canArchive: boolean;
  canRestore: boolean;
  canMarkDone: boolean;
  isUpdatingStatus: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onMarkDone: () => void;
  onReopen: () => void;
}

export function TaskDetailActions({
  task,
  canArchive,
  canRestore,
  canMarkDone,
  isUpdatingStatus,
  onArchive,
  onRestore,
  onMarkDone,
  onReopen,
}: TaskDetailActionsProps) {
  if (!canArchive && !canRestore && !canMarkDone) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/60 p-3 shadow-soft">
      {task.isArchived ? (
        canRestore && (
          <Button size="sm" variant="secondary" onClick={onRestore}>
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </Button>
        )
      ) : (
        <>
          {canArchive && (
            <Button size="sm" variant="secondary" onClick={onArchive}>
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          )}
          {canMarkDone &&
            (task.status === "DONE" ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={isUpdatingStatus}
                onClick={onReopen}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reopen
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={isUpdatingStatus}
                onClick={onMarkDone}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as Done
              </Button>
            ))}
        </>
      )}
    </div>
  );
}
