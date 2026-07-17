import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { LayoutGrid, LogOut, Mail, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/app/store";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useWorkspacesQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useMyInvitationsQuery } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationQueries";

interface MobileNavigationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNavigationDrawer({ open, onClose }: MobileNavigationDrawerProps) {
  const user = useAuthStore((state) => state.user);
  const { logout, isPending } = useLogout();
  const workspacesQuery = useWorkspacesQuery();
  const invitationsQuery = useMyInvitationsQuery();

  const workspaces = (workspacesQuery.data ?? []).filter((workspace) => !workspace.isArchived);
  const pendingInvitationCount = invitationsQuery.data?.length ?? 0;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 left-0 flex w-[82%] max-w-[300px] flex-col border-r border-border bg-surface"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">SyncSpace</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-muted hover:bg-border/40 hover:text-foreground"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3">
              <NavLink
                to="/dashboard"
                end
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary/15 text-primary" : "text-muted hover:bg-background hover:text-foreground"
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

              <p className="mt-6 px-3 text-caption uppercase tracking-wide">Workspaces</p>
              <div className="mt-1.5 space-y-0.5">
                {workspaces.map((workspace) => (
                  <NavLink
                    key={workspace._id}
                    to={`/workspaces/${workspace._id}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive ? "bg-background text-foreground" : "text-muted hover:bg-background hover:text-foreground"
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
              </div>
            </nav>

            {user && (
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                    <p className="truncate text-caption">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  disabled={isPending}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {isPending ? "Logging out..." : "Log out"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
