import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import {
  Activity,
  Archive,
  CheckSquare,
  FileText,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Mail,
  MessageSquare,
  Bell,
  Plus,
  Settings,
  Sparkles,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/app/store";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useWorkspacesQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useMyInvitationsQuery } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationQueries";
import { useUnreadNotificationCountQuery } from "@/features/notifications/hooks/useNotificationQueries";
import { useProjectQuery } from "@/features/projects/hooks/useProjectQueries";
import { WorkspaceSwitcher } from "./AppSidebar";

const WORKSPACE_TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "members", label: "Members", icon: Users },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const PROJECT_HASH_TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "members", label: "Members", icon: Users },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MobileNavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreateWorkspace: () => void;
}

export function MobileNavigationDrawer({
  open,
  onClose,
  onCreateWorkspace,
}: MobileNavigationDrawerProps) {
  const user = useAuthStore((state) => state.user);
  const { logout, isPending } = useLogout();
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const routeMatch = location.pathname.match(
    /^\/workspaces\/([^/]+)(?:\/projects\/([^/]+))?/,
  );
  const currentWorkspaceId = routeMatch?.[1];
  const currentProjectId = routeMatch?.[2];

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const firstFocusable =
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? panelRef.current)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [open, onClose]);

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
            ref={panelRef}
            tabIndex={-1}
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
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  SyncSpace
                </span>
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

            {currentWorkspaceId ? (
              <div className="pb-2">
                <WorkspaceSwitcher
                  currentWorkspaceId={currentWorkspaceId}
                  onNavigate={onClose}
                  onCreateWorkspace={onCreateWorkspace}
                />
              </div>
            ) : (
              <div className="px-4 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCreateWorkspace();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  New workspace
                </button>
              </div>
            )}

            {currentProjectId && currentWorkspaceId ? (
              <ProjectContextMobileNav
                workspaceId={currentWorkspaceId}
                projectId={currentProjectId}
                activeHash={location.hash}
                onClose={onClose}
              />
            ) : currentWorkspaceId ? (
              <WorkspaceContextMobileNav
                workspaceId={currentWorkspaceId}
                activeHash={location.hash}
                onClose={onClose}
              />
            ) : (
              <DashboardMobileNav onClose={onClose} />
            )}

            {user && (
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-caption">{user.email}</p>
                  </div>
                </div>
                <NavLink
                  to="/profile"
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted hover:bg-background hover:text-foreground",
                    )
                  }
                >
                  <UserCircle className="h-3.5 w-3.5" />
                  View profile
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
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
    document.body,
  );
}

function DashboardMobileNav({ onClose }: { onClose: () => void }) {
  const workspacesQuery = useWorkspacesQuery();
  const invitationsQuery = useMyInvitationsQuery();
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const workspaces = (workspacesQuery.data ?? []).filter(
    (workspace) => !workspace.isArchived,
  );
  const pendingInvitationCount = invitationsQuery.data?.length ?? 0;
  const unreadNotificationCount = unreadCountQuery.data ?? 0;

  const isDashboardHome =
    location.pathname === "/dashboard" &&
    !searchParams.get("status") &&
    !location.hash;
  const isActiveFilter =
    location.pathname === "/dashboard" &&
    searchParams.get("status") === "active";
  const isArchivedFilter =
    location.pathname === "/dashboard" &&
    searchParams.get("status") === "archived";
  const isInvitationsHash =
    location.pathname === "/dashboard" && location.hash === "#invitations";
  const isNotificationsActive = location.pathname === "/notifications";

  return (
    <nav className="flex-1 overflow-y-auto px-3">
      <NavLink
        to="/dashboard"
        end
        onClick={onClose}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isDashboardHome
            ? "bg-primary/15 text-primary"
            : "text-muted hover:bg-background hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Dashboard
      </NavLink>

      <NavLink
        to="/dashboard?status=active"
        onClick={onClose}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActiveFilter
            ? "bg-primary/15 text-primary"
            : "text-muted hover:bg-background hover:text-foreground",
        )}
      >
        <Users className="h-4 w-4" />
        Active workspaces
      </NavLink>

      <NavLink
        to="/dashboard?status=archived"
        onClick={onClose}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isArchivedFilter
            ? "bg-primary/15 text-primary"
            : "text-muted hover:bg-background hover:text-foreground",
        )}
      >
        <Archive className="h-4 w-4" />
        Archived workspaces
      </NavLink>

      <NavLink
        to="/dashboard#invitations"
        onClick={onClose}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isInvitationsHash
            ? "bg-primary/15 text-primary"
            : "text-muted hover:bg-background hover:text-foreground",
        )}
      >
        <Mail className="h-4 w-4" />
        Invitations
        {pendingInvitationCount > 0 && (
          <Badge variant="primary" className="ml-auto">
            {pendingInvitationCount}
          </Badge>
        )}
      </NavLink>

      <NavLink
        to="/notifications"
        onClick={onClose}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isNotificationsActive
            ? "bg-primary/15 text-primary"
            : "text-muted hover:bg-background hover:text-foreground",
        )}
      >
        <Bell className="h-4 w-4" />
        Notifications
        {unreadNotificationCount > 0 && (
          <Badge variant="primary" className="ml-auto">
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </Badge>
        )}
      </NavLink>

      <p className="mt-6 px-3 text-caption uppercase tracking-wide">
        Workspaces
      </p>
      <div className="mt-1.5 space-y-0.5">
        {workspaces.map((workspace) => (
          <NavLink
            key={workspace._id}
            to={`/workspaces/${workspace._id}`}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-background text-foreground"
                  : "text-muted hover:bg-background hover:text-foreground",
              )
            }
          >
            <Avatar
              src={workspace.avatar}
              name={workspace.name}
              size="sm"
              square
            />
            <span className="truncate">{workspace.name}</span>
          </NavLink>
        ))}
        {workspaces.length === 0 && !workspacesQuery.isLoading && (
          <p className="px-3 text-caption">No active workspaces yet.</p>
        )}
      </div>
    </nav>
  );
}

