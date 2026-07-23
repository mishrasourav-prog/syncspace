import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateTaskMutation } from "../hooks/useTaskMutations";
import { createTaskSchema, type CreateTaskFormValues } from "../schemas/task.schemas";

interface CreateSubtaskDialogProps {
  projectId: string;
  parentTaskId: string;
  parentTaskTitle: string;
  open: boolean;
  onClose: () => void;
}

/**
 * A fixed-parent variant of CreateTaskDialog for adding a direct subtask
 * from the Task Detail page. No free-form parent selector is exposed.
 */
export function CreateSubtaskDialog({ projectId, parentTaskId, parentTaskTitle, open, onClose }: CreateSubtaskDialogProps) {
  const createTaskMutation = useCreateTaskMutation(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { title: "", description: "", type: "task", priority: "MEDIUM", startDate: "", dueDate: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ title: "", description: "", type: "task", priority: "MEDIUM", startDate: "", dueDate: "" });
      createTaskMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    if (createTaskMutation.isPending) return;
    reset();
    createTaskMutation.reset();
    onClose();
  }

  const onSubmit = (values: CreateTaskFormValues) => {
    createTaskMutation.mutate(
      {
        title: values.title,
        description: values.description || undefined,
        type: values.type,
        priority: values.priority,
        startDate: values.startDate || undefined,
        dueDate: values.dueDate || undefined,
        parentTask: parentTaskId,
      },
      {
        onSuccess: () => {
          toast.success("Subtask created.");
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} title="New subtask" description={`Add a direct subtask of "${parentTaskTitle}".`}>
      {createTaskMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {createTaskMutation.error?.message ?? "Unable to create subtask."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4 flex gap-3">
          <div className="w-32 shrink-0">
            <Label htmlFor="subtask-type">Type</Label>
            <select
              id="subtask-type"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-muted/60"
              {...register("type")}
            >
              <option value="task">Task</option>
              <option value="issue">Issue</option>
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="subtask-title">Title</Label>
            <Input id="subtask-title" error={errors.title?.message} {...register("title")} />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="subtask-description">
            Description <span className="text-muted/60">(optional)</span>
          </Label>
          <Textarea id="subtask-description" rows={3} error={errors.description?.message} {...register("description")} />
        </div>

        <div className="mb-4">
          <Label htmlFor="subtask-priority">Priority</Label>
          <select
            id="subtask-priority"
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-muted/60"
            {...register("priority")}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="mb-4 flex gap-3">
          <div className="min-w-0 flex-1">
            <Label htmlFor="subtask-start-date">
              Start date <span className="text-muted/60">(optional)</span>
            </Label>
            <Input id="subtask-start-date" type="date" error={errors.startDate?.message} {...register("startDate")} />
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="subtask-due-date">
              Due date <span className="text-muted/60">(optional)</span>
            </Label>
            <Input
              id="subtask-due-date"
              type="date"
              className={cn(errors.dueDate && "border-danger")}
              error={errors.dueDate?.message}
              {...register("dueDate")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createTaskMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTaskMutation.isPending}>
            {createTaskMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
