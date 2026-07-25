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
import { replyBodySchema } from "../../schemas/discussion.schemas";
import { useDeleteDiscussionReplyMutation, useUpdateDiscussionReplyMutation } from "../../hooks/useDiscussionReplyMutations";
import type { DiscussionReply } from "../../types/discussion.types";

interface DiscussionReplyItemProps {
  projectId: string;
  discussionId: string;
  reply: DiscussionReply;
  canEdit: boolean;
  canDelete: boolean;
}

export function DiscussionReplyItem({ projectId, discussionId, reply, canEdit, canDelete }: DiscussionReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(reply.body ?? "");
  const [draftError, setDraftError] = useState<string | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updateMutation = useUpdateDiscussionReplyMutation(projectId, discussionId);
  const deleteMutation = useDeleteDiscussionReplyMutation(projectId, discussionId);

  function startEditing() {
    setDraft(reply.body ?? "");
    setDraftError(undefined);
    setIsEditing(true);
  }

  function handleSaveEdit() {
    const result = replyBodySchema.safeParse(draft);
    if (!result.success) {
      setDraftError(result.error.issues[0]?.message);
      return;
    }

    if (result.data === reply.body) {
      setIsEditing(false);
      return;
    }

    updateMutation.mutate(
      { replyId: reply._id, body: result.data },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Reply updated.");
        },
        onError: (error) => toast.error(error.message ?? "Unable to update this reply."),
      }
    );
  }

  function handleDelete() {
    deleteMutation.mutate(reply._id, {
      onSuccess: () => {
        setConfirmingDelete(false);
        toast.success("Reply deleted.");
      },
      onError: (error) => toast.error(error.message ?? "Unable to delete this reply."),
    });
  }

  if (reply.isDeleted) {
    return (
      <div className="flex gap-3 py-3 opacity-60">
        <Avatar name="Deleted" size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm italic text-muted">This reply was deleted.</p>
          <p className="mt-0.5 text-[11px] text-muted/70" title={formatDateTime(reply.createdAt)}>
            {formatRelativeTime(reply.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  const isEdited =
    Math.abs(new Date(reply.updatedAt).getTime() - new Date(reply.createdAt).getTime()) > 1000;

  return (
    <div className="flex gap-3 py-3">
      <Avatar src={reply.author?.avatar} name={reply.author?.name ?? "Former member"} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{reply.author?.name ?? "Former member"}</span>
            <span className="text-[11px] text-muted" title={formatDateTime(reply.createdAt)}>
              {formatRelativeTime(reply.createdAt)}
            </span>
            {isEdited && <span className="text-[11px] text-muted/70">(edited)</span>}
          </div>

          {(canEdit || canDelete) && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Reply actions">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {canEdit && <DropdownMenuItem onClick={startEditing}>Edit</DropdownMenuItem>}
                {canDelete && (
                  <DropdownMenuItem variant="danger" onClick={() => setConfirmingDelete(true)}>
                    Delete reply
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
              onChange={(event) => {
                setDraft(event.target.value);
                if (draftError) setDraftError(undefined);
              }}
              rows={3}
              maxLength={5000}
              error={draftError}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending || !draft.trim()}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/90">{reply.body}</p>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
        title="Delete this reply?"
        description="This reply will be marked as deleted. This cannot be undone."
        confirmLabel="Delete reply"
        confirmVariant="danger"
        tone="danger"
        isPending={deleteMutation.isPending}
        errorMessage={deleteMutation.error?.message}
      />
    </div>
  );
}
