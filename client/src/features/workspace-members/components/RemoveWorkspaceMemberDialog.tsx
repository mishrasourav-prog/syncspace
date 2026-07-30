import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRemoveWorkspaceMemberMutation } from "../hooks/useWorkspaceMemberMutations";
import type { WorkspaceMember } from "../types/workspaceMember.types";

interface RemoveWorkspaceMemberDialogProps {
  workspaceId: string;
  member: WorkspaceMember | null;
  onClose: () => void;
}

export function RemoveWorkspaceMemberDialog({
  workspaceId,
  member,
  onClose,
}: RemoveWorkspaceMemberDialogProps) {
  const removeMutation = useRemoveWorkspaceMemberMutation(workspaceId);

  function handleClose() {
    if (removeMutation.isPending) return;
    removeMutation.reset();
    onClose();
  }

  function handleConfirm() {
    if (!member) return;

    removeMutation.mutate(member._id, {
      onSuccess: () => {
        toast.success(`${member.user.name} was removed from the workspace.`);
        onClose();
      },
    });
  }

  return (
    <ConfirmDialog
      open={Boolean(member)}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Remove member?"
      description={
        member
          ? `This removes ${member.user.name} from the workspace and revokes their related project access and task assignments in this workspace.`
          : ""
      }
      confirmLabel="Remove member"
      confirmVariant="danger"
      tone="danger"
      isPending={removeMutation.isPending}
      errorMessage={removeMutation.error?.message}
    />
  );
}
