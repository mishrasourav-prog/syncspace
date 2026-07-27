import { ArrowUpRight, FolderKanban, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

import type {
  MemberProfileContext,
  ProjectRole,
  WorkspaceRole,
} from "../types/profile.types";

const WORKSPACE_ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  guest: "Guest",
};

const PROJECT_ROLE_LABEL: Record<ProjectRole, string> = {
  admin: "Admin",
  member: "Member",
};

interface MemberContextCardProps {
  context: MemberProfileContext;
}

export function MemberContextCard({ context }: MemberContextCardProps) {
  return (
    <section
      aria-labelledby="member-context-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6"
    >
      <h2 id="member-context-heading" className="text-h3 text-foreground">
        Shared Context
      </h2>
      <p className="mt-1 text-caption">Roles shown here apply only to the shared workspace or project.</p>

      <div className="mt-4 space-y-3">
        {context.workspace ? (
          <article className="rounded-lg border border-border/60 bg-background/35 p-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Users className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Workspace</p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {context.workspace.name}
                </p>
              </div>
              <Badge variant="primary">{WORKSPACE_ROLE_LABEL[context.workspace.role]}</Badge>
            </div>

            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>Joined {formatDate(context.workspace.joinedAt)}</span>
              <Link
                to={`/workspaces/${context.workspace._id}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Open workspace
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>
          </article>
        ) : null}

        {context.project ? (
          <article className="rounded-lg border border-border/60 bg-background/35 p-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <FolderKanban className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Project</p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {context.project.name}
                </p>
              </div>
              <Badge variant="secondary">{PROJECT_ROLE_LABEL[context.project.role]}</Badge>
            </div>

            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>Joined {formatDate(context.project.joinedAt)}</span>
              {context.workspace ? (
                <Link
                  to={`/workspaces/${context.workspace._id}/projects/${context.project._id}`}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Open project
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              ) : null}
            </div>
          </article>
        ) : null}

        {!context.workspace && !context.project ? (
          <p className="rounded-lg border border-border/60 bg-background/35 p-3 text-sm text-muted">
            No shared context was returned.
          </p>
        ) : null}
      </div>
    </section>
  );
}
