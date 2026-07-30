import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, formatRelativeTime } from "@/lib/date";
import {
  useDeleteTaskCommentMutation,
  useUpdateTaskCommentMutation,
} from "../../hooks/useTaskCommentMutations";
import type { TaskComment } from "../../types/taskComment.types";

interface TaskCommentItemProps {
  projectId: string;
  taskId: string;
  comment: TaskComment;
  canEdit: boolean;
  canDelete: boolean;
}

export function TaskCommentItem({
  projectId,
  taskId,
  comment,
  canEdit,
  canDelete,
}: TaskCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updateMutation = useUpdateTaskCommentMutation(projectId, taskId);
  const deleteMutation = useDeleteTaskCommentMutation(projectId, taskId);

  function startEditing() {
    setDraft(comment.body);
    setIsEditing(true);
  }

  function handleSaveEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.body) return;

    updateMutation.mutate(
      { commentId: comment._id, body: trimmed },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Comment updated.");
        },
        onError: (error) =>
          toast.error(error.message ?? "Unable to update comment."),
      },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(comment._id, {
      onSuccess: () => {
        setConfirmingDelete(false);
        toast.success("Comment deleted.");
      },
      onError: (error) =>
        toast.error(error.message ?? "Unable to delete comment."),
    });
  }

  if (comment.isDeleted) {
    return (
      <div className="flex gap-3 py-3 opacity-60">
        <Avatar name="Deleted" size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm italic text-muted">{comment.body}</p>
          <p className="mt-0.5 text-[11px] text-muted/70">
            {formatRelativeTime(comment.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-3">
      <Avatar
        src={comment.author?.avatar}
        name={comment.author?.name ?? "Unavailable member"}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.author?.name ?? "Unavailable member"}
            </span>
            <span
              className="text-[11px] text-muted"
              title={formatDateTime(comment.createdAt)}
            >
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-[11px] text-muted/70">(edited)</span>
            )}
          </div>

          {(canEdit || canDelete) && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Comment actions">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {canEdit && (
                  <DropdownMenuItem onClick={startEditing}>
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    variant="danger"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Delete comment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1.5">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              maxLength={10000}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditing(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={
                  updateMutation.isPending ||
                  !draft.trim() ||
                  draft.trim() === comment.body
                }
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/90">
            {comment.body}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
        title="Delete comment?"
        description="This comment will be marked as deleted. This cannot be undone."
        confirmLabel="Delete comment"
        confirmVariant="danger"
        tone="danger"
        isPending={deleteMutation.isPending}
        errorMessage={deleteMutation.error?.message}
      />
    </div>
  );
}
