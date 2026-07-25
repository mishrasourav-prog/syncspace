import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateDiscussionMutation } from "../hooks/useDiscussionMutations";
import {
  editDiscussionSchema,
  type EditDiscussionFormValues,
} from "../schemas/discussion.schemas";
import type {
  Discussion,
  UpdateDiscussionPayload,
} from "../types/discussion.types";

interface EditDiscussionDialogProps {
  projectId: string;
  discussion: Discussion | null;
  onClose: () => void;
}

export function EditDiscussionDialog({
  projectId,
  discussion,
  onClose,
}: EditDiscussionDialogProps) {
  const updateMutation = useUpdateDiscussionMutation(
    projectId,
    discussion?._id ?? ""
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditDiscussionFormValues>({
    resolver: zodResolver(editDiscussionSchema),
    values: {
      title: discussion?.title ?? "",
      body: discussion?.body ?? "",
    },
  });

  const currentTitle = useWatch({ control, name: "title" }) ?? "";
  const currentBody = useWatch({ control, name: "body" }) ?? "";
  const isUnchanged =
    currentTitle.trim() === discussion?.title &&
    currentBody.trim() === discussion?.body;

  function handleClose() {
    if (updateMutation.isPending) return;
    onClose();
  }

  function onSubmit(values: EditDiscussionFormValues) {
    if (!discussion) return;

    const payload: UpdateDiscussionPayload = {};
    if (values.title !== discussion.title) payload.title = values.title;
    if (values.body !== discussion.body) payload.body = values.body;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Discussion updated.");
        onClose();
      },
      onError: (error) =>
        toast.error(error.message ?? "Unable to update this discussion."),
    });
  }

  if (!discussion) return null;

  return (
    <Dialog
      open
      onClose={handleClose}
      title="Edit discussion"
      description="Update the title or discussion message."
      disableOutsideClose={updateMutation.isPending}
    >
      {updateMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {updateMutation.error?.message ??
            "Unable to update this discussion."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="discussion-edit-title">Title</Label>
          <Input
            id="discussion-edit-title"
            autoFocus
            maxLength={200}
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="discussion-edit-body">Message</Label>
          <Textarea
            id="discussion-edit-body"
            rows={7}
            maxLength={10_000}
            error={errors.body?.message}
            {...register("body")}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending || isUnchanged}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
