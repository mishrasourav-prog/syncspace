import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDiscussionMutation } from "../hooks/useDiscussionMutations";
import { createDiscussionSchema, type CreateDiscussionFormValues } from "../schemas/discussion.schemas";

interface CreateDiscussionDialogProps {
  workspaceId: string;
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function CreateDiscussionDialog({ workspaceId, projectId, open, onClose }: CreateDiscussionDialogProps) {
  const createMutation = useCreateDiscussionMutation(projectId);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDiscussionFormValues>({
    resolver: zodResolver(createDiscussionSchema),
    defaultValues: { title: "", body: "" },
  });

  function handleClose() {
    if (createMutation.isPending) return;
    reset();
    onClose();
  }

  function onSubmit(values: CreateDiscussionFormValues) {
    createMutation.mutate(values, {
      onSuccess: (createdDiscussion) => {
        toast.success("Discussion started.");
        reset();
        onClose();
        navigate(`/workspaces/${workspaceId}/projects/${projectId}/discussions/${createdDiscussion._id}`);
      },
      onError: (error) => toast.error(error.message ?? "Unable to start this discussion."),
    });
  }

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Start a discussion"
      description="Share something with the project for feedback or a decision."
      disableOutsideClose={createMutation.isPending}
    >
      {createMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {createMutation.error?.message ?? "Unable to start this discussion."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="discussion-create-title">Title</Label>
          <Input id="discussion-create-title" autoFocus maxLength={200} error={errors.title?.message} {...register("title")} />
        </div>

        <div className="mb-4">
          <Label htmlFor="discussion-create-body">Message</Label>
          <Textarea id="discussion-create-body" rows={7} maxLength={10_000} error={errors.body?.message} {...register("body")} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Starting..." : "Start discussion"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