interface WorkspaceContextMobileNavProps {
  workspaceId: string;
  activeHash: string;
  onClose: () => void;
}

function WorkspaceContextMobileNav({
  workspaceId,
  activeHash,
  onClose,
}: WorkspaceContextMobileNavProps) {
  const activeTab = activeHash ? activeHash.replace("#", "") : "overview";
  const workspacesQuery = useWorkspacesQuery();
  const workspaceName = useMemo(
    () =>
      workspacesQuery.data?.find((workspace) => workspace._id === workspaceId)
        ?.name,
    [workspacesQuery.data, workspaceId],
  );

  return (
    <nav className="flex-1 overflow-y-auto px-3">
      <p className="px-3 text-caption uppercase tracking-wide">General</p>
      <div className="mt-1.5 space-y-0.5">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard#workspaces"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          All workspaces
        </NavLink>
      </div>

      <p className="mt-6 truncate px-3 text-caption uppercase tracking-wide">
        {workspaceName ?? "Workspace"}
      </p>
      <div className="mt-1.5 space-y-0.5">
        {WORKSPACE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.id}
              to={`/workspaces/${workspaceId}#${tab.id}`}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-background hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

interface ProjectContextMobileNavProps {
  workspaceId: string;
  projectId: string;
  activeHash: string;
  onClose: () => void;
}

function ProjectContextMobileNav({
  workspaceId,
  projectId,
  activeHash,
  onClose,
}: ProjectContextMobileNavProps) {
  const location = useLocation();
  const activeTab = activeHash ? activeHash.replace("#", "") : "overview";
  const tasksPath = `/workspaces/${workspaceId}/projects/${projectId}/tasks`;
  const isTasksRoute =
    location.pathname === tasksPath ||
    location.pathname.startsWith(`${tasksPath}/`);
  const documentsPath = `/workspaces/${workspaceId}/projects/${projectId}/documents`;
  const isDocumentsRoute =
    location.pathname === documentsPath ||
    location.pathname.startsWith(`${documentsPath}/`);
  const discussionsPath = `/workspaces/${workspaceId}/projects/${projectId}/discussions`;
  const isDiscussionsRoute =
    location.pathname === discussionsPath ||
    location.pathname.startsWith(`${discussionsPath}/`);
  const isProjectSubRoute =
    isTasksRoute || isDocumentsRoute || isDiscussionsRoute;
  const workspacesQuery = useWorkspacesQuery();
  const projectQuery = useProjectQuery(projectId);
  const workspaceName = useMemo(
    () =>
      workspacesQuery.data?.find((workspace) => workspace._id === workspaceId)
        ?.name,
    [workspacesQuery.data, workspaceId],
  );

  return (
    <nav className="flex-1 overflow-y-auto px-3">
      <p className="px-3 text-caption uppercase tracking-wide">General</p>
      <div className="mt-1.5 space-y-0.5">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard#workspaces"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          All workspaces
        </NavLink>
      </div>

      <p className="mt-6 truncate px-3 text-caption uppercase tracking-wide">
        {workspaceName ?? "Workspace"}
      </p>
      <div className="mt-1.5 space-y-0.5">
        <NavLink
          to={`/workspaces/${workspaceId}#overview`}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <LayoutGrid className="h-4 w-4" />
          Workspace Overview
        </NavLink>
        <NavLink
          to={`/workspaces/${workspaceId}#projects`}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <FolderKanban className="h-4 w-4" />
          Projects
        </NavLink>
      </div>

      <p className="mt-6 truncate px-3 text-caption uppercase tracking-wide">
        {projectQuery.data?.name ?? "Project"}
      </p>
      <div className="mt-1.5 space-y-0.5">
        <NavLink
          to={`/workspaces/${workspaceId}/projects/${projectId}#overview`}
          onClick={onClose}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            !isProjectSubRoute && activeTab === "overview"
              ? "bg-primary/15 text-primary"
              : "text-muted hover:bg-background hover:text-foreground",
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Overview
        </NavLink>

        <NavLink
          to={`/workspaces/${workspaceId}/projects/${projectId}/tasks`}
          onClick={onClose}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isTasksRoute
              ? "bg-primary/15 text-primary"
              : "text-muted hover:bg-background hover:text-foreground",
          )}
        >
          <CheckSquare className="h-4 w-4" />
          Tasks &amp; Issues
        </NavLink>

        <NavLink
          to={`/workspaces/${workspaceId}/projects/${projectId}/documents`}
          onClick={onClose}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isDocumentsRoute
              ? "bg-primary/15 text-primary"
              : "text-muted hover:bg-background hover:text-foreground",
          )}
        >
          <FileText className="h-4 w-4" />
          Documents
        </NavLink>

        <NavLink
          to={`/workspaces/${workspaceId}/projects/${projectId}/discussions`}
          onClick={onClose}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isDiscussionsRoute
              ? "bg-primary/15 text-primary"
              : "text-muted hover:bg-background hover:text-foreground",
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Discussions
        </NavLink>

        {PROJECT_HASH_TABS.filter((tab) => tab.id !== "overview").map((tab) => {
          const isActive = !isProjectSubRoute && activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.id}
              to={`/workspaces/${workspaceId}/projects/${projectId}#${tab.id}`}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-background hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
