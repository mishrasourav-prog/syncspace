import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRemoveProjectMemberMutation } from "../hooks/useProjectMemberMutations";
import type { ProjectMember } from "../types/projectMember.types";

interface RemoveProjectMemberDialogProps {
  projectId: string;
  member: ProjectMember | null;
  onClose: () => void;
}

export function RemoveProjectMemberDialog({ projectId, member, onClose }: RemoveProjectMemberDialogProps) {
  const removeMutation = useRemoveProjectMemberMutation(projectId);

  function handleClose() {
    if (removeMutation.isPending) return;
    removeMutation.reset();
    onClose();
  }

  function handleConfirm() {
    if (!member) return;

    removeMutation.mutate(member._id, {
      onSuccess: () => {
        toast.success(`${member.user.name} was removed from the project.`);
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
          ? `This removes ${member.user.name} from the project and deletes their task assignments in it.`
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
