import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Archive, RotateCcw } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/date";
import type { ProjectMember } from "@/features/project-members/types/projectMember.types";
import {
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} from "../hooks/useTaskMutations";
import {
  updateTaskSchema,
  type UpdateTaskFormValues,
} from "../schemas/task.schemas";
import { ALL_STATUSES, STATUS_LABEL } from "../task.filters";
import type { Task, TaskStatus } from "../types/task.types";
import { ManageTaskAssignees } from "./ManageTaskAssignees";

interface EditTaskDialogProps {
  task: Task | null;
  projectId: string;
  members: ProjectMember[];
  canEdit: boolean;
  canChangeStatus: boolean;
  canManageAssignees: boolean;
  canArchive: boolean;
  canRestore: boolean;
  onClose: () => void;
  onRequestArchive: (task: Task) => void;
  onRequestRestore: (task: Task) => void;
}

function toDateInputValue(value: string | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function EditTaskDialog({
  task,
  projectId,
  members,
  canEdit,
  canChangeStatus,
  canManageAssignees,
  canArchive,
  canRestore,
  onClose,
  onRequestArchive,
  onRequestRestore,
}: EditTaskDialogProps) {
  const updateTaskMutation = useUpdateTaskMutation(projectId);
  const updateStatusMutation = useUpdateTaskStatusMutation(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "task",
      priority: "MEDIUM",
      startDate: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        startDate: toDateInputValue(task.startDate),
        dueDate: toDateInputValue(task.dueDate),
      });
      updateTaskMutation.reset();
    }
  }, [task?._id]);

  function handleClose() {
    if (updateTaskMutation.isPending) return;
    onClose();
  }

  function handleStatusChange(status: TaskStatus) {
    if (!task || status === task.status) return;
    updateStatusMutation.mutate(
      { taskId: task._id, status },
      {
        onSuccess: () => toast.success("Status updated."),
        onError: (error) =>
          toast.error(error.message ?? "Unable to update status."),
      },
    );
  }

  const onSubmit = (values: UpdateTaskFormValues) => {
    if (!task) return;

    updateTaskMutation.mutate(
      {
        taskId: task._id,
        payload: {
          title: values.title,
          description: values.description ?? "",
          type: values.type,
          priority: values.priority,
          ...(values.startDate ? { startDate: values.startDate } : {}),
          ...(values.dueDate ? { dueDate: values.dueDate } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Changes saved.");
          onClose();
        },
      },
    );
  };

  if (!task) return null;

  return (
    <Dialog
      open={Boolean(task)}
      onClose={handleClose}
      title={task.type === "issue" ? "Edit issue" : "Edit task"}
    >
      {updateTaskMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {updateTaskMutation.error?.message ?? "Unable to save changes."}
        </div>
      )}

      <div className="mb-4">
        <Label>Status</Label>
        <select
          value={task.status}
          disabled={!canChangeStatus || updateStatusMutation.isPending}
          onChange={(event) =>
            handleStatusChange(event.target.value as TaskStatus)
          }
          className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-muted/60 disabled:opacity-60"
        >
          {ALL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <Label>Assignees</Label>
        <ManageTaskAssignees
          task={task}
          projectId={projectId}
          members={members}
          canManage={canManageAssignees}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={!canEdit} className="contents">
          <div className="mb-4 flex gap-3">
            <div className="w-32 shrink-0">
              <Label htmlFor="edit-task-type">Type</Label>
              <select
                id="edit-task-type"
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-muted/60 disabled:opacity-60"
                {...register("type")}
              >
                <option value="task">Task</option>
                <option value="issue">Issue</option>
              </select>
            </div>
            <div className="min-w-0 flex-1">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input
                id="edit-task-title"
                error={errors.title?.message}
                {...register("title")}
              />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="edit-task-description">
              Description <span className="text-muted/60">(optional)</span>
            </Label>
            <Textarea
              id="edit-task-description"
              rows={4}
              error={errors.description?.message}
              {...register("description")}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="edit-task-priority">Priority</Label>
            <select
              id="edit-task-priority"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-muted/60 disabled:opacity-60"
              {...register("priority")}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="mb-1 flex gap-3">
            <div className="min-w-0 flex-1">
              <Label htmlFor="edit-task-start-date">
                Start date <span className="text-muted/60">(optional)</span>
              </Label>
              <Input
                id="edit-task-start-date"
                type="date"
                error={errors.startDate?.message}
                {...register("startDate")}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Label htmlFor="edit-task-due-date">
                Due date <span className="text-muted/60">(optional)</span>
              </Label>
              <Input
                id="edit-task-due-date"
                type="date"
                className={cn(errors.dueDate && "border-danger")}
                error={errors.dueDate?.message}
                {...register("dueDate")}
              />
            </div>
          </div>
          <p className="mb-4 text-[11px] text-muted/70">
            Once set, a date can be changed but not cleared.
          </p>
        </fieldset>

        <p className="mb-4 text-[11px] text-muted/70">
          Created {formatRelativeTime(task.createdAt)}
          {task.updatedAt !== task.createdAt
            ? ` · Updated ${formatRelativeTime(task.updatedAt)}`
            : ""}
        </p>

        <DialogFooter className="items-center justify-between sm:justify-between">
          <div>
            {canArchive && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onRequestArchive(task)}
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
            )}
            {canRestore && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onRequestRestore(task)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={updateTaskMutation.isPending}
            >
              Close
            </Button>
            {canEdit && (
              <Button
                type="submit"
                disabled={updateTaskMutation.isPending || !isDirty}
              >
                {updateTaskMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
