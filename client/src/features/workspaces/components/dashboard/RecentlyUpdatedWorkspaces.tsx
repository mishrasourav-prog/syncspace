import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/date";
import type { WorkspaceSummary } from "../../types/workspace.types";

const roleBadgeVariant: Record<
  WorkspaceSummary["role"],
  "primary" | "secondary" | "neutral"
> = {
  owner: "primary",
  admin: "secondary",
  member: "neutral",
  guest: "neutral",
};

interface RecentlyUpdatedWorkspacesProps {
  workspaces: WorkspaceSummary[];
}

export function RecentlyUpdatedWorkspaces({
  workspaces,
}: RecentlyUpdatedWorkspacesProps) {
  const navigate = useNavigate();

  const recent = useMemo(
    () =>
      [...workspaces]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 6),
    [workspaces],
  );

  if (recent.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recently-updated-heading">
      <h2
        id="recently-updated-heading"
        className="mb-3 text-h3 text-foreground"
      >
        Recently updated
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {recent.map((workspace) => (
          <button
            key={workspace._id}
            type="button"
            onClick={() => navigate(`/workspaces/${workspace._id}`)}
            className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface/60 p-3 text-left shadow-soft transition-colors hover:border-muted/40"
          >
            <Avatar
              src={workspace.avatar}
              name={workspace.name}
              size="sm"
              square
            />
            <div className="min-w-0 w-full">
              <p className="truncate text-sm font-medium text-foreground">
                {workspace.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant={roleBadgeVariant[workspace.role]}>
                  {workspace.role}
                </Badge>
                {workspace.isArchived && (
                  <Badge variant="warning">Archived</Badge>
                )}
              </div>
              <p className="mt-1 truncate text-[11px] text-muted">
                {formatRelativeTime(workspace.updatedAt)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
