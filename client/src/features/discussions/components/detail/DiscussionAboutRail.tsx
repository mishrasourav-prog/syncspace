import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";
import type { Discussion } from "../../types/discussion.types";
import type { Project } from "@/features/projects/types/project.types";

interface DiscussionAboutRailProps {
  discussion: Discussion;
  project: Project;
}

export function DiscussionAboutRail({
  discussion,
  project,
}: DiscussionAboutRailProps) {
  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <h2 className="text-h3 mb-3 text-foreground">About this Discussion</h2>
      <dl className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Status</dt>
          <dd>
            <Badge variant={discussion.isLocked ? "neutral" : "success"}>
              {discussion.isLocked ? "Locked" : "Active"}
            </Badge>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Pinned</dt>
          <dd className="font-medium text-foreground">
            {discussion.isPinned ? "Yes" : "No"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Project</dt>
          <dd className="truncate font-medium text-foreground">
            {project.name}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Created by</dt>
          <dd className="truncate font-medium text-foreground">
            {discussion.author?.name ?? "Former member"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Created</dt>
          <dd
            className="text-foreground"
            title={formatDateTime(discussion.createdAt)}
          >
            {formatDateTime(discussion.createdAt)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Last updated</dt>
          <dd
            className="text-foreground"
            title={formatDateTime(discussion.updatedAt)}
          >
            {formatDateTime(discussion.updatedAt)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Replies</dt>
          <dd className="font-medium text-foreground">
            {discussion.replyCount}
          </dd>
        </div>
      </dl>
    </section>
  );
}
