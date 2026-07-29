import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUpdateProjectMutation } from "../hooks/useProjectMutations";
import { editProjectSchema, type EditProjectFormValues } from "../schemas/project.schemas";
import type { Project } from "../types/project.types";

interface EditProjectDialogProps {
  project: Project | null;
  workspaceId: string;
  onClose: () => void;
}

export function EditProjectDialog({ project, workspaceId, onClose }: EditProjectDialogProps) {
  const updateProjectMutation = useUpdateProjectMutation(project?._id ?? "", workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: { name: "", description: "", icon: "" },
  });

  useEffect(() => {
    if (project) {
      reset({ name: project.name, description: project.description, icon: project.icon });
      updateProjectMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  function handleClose() {
    if (updateProjectMutation.isPending) return;
    onClose();
  }

  const onSubmit = (values: EditProjectFormValues) => {
    updateProjectMutation.mutate(
      { name: values.name, description: values.description ?? "", icon: values.icon || undefined },
      {
        onSuccess: () => {
          toast.success("Project updated successfully.");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={Boolean(project)} onClose={handleClose} title="Edit project" description="Update the project's details.">
      {updateProjectMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {updateProjectMutation.error?.message ?? "Unable to update project."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4 flex gap-3">
          <div className="w-20 shrink-0">
            <Label htmlFor="edit-project-icon">Icon</Label>
            <Input id="edit-project-icon" maxLength={10} error={errors.icon?.message} {...register("icon")} />
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="edit-project-name">Name</Label>
            <Input id="edit-project-name" error={errors.name?.message} {...register("name")} />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-project-description">
            Description <span className="text-muted/60">(optional)</span>
          </Label>
          <Textarea id="edit-project-description" rows={3} error={errors.description?.message} {...register("description")} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={updateProjectMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateProjectMutation.isPending}>
            {updateProjectMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
