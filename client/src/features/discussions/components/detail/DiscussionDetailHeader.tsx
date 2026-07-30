import { toast } from "sonner";
import { Lock, MoreHorizontal, Pin, Unlock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, formatRelativeTime } from "@/lib/date";
import {
  useLockDiscussionMutation,
  usePinDiscussionMutation,
  useUnlockDiscussionMutation,
  useUnpinDiscussionMutation,
} from "../../hooks/useDiscussionMutations";
import type { Discussion } from "../../types/discussion.types";

interface DiscussionDetailHeaderProps {
  projectId: string;
  discussion: Discussion;
  canEdit: boolean;
  canDelete: boolean;
  canModerate: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function DiscussionDetailHeader({
  projectId,
  discussion,
  canEdit,
  canDelete,
  canModerate,
  onEdit,
  onDelete,
}: DiscussionDetailHeaderProps) {
  const pinMutation = usePinDiscussionMutation(projectId, discussion._id);
  const unpinMutation = useUnpinDiscussionMutation(projectId, discussion._id);
  const lockMutation = useLockDiscussionMutation(projectId, discussion._id);
  const unlockMutation = useUnlockDiscussionMutation(projectId, discussion._id);

  const isModerationPending =
    pinMutation.isPending ||
    unpinMutation.isPending ||
    lockMutation.isPending ||
    unlockMutation.isPending;

  function handleTogglePin() {
    const mutation = discussion.isPinned ? unpinMutation : pinMutation;
    mutation.mutate(undefined, {
      onSuccess: () =>
        toast.success(
          discussion.isPinned ? "Discussion unpinned." : "Discussion pinned.",
        ),
      onError: (error) =>
        toast.error(error.message ?? "Unable to update this discussion."),
    });
  }

  function handleToggleLock() {
    const mutation = discussion.isLocked ? unlockMutation : lockMutation;
    mutation.mutate(undefined, {
      onSuccess: () =>
        toast.success(
          discussion.isLocked ? "Discussion unlocked." : "Discussion locked.",
        ),
      onError: (error) =>
        toast.error(error.message ?? "Unable to update this discussion."),
    });
  }

  const hasMenu = canEdit || canDelete || canModerate;
  const isEdited =
    Math.abs(
      new Date(discussion.updatedAt).getTime() -
        new Date(discussion.createdAt).getTime(),
    ) > 1000;

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {discussion.isPinned && (
              <Badge variant="warning">
                <Pin className="h-3 w-3" /> Pinned
              </Badge>
            )}
            {discussion.isLocked && (
              <Badge variant="neutral">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            )}
          </div>
          <h1 className="text-h1 break-words text-foreground">
            {discussion.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <Avatar
              src={discussion.author?.avatar}
              name={discussion.author?.name ?? "Former member"}
              size="sm"
            />
            <span className="font-medium text-foreground">
              {discussion.author?.name ?? "Former member"}
            </span>
            <span aria-hidden>·</span>
            <span title={formatDateTime(discussion.createdAt)}>
              {formatRelativeTime(discussion.createdAt)}
            </span>
            {isEdited && <span className="text-muted/70">(edited)</span>}
          </div>
        </div>

        {hasMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Discussion actions">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {canEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Edit discussion
                </DropdownMenuItem>
              )}
              {canModerate && (
                <DropdownMenuItem
                  onClick={handleTogglePin}
                  disabled={isModerationPending}
                >
                  <Pin className="h-3.5 w-3.5" />{" "}
                  {discussion.isPinned ? "Unpin discussion" : "Pin discussion"}
                </DropdownMenuItem>
              )}
              {canModerate && (
                <DropdownMenuItem
                  onClick={handleToggleLock}
                  disabled={isModerationPending}
                >
                  {discussion.isLocked ? (
                    <>
                      <Unlock className="h-3.5 w-3.5" /> Unlock discussion
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" /> Lock discussion
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="danger" onClick={onDelete}>
                    Delete discussion
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
        {discussion.body}
      </p>

      {discussion.isLocked && (
        <p className="mt-4 rounded-lg border border-warning/25 bg-warning/10 px-3 py-2 text-xs text-warning">
          This discussion is locked. New replies and edits are disabled.
        </p>
      )}
    </div>
  );
}
