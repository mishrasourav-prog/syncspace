import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getInvitableWorkspaceRoles } from "@/features/workspaces/workspace.permissions";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import { useInviteWorkspaceMemberMutation } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationMutations";
import {
  inviteWorkspaceMemberSchema,
  type InviteWorkspaceMemberFormValues,
} from "../schemas/workspaceMember.schemas";

interface InviteWorkspaceMemberDialogProps {
  workspace: WorkspaceSummary;
  open: boolean;
  onClose: () => void;
}

const ROLE_LABELS: Record<InviteWorkspaceMemberFormValues["role"], string> = {
  admin: "Admin",
  member: "Member",
  guest: "Guest",
};

export function InviteWorkspaceMemberDialog({ workspace, open, onClose }: InviteWorkspaceMemberDialogProps) {
  const inviteMutation = useInviteWorkspaceMemberMutation(workspace._id);
  const invitableRoles = getInvitableWorkspaceRoles(workspace);

  const defaultRole =
    invitableRoles.find((role) => role === workspace.settings.defaultRole) ?? invitableRoles[0] ?? "member";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteWorkspaceMemberFormValues>({
    resolver: zodResolver(inviteWorkspaceMemberSchema),
    defaultValues: { email: "", role: defaultRole },
  });

  useEffect(() => {
    if (open) {
      reset({ email: "", role: defaultRole });
      inviteMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    if (inviteMutation.isPending) return;
    onClose();
  }

  const onSubmit = (values: InviteWorkspaceMemberFormValues) => {
    inviteMutation.mutate(
      { email: values.email, role: values.role },
      {
        onSuccess: () => {
          toast.success("Invitation created successfully.");
          reset();
          onClose();
        },
      }
    );
  };

  if (invitableRoles.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Invite a member"
      description={`Invite someone to join "${workspace.name}".`}
    >
      {inviteMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {inviteMutation.error?.message ?? "Unable to send invitation."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="teammate@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div>
          <Label htmlFor="invite-role">Role</Label>
          <select
            id="invite-role"
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors duration-200",
              errors.role ? "border-danger focus:border-danger" : "border-border focus:border-muted/60"
            )}
            {...register("role")}
          >
            {invitableRoles.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          {errors.role?.message && <p className="mt-1.5 text-xs text-danger">{errors.role.message}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={inviteMutation.isPending}>
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
