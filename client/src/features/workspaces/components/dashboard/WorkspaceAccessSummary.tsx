import { useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkspaceRole, WorkspaceSummary } from "../../types/workspace.types";

interface WorkspaceAccessSummaryProps {
  workspaces: WorkspaceSummary[];
  roleFilter: WorkspaceRole | null;
  onRoleFilterChange: (role: WorkspaceRole | null) => void;
}

const ROLE_LABELS: Record<WorkspaceRole, { verb: string; noun: string }> = {
  owner: { verb: "own", noun: "workspace" },
  admin: { verb: "administer", noun: "workspace" },
  member: { verb: "are a member of", noun: "workspace" },
  guest: { verb: "are a guest in", noun: "workspace" },
};

const ROLE_ORDER: WorkspaceRole[] = ["owner", "admin", "member", "guest"];

export function WorkspaceAccessSummary({ workspaces, roleFilter, onRoleFilterChange }: WorkspaceAccessSummaryProps) {
  const counts = useMemo(() => {
    const result: Record<WorkspaceRole, number> = { owner: 0, admin: 0, member: 0, guest: 0 };
    for (const workspace of workspaces) {
      result[workspace.role] += 1;
    }
    return result;
  }, [workspaces]);

  const visibleRoles = ROLE_ORDER.filter((role) => counts[role] > 0);

  if (visibleRoles.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="access-summary-heading" className="rounded-xl border border-border bg-surface/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="access-summary-heading" className="text-h3 text-foreground">
          Your access
        </h2>
        {roleFilter && (
          <button
            type="button"
            onClick={() => onRoleFilterChange(null)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
          >
            <X className="h-3 w-3" />
            Clear role filter
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {visibleRoles.map((role) => {
          const { verb, noun } = ROLE_LABELS[role];
          const count = counts[role];
          const isActive = roleFilter === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => onRoleFilterChange(isActive ? null : role)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isActive ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-border/30"
              )}
            >
              <span>
                You {verb} {count} {noun}
                {count === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
