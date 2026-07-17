import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useArchiveWorkspaceMutation,
  useLeaveWorkspaceMutation,
  useRestoreWorkspaceMutation,
} from "../hooks/useWorkspaceMutations";
import type { WorkspaceSummary } from "../types/workspace.types";

export type WorkspaceActionType = "archive" | "restore" | "leave";

export interface WorkspaceActionTarget {
  type: WorkspaceActionType;
  workspace: WorkspaceSummary;
}

interface WorkspaceActionDialogsProps {
  target: WorkspaceActionTarget | null;
  onClose: () => void;
}

export function WorkspaceActionDialogs({ target, onClose }: WorkspaceActionDialogsProps) {
  const navigate = useNavigate();
  const archiveMutation = useArchiveWorkspaceMutation();
  const restoreMutation = useRestoreWorkspaceMutation();
  const leaveMutation = useLeaveWorkspaceMutation();

  const activeMutation =
    target?.type === "archive" ? archiveMutation : target?.type === "restore" ? restoreMutation : leaveMutation;

  function handleClose() {
    if (activeMutation.isPending) return;
    archiveMutation.reset();
    restoreMutation.reset();
    leaveMutation.reset();
    onClose();
  }

  function handleConfirm() {
    if (!target) return;

    if (target.type === "archive") {
      archiveMutation.mutate(target.workspace._id, {
        onSuccess: () => {
          toast.success("Workspace archived.");
          onClose();
        },
      });
    } else if (target.type === "restore") {
      restoreMutation.mutate(target.workspace._id, {
        onSuccess: () => {
          toast.success("Workspace restored.");
          onClose();
        },
      });
    } else {
      leaveMutation.mutate(target.workspace._id, {
        onSuccess: () => {
          toast.success("You left the workspace.");
          navigate("/dashboard");
          onClose();
        },
      });
    }
  }

  if (!target) {
    return null;
  }

  const copy: Record<WorkspaceActionType, { title: string; description: string; confirmLabel: string; tone: "danger" | "default" }> = {
    archive: {
      title: "Archive workspace?",
      description: `"${target.workspace.name}" will remain readable, but no further changes can be made until it's restored.`,
      confirmLabel: "Archive workspace",
      tone: "danger",
    },
    restore: {
      title: "Restore workspace?",
      description: `"${target.workspace.name}" will become active again and mutations will be re-enabled.`,
      confirmLabel: "Restore workspace",
      tone: "default",
    },
    leave: {
      title: "Leave workspace?",
      description: `You'll lose access to "${target.workspace.name}". Any project memberships and active task assignments inside this workspace will be revoked.`,
      confirmLabel: "Leave workspace",
      tone: "danger",
    },
  };

  const activeCopy = copy[target.type];

  return (
    <ConfirmDialog
      open={Boolean(target)}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={activeCopy.title}
      description={activeCopy.description}
      confirmLabel={activeCopy.confirmLabel}
      confirmVariant={activeCopy.tone === "danger" ? "danger" : "primary"}
      tone={activeCopy.tone}
      isPending={activeMutation.isPending}
      errorMessage={activeMutation.error?.message}
    />
  );
}
