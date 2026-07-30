import { useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import type {
  Discussion,
  DiscussionReply,
  DiscussionUserPreview,
} from "../../types/discussion.types";

interface DiscussionParticipantsRailProps {
  discussion: Discussion;
  replies: DiscussionReply[];
  hasMoreReplies: boolean;
}

export function DiscussionParticipantsRail({
  discussion,
  replies,
  hasMoreReplies,
}: DiscussionParticipantsRailProps) {
  const participants = useMemo(() => {
    const byId = new Map<string, DiscussionUserPreview>();

    if (discussion.author) byId.set(discussion.author._id, discussion.author);
    for (const reply of replies) {
      if (!reply.isDeleted && reply.author) {
        byId.set(reply.author._id, reply.author);
      }
    }

    return Array.from(byId.values());
  }, [discussion.author, replies]);

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-h3 text-foreground">
          Participants ({participants.length})
        </h2>
      </div>

      {participants.length === 0 ? (
        <p className="text-sm text-muted">No participants yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {participants.map((participant) => (
            <li
              key={participant._id}
              className="flex items-center gap-2 rounded-full bg-background/50 py-1 pl-1 pr-3"
            >
              <Avatar
                src={participant.avatar}
                name={participant.name}
                size="sm"
              />
              <span className="max-w-[8rem] truncate text-xs font-medium text-foreground">
                {participant.name}
              </span>
            </li>
          ))}
        </ul>
      )}

      {hasMoreReplies && (
        <p className="mt-2 text-[11px] text-muted/70">
          Based on replies loaded so far. Load more replies to see everyone.
        </p>
      )}
    </section>
  );
}
