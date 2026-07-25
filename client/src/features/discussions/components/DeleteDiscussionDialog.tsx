import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteDiscussionMutation } from "../hooks/useDiscussionMutations";
import type { Discussion } from "../types/discussion.types";

interface DeleteDiscussionDialogProps {
  workspaceId: string;
  projectId: string;
  discussion: Discussion | null;
  returnSearch?: string;
  onClose: () => void;
}

export function DeleteDiscussionDialog({
  workspaceId,
  projectId,
  discussion,
  returnSearch,
  onClose,
}: DeleteDiscussionDialogProps) {
  const deleteMutation = useDeleteDiscussionMutation(
    projectId,
    discussion?._id ?? ""
  );
  const navigate = useNavigate();

  function handleClose() {
    if (deleteMutation.isPending) return;
    onClose();
  }

  function handleConfirm() {
    if (!discussion) return;

    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Discussion deleted.");
        onClose();
        const basePath = `/workspaces/${workspaceId}/projects/${projectId}/discussions`;
        navigate(`${basePath}${returnSearch ? `?${returnSearch}` : ""}`, {
          replace: true,
        });
      },
      onError: (error) =>
        toast.error(error.message ?? "Unable to delete this discussion."),
    });
  }

  return (
    <ConfirmDialog
      open={Boolean(discussion)}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Delete this discussion?"
      description={`"${discussion?.title ?? ""}" will be removed from this project. Its replies will no longer be accessible. This cannot be undone.`}
      confirmLabel="Delete discussion"
      confirmVariant="danger"
      tone="danger"
      isPending={deleteMutation.isPending}
      errorMessage={deleteMutation.error?.message}
    />
  );
}
