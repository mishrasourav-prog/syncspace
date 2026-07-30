import { AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import type { AccountDeletionReadiness } from "../types/profile.types";

interface DeletionReadinessBlockersProps {
  blockers: AccountDeletionReadiness["blockers"];
}

export function DeletionReadinessBlockers({
  blockers,
}: DeletionReadinessBlockersProps) {
  const hasOwnedWorkspaces = blockers.ownedWorkspaces.length > 0;

  const hasLastAdminProjects = blockers.lastAdminProjects.length > 0;

  if (!hasOwnedWorkspaces && !hasLastAdminProjects) {
    return null;
  }

  return (
    <div
      className="space-y-4 rounded-lg border border-warning/30 bg-warning/10 p-4"
      role="status"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 text-warning"
        />

        <div>
          <p className="text-sm font-semibold text-foreground">
            Account deletion is currently blocked
          </p>

          <p className="mt-1 text-xs leading-5 text-muted">
            Resolve every item below, then check again. Your account cannot be
            deleted while these responsibilities remain.
          </p>
        </div>
      </div>

      {hasOwnedWorkspaces ? (
        <section aria-labelledby="owned-workspaces-heading">
          <h3
            className="text-xs font-semibold uppercase tracking-wide text-foreground"
            id="owned-workspaces-heading"
          >
            Owned workspaces
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted">
            Account deletion is blocked while you own a workspace. Resolve
            workspace ownership before deleting the account.
          </p>

          <ul className="mt-2 space-y-2">
            {blockers.ownedWorkspaces.map((workspace) => (
              <li
                className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border bg-background/50 px-3 py-2"
                key={workspace._id}
              >
                <span className="min-w-0 truncate text-sm text-foreground">
                  {workspace.name}
                </span>

                <Link
                  className="inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-medium text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary/50"
                  to={`/workspaces/${workspace._id}`}
                >
                  Open workspace
                  <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasLastAdminProjects ? (
        <section aria-labelledby="last-admin-projects-heading">
          <h3
            className="text-xs font-semibold uppercase tracking-wide text-foreground"
            id="last-admin-projects-heading"
          >
            Projects where you are the last admin
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted">
            Assign another project administrator before deleting the account.
          </p>

          <ul className="mt-2 space-y-2">
            {blockers.lastAdminProjects.map((project) => (
              <li
                className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-background/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                key={project._id}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">
                    {project.name}
                  </span>

                  <span className="block truncate text-xs text-muted">
                    {project.workspace.name}
                  </span>
                </span>

                <Link
                  className="inline-flex shrink-0 items-center gap-1 self-start rounded-md text-xs font-medium text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary/50 sm:self-auto"
                  to={`/workspaces/${project.workspace._id}/projects/${project._id}#members`}
                >
                  Open project members
                  <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
