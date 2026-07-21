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

interface CreateTaskDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function CreateTaskDialog({ projectId, open, onClose }: CreateTaskDialogProps) {
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
      },
      {
        onSuccess: (createdTask) => {
          toast.success(`${createdTask.type === "issue" ? "Issue" : "Task"} created successfully.`);
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} title="New task or issue" description="Add a work item to this project.">
      {createTaskMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {createTaskMutation.error?.message ?? "Unable to create work item."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4 flex gap-3">
          <div className="w-32 shrink-0">
            <Label htmlFor="task-type">Type</Label>
            <select
              id="task-type"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-muted/60"
              {...register("type")}
            >
              <option value="task">Task</option>
              <option value="issue">Issue</option>
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" placeholder="Add login page validation" error={errors.title?.message} {...register("title")} />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="task-description">
            Description <span className="text-muted/60">(optional)</span>
          </Label>
          <Textarea
            id="task-description"
            rows={3}
            placeholder="Add more detail…"
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="task-priority">Priority</Label>
          <select
            id="task-priority"
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
            <Label htmlFor="task-start-date">
              Start date <span className="text-muted/60">(optional)</span>
            </Label>
            <Input id="task-start-date" type="date" error={errors.startDate?.message} {...register("startDate")} />
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="task-due-date">
              Due date <span className="text-muted/60">(optional)</span>
            </Label>
            <Input
              id="task-due-date"
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
