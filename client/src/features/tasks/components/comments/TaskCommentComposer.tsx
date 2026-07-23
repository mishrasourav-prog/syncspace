import { useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/app/store";
import { useCreateTaskCommentMutation } from "../../hooks/useTaskCommentMutations";

const MAX_LENGTH = 10000;
const WARN_THRESHOLD = 9500;

interface TaskCommentComposerProps {
  projectId: string;
  taskId: string;
  canComment: boolean;
  disabledReason?: string;
}

export function TaskCommentComposer({
  projectId,
  taskId,
  canComment,
  disabledReason,
}: TaskCommentComposerProps) {
  const [body, setBody] = useState("");
  const user = useAuthStore((state) => state.user);
  const createMutation = useCreateTaskCommentMutation(projectId, taskId);

  const trimmed = body.trim();

  function handleSubmit() {
    if (!trimmed || createMutation.isPending) return;

    createMutation.mutate(
      { body: trimmed },
      {
        onSuccess: () => {
          setBody("");
          toast.success("Comment posted.");
        },
        onError: (error) => toast.error(error.message ?? "Unable to post comment."),
      }
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  }

  if (!canComment) {
    return (
      <p className="rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm text-muted">
        {disabledReason ?? "Comments are read-only."}
      </p>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar src={user?.avatar} name={user?.name ?? "You"} size="sm" />
      <div className="min-w-0 flex-1">
        <label htmlFor="task-comment-composer" className="sr-only">
          Write a comment
        </label>
        <Textarea
          id="task-comment-composer"
          value={body}
          onChange={(event) => setBody(event.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment…"
          rows={3}
          maxLength={MAX_LENGTH}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted">
            {body.length > WARN_THRESHOLD
              ? `${body.length} / ${MAX_LENGTH}`
              : "Ctrl/Cmd + Enter to submit"}
          </span>
          <Button size="sm" onClick={handleSubmit} disabled={!trimmed || createMutation.isPending}>
            {createMutation.isPending ? "Posting..." : "Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
