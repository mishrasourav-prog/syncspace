import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "../schemas/project.schemas";
import { useCreateProjectMutation } from "../hooks/useProjectMutations";

interface CreateProjectDialogProps {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({
  workspaceId,
  open,
  onClose,
}: CreateProjectDialogProps) {
  const createProjectMutation = useCreateProjectMutation(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  function handleClose() {
    if (createProjectMutation.isPending) return;
    reset();
    createProjectMutation.reset();
    onClose();
  }

  const onSubmit = (values: CreateProjectFormValues) => {
    createProjectMutation.mutate(
      {
        name: values.name,
        description: values.description || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully.");
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Create project"
      description="Projects organize tasks, documents, and discussions inside this workspace."
    >
      {createProjectMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {createProjectMutation.error?.message ?? "Unable to create project."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="project-name">Name</Label>
          <Input
            id="project-name"
            placeholder="Website Redesign"
            error={errors.name?.message}
            {...register("name")}
          />
          <p className="mt-1 text-xs text-muted">
            A default project icon is assigned automatically.
          </p>
        </div>

        <div>
          <Label htmlFor="project-description">
            Description <span className="text-muted/60">(optional)</span>
          </Label>
          <Textarea
            id="project-description"
            rows={3}
            placeholder="What is this project for?"
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={createProjectMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createProjectMutation.isPending}>
            {createProjectMutation.isPending ? "Creating..." : "Create project"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
