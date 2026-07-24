import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useArchiveDocumentMutation, useRestoreDocumentMutation } from "../hooks/useDocumentMutations";
import type { ProjectDocument } from "../types/document.types";

export type DocumentActionType = "archive" | "restore";

export interface DocumentActionTarget {
  type: DocumentActionType;
  document: ProjectDocument;
}

interface DocumentArchiveDialogsProps {
  target: DocumentActionTarget | null;
  projectId: string;
  onClose: () => void;
}

export function DocumentArchiveDialogs({ target, projectId, onClose }: DocumentArchiveDialogsProps) {
  const archiveMutation = useArchiveDocumentMutation(projectId);
  const restoreMutation = useRestoreDocumentMutation(projectId);

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
      archiveMutation.mutate(target.document._id, {
        onSuccess: () => {
          toast.success(`"${target.document.title || "Untitled document"}" was archived.`);
          onClose();
        },
        onError: (error) => toast.error(error.message ?? "Unable to archive this document."),
      });
    } else {
      restoreMutation.mutate(target.document._id, {
        onSuccess: () => {
          toast.success(`"${target.document.title || "Untitled document"}" was restored.`);
          onClose();
        },
        onError: (error) => toast.error(error.message ?? "Unable to restore this document."),
      });
    }
  }

  if (!target) return null;

  const isArchive = target.type === "archive";
  const titleLabel = target.document.title || "Untitled document";

  return (
    <ConfirmDialog
      open={Boolean(target)}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={isArchive ? "Archive this document?" : "Restore this document?"}
      description={
        isArchive
          ? `"${titleLabel}" will move to Archived and become read-only until it's restored.`
          : `"${titleLabel}" will become active again.`
      }
      confirmLabel={isArchive ? "Archive document" : "Restore document"}
      confirmVariant={isArchive ? "danger" : "primary"}
      tone={isArchive ? "danger" : "default"}
      isPending={activeMutation.isPending}
      errorMessage={activeMutation.error?.message}
    />
  );
}
