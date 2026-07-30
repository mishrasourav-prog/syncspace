import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replyBodySchema } from "../../schemas/discussion.schemas";
import { useCreateDiscussionReplyMutation } from "../../hooks/useDiscussionReplyMutations";
import type { DiscussionUserPreview } from "../../types/discussion.types";

interface DiscussionReplyComposerProps {
  projectId: string;
  discussionId: string;
  currentUser: DiscussionUserPreview | undefined;
  disabled?: boolean;
  disabledMessage?: string;
}

export function DiscussionReplyComposer({
  projectId,
  discussionId,
  currentUser,
  disabled,
  disabledMessage,
}: DiscussionReplyComposerProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createReplyMutation = useCreateDiscussionReplyMutation(
    projectId,
    discussionId,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = replyBodySchema.safeParse(body);
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }

    setError(undefined);
    createReplyMutation.mutate(
      { body: result.data },
      {
        onSuccess: () => {
          setBody("");
          textareaRef.current?.focus();
        },
        onError: (mutationError) =>
          toast.error(mutationError.message ?? "Unable to post this reply."),
      },
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || (!event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  if (disabled) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 text-center text-sm text-muted">
        {disabledMessage ?? "You can't reply to this discussion."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <Avatar
        src={currentUser?.avatar}
        name={currentUser?.name ?? "You"}
        size="sm"
        className="mt-1.5"
      />
      <div className="min-w-0 flex-1">
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            if (error) setError(undefined);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Write a reply..."
          rows={3}
          maxLength={5000}
          error={error}
          disabled={createReplyMutation.isPending}
          aria-label="Reply message"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-muted/80">
            {body.length}/5000 · Ctrl/Cmd + Enter to send
          </span>
          <Button
            type="submit"
            size="sm"
            className="bg-secondary text-white hover:bg-secondary/90"
            disabled={createReplyMutation.isPending || body.trim().length === 0}
          >
            {createReplyMutation.isPending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </form>
  );
}
