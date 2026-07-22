import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useArchiveTaskMutation, useRestoreTaskMutation } from "../hooks/useTaskMutations";
import type { Task } from "../types/task.types";

export type TaskActionType = "archive" | "restore";

export interface TaskActionTarget {
  type: TaskActionType;
  task: Task;
}

interface TaskArchiveDialogsProps {
  target: TaskActionTarget | null;
  projectId: string;
  onClose: () => void;
}

export function TaskArchiveDialogs({ target, projectId, onClose }: TaskArchiveDialogsProps) {
  const archiveMutation = useArchiveTaskMutation(projectId);
  const restoreMutation = useRestoreTaskMutation(projectId);

  const activeMutation = target?.type === "archive" ? archiveMutation : restoreMutation;

  function handleClose() {
    if (activeMutation.isPending) return;
    archiveMutation.reset();
    restoreMutation.reset();
    onClose();
  }

  function handleConfirm() {
    if (!target) return;

    if (target.type === "archive") {
      archiveMutation.mutate(target.task._id, {
        onSuccess: () => {
          toast.success(`"${target.task.title}" was archived.`);
          onClose();
        },
        onError: (error) => toast.error(error.message ?? "Unable to archive this item."),
      });
    } else {
      restoreMutation.mutate(target.task._id, {
        onSuccess: () => {
          toast.success(`"${target.task.title}" was restored.`);
          onClose();
        },
        onError: (error) => toast.error(error.message ?? "Unable to restore this item."),
      });
    }
  }

  if (!target) return null;

  const isArchive = target.type === "archive";
  const itemLabel = target.task.type === "issue" ? "issue" : "task";

  return (
    <ConfirmDialog
      open={Boolean(target)}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={isArchive ? `Archive this ${itemLabel}?` : `Restore this ${itemLabel}?`}
      description={
        isArchive
          ? `"${target.task.title}" will be hidden from the board and marked read-only until it's restored.`
          : `"${target.task.title}" will become active again.`
      }
      confirmLabel={isArchive ? `Archive ${itemLabel}` : `Restore ${itemLabel}`}
      confirmVariant={isArchive ? "danger" : "primary"}
      tone={isArchive ? "danger" : "default"}
      isPending={activeMutation.isPending}
      errorMessage={activeMutation.error?.message}
    />
  );
}
