import { Link } from "react-router-dom";
import { Lock, Pin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/date";
import type { Discussion } from "../../types/discussion.types";

interface DiscussionListItemProps {
  discussion: Discussion;
  href: string;
  isSelected: boolean;
}

export function DiscussionListItem({
  discussion,
  href,
  isSelected,
}: DiscussionListItemProps) {
  return (
    <Link
      to={href}
      aria-current={isSelected ? "page" : undefined}
      className={cn(
        "flex gap-3 rounded-lg border px-3 py-3 transition-colors",
        isSelected
          ? "border-secondary/45 border-l-4 border-l-secondary bg-secondary/10"
          : "border-border/60 bg-transparent hover:border-border hover:bg-surface/70",
      )}
    >
      <Avatar
        src={discussion.author?.avatar}
        name={discussion.author?.name ?? "Former member"}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {discussion.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-warning" aria-hidden />
          )}
          {discussion.isLocked && (
            <Lock className="h-3 w-3 shrink-0 text-muted" aria-hidden />
          )}
          <span className="truncate">{discussion.title}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {discussion.author?.name ?? "Former member"} ·{" "}
          {formatRelativeTime(discussion.updatedAt)}
        </p>
        <p className="mt-1.5 flex items-center gap-3 text-[11px] text-muted/80">
          <span>
            {discussion.replyCount}{" "}
            {discussion.replyCount === 1 ? "reply" : "replies"}
          </span>
        </p>
      </div>
    </Link>
  );
}
