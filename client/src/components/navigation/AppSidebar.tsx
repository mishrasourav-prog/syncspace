import { NavLink } from "react-router-dom";
import { LayoutGrid, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useWorkspacesQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useMyInvitationsQuery } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationQueries";
import { UserMenu } from "./UserMenu";

const MAX_SIDEBAR_WORKSPACES = 5;

export function AppSidebar() {
  const workspacesQuery = useWorkspacesQuery();
  const invitationsQuery = useMyInvitationsQuery();

  const workspaces = (workspacesQuery.data ?? [])
    .filter((workspace) => !workspace.isArchived)
    .slice(0, MAX_SIDEBAR_WORKSPACES);

  const pendingInvitationCount = invitationsQuery.data?.length ?? 0;

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface/40 lg:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
          <Sparkles className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">SyncSpace</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
            )
          }
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
          {pendingInvitationCount > 0 && (
            <Badge variant="primary" className="ml-auto">
              <Mail className="h-3 w-3" />
              {pendingInvitationCount}
            </Badge>
          )}
        </NavLink>

        <div className="mt-6">
          <p className="px-3 text-caption uppercase tracking-wide">Workspaces</p>

          <div className="mt-1.5 space-y-0.5">
            {workspaces.map((workspace) => (
              <NavLink
                key={workspace._id}
                to={`/workspaces/${workspace._id}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"
                  )
                }
              >
                <Avatar src={workspace.avatar} name={workspace.name} size="sm" square />
                <span className="truncate">{workspace.name}</span>
              </NavLink>
            ))}

            {workspaces.length === 0 && !workspacesQuery.isLoading && (
              <p className="px-3 text-caption">No active workspaces yet.</p>
            )}

            <NavLink
              to="/dashboard"
              className="block px-3 py-2 text-xs font-medium text-primary hover:text-primary/80"
            >
              All workspaces
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <UserMenu />
      </div>
    </aside>
  );
}
