import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { editWorkspaceSchema, type EditWorkspaceFormValues } from "../schemas/workspace.schemas";
import { useUpdateWorkspaceMutation } from "../hooks/useWorkspaceMutations";
import type { UpdateWorkspacePayload, WorkspaceSummary } from "../types/workspace.types";

interface EditWorkspaceDialogProps {
  workspace: WorkspaceSummary | null;
  onClose: () => void;
}

export function EditWorkspaceDialog({ workspace, onClose }: EditWorkspaceDialogProps) {
  const updateWorkspaceMutation = useUpdateWorkspaceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<EditWorkspaceFormValues>({
    resolver: zodResolver(editWorkspaceSchema),
  });

  const wasOpenRef = useRef(false);
  const isOpen = Boolean(workspace);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current && workspace) {
      reset({
        name: workspace.name,
        description: workspace.description ?? "",
        avatar: workspace.avatar ?? "",
        timezone: workspace.timezone,
      });
      updateWorkspaceMutation.reset();
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, workspace]);

  function handleClose() {
    if (updateWorkspaceMutation.isPending) return;
    onClose();
  }

  const onSubmit = (values: EditWorkspaceFormValues) => {
    if (!workspace) return;

    const payload: UpdateWorkspacePayload = {};
    if (dirtyFields.name) payload.name = values.name;
    if (dirtyFields.description) payload.description = values.description || undefined;
    if (dirtyFields.avatar && values.avatar) payload.avatar = values.avatar;
    if (dirtyFields.timezone) payload.timezone = values.timezone;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    updateWorkspaceMutation.mutate(
      { workspaceId: workspace._id, payload },
      {
        onSuccess: () => {
          toast.success("Workspace updated successfully.");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={Boolean(workspace)}
      onClose={handleClose}
      title="Edit workspace"
      description="Update your workspace details."
    >
      {updateWorkspaceMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {updateWorkspaceMutation.error?.message ?? "Unable to update workspace."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="edit-workspace-name">Name</Label>
          <Input id="edit-workspace-name" error={errors.name?.message} {...register("name")} />
        </div>

        <div className="mb-4">
          <Label htmlFor="edit-workspace-description">
            Description <span className="text-muted/60">(optional)</span>
          </Label>
          <Textarea id="edit-workspace-description" rows={3} error={errors.description?.message} {...register("description")} />
        </div>

        <div className="mb-4">
          <Label htmlFor="edit-workspace-avatar">
            Avatar URL <span className="text-muted/60">(optional)</span>
          </Label>
          <Input
            id="edit-workspace-avatar"
            placeholder="https://..."
            error={errors.avatar?.message}
            {...register("avatar")}
          />
        </div>

        <div>
          <Label htmlFor="edit-workspace-timezone">Timezone</Label>
          <Input id="edit-workspace-timezone" error={errors.timezone?.message} {...register("timezone")} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={updateWorkspaceMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateWorkspaceMutation.isPending}>
            {updateWorkspaceMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
