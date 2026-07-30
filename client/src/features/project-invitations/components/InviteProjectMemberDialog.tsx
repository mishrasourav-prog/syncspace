import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInviteProjectMemberMutation } from "../hooks/useProjectInvitationMutations";
import {
  inviteProjectMemberSchema,
  type InviteProjectMemberFormValues,
} from "../schemas/projectInvitation.schemas";

interface InviteProjectMemberDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onClose: () => void;
}

export function InviteProjectMemberDialog({
  projectId,
  projectName,
  open,
  onClose,
}: InviteProjectMemberDialogProps) {
  const inviteMutation = useInviteProjectMemberMutation(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteProjectMemberFormValues>({
    resolver: zodResolver(inviteProjectMemberSchema),
    defaultValues: { email: "", role: "member" },
  });

  useEffect(() => {
    if (open) {
      reset({ email: "", role: "member" });
      inviteMutation.reset();
    }
  }, [open]);

  function handleClose() {
    if (inviteMutation.isPending) return;
    onClose();
  }

  const onSubmit = (values: InviteProjectMemberFormValues) => {
    inviteMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Invitation created successfully.");
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Invite to project"
      description={`Invite an existing workspace member to join "${projectName}". They must already have a SyncSpace account and be a member of this workspace.`}
    >
      {inviteMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {inviteMutation.error?.message ?? "Unable to send invitation."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="project-invite-email">Email</Label>
          <Input
            id="project-invite-email"
            type="email"
            placeholder="teammate@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div>
          <Label htmlFor="project-invite-role">Role</Label>
          <select
            id="project-invite-role"
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors duration-200",
              errors.role
                ? "border-danger focus:border-danger"
                : "border-border focus:border-muted/60",
            )}
            {...register("role")}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={inviteMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={inviteMutation.isPending}>
            {inviteMutation.isPending ? "Sending..." : "Send invitation"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
