import { useMemo } from "react";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  Archive,
  Bell,
  CheckSquare,
  ChevronsUpDown,
  FileText,
  FolderKanban,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadNotificationCountQuery } from "@/features/notifications/hooks/useNotificationQueries";
import { useMyInvitationsQuery } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationQueries";
import { useWorkspacesQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useProjectQuery } from "@/features/projects/hooks/useProjectQueries";
import { useProjectTasksQuery } from "@/features/tasks/hooks/useTaskQueries";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

const MAX_SIDEBAR_WORKSPACES = 5;

const WORKSPACE_TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "members", label: "Members", icon: Users },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const PROJECT_HASH_TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "members", label: "Members", icon: Users },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

function useRouteContext(): { workspaceId?: string; projectId?: string } {
  const location = useLocation();
  const match = location.pathname.match(/^\/workspaces\/([^/]+)(?:\/projects\/([^/]+))?/);
  return { workspaceId: match?.[1], projectId: match?.[2] };
}

interface WorkspaceSwitcherProps {
  currentWorkspaceId: string | undefined;
  onCreateWorkspace: () => void;
  onNavigate?: () => void;
}

export function WorkspaceSwitcher({ currentWorkspaceId, onCreateWorkspace, onNavigate }: WorkspaceSwitcherProps) {
  const navigate = useNavigate();
  const workspacesQuery = useWorkspacesQuery();

  const allWorkspaces = useMemo(() => workspacesQuery.data ?? [], [workspacesQuery.data]);
  const activeWorkspaces = useMemo(
    () => allWorkspaces.filter((workspace) => !workspace.isArchived),
    [allWorkspaces]
  );
  const archivedWorkspaces = useMemo(
    () => allWorkspaces.filter((workspace) => workspace.isArchived),
    [allWorkspaces]
  );

  const currentWorkspace = allWorkspaces.find((workspace) => workspace._id === currentWorkspaceId);

  function navigateTo(path: string) {
    navigate(path);
    onNavigate?.();
  }

  function handleCreateWorkspace() {
    onNavigate?.();
    onCreateWorkspace();
  }

  return (
    <div className="px-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Switch workspace"
          className="!h-auto !w-full justify-between gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 hover:bg-border/30"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            {currentWorkspace ? (
              <Avatar src={currentWorkspace.avatar} name={currentWorkspace.name} size="sm" square />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <LayoutGrid className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-medium text-foreground">
                {currentWorkspace ? currentWorkspace.name : "All workspaces"}
              </span>
              <span className="block truncate text-[11px] text-muted">
                {currentWorkspace
                  ? currentWorkspace.isArchived
                    ? "Archived · read-only"
                    : currentWorkspace.role
                  : `${activeWorkspaces.length} active`}
              </span>
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onClick={() => navigateTo("/dashboard#workspaces")}>
            <LayoutGrid className="h-3.5 w-3.5" />
            All workspaces
          </DropdownMenuItem>

          {activeWorkspaces.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Active</DropdownMenuLabel>
              {activeWorkspaces.slice(0, 8).map((workspace) => (
                <DropdownMenuItem key={workspace._id} onClick={() => navigateTo(`/workspaces/${workspace._id}`)}>
                  <Avatar src={workspace.avatar} name={workspace.name} size="sm" square />
                  <span className="truncate">{workspace.name}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {archivedWorkspaces.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Archived</DropdownMenuLabel>
              {archivedWorkspaces.slice(0, 4).map((workspace) => (
                <DropdownMenuItem
                  key={workspace._id}
                  className="opacity-70"
                  onClick={() => navigateTo(`/workspaces/${workspace._id}`)}
                >
                  <Avatar src={workspace.avatar} name={workspace.name} size="sm" square />
                  <span className="truncate">{workspace.name}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateWorkspace}>
            <Plus className="h-3.5 w-3.5" />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface AppSidebarProps {
  onCreateWorkspace: () => void;
}

export function AppSidebar({ onCreateWorkspace }: AppSidebarProps) {
  const location = useLocation();
  const { workspaceId, projectId } = useRouteContext();
  const tasksQuery = useProjectTasksQuery(projectId);

  const activeTaskCount = useMemo(() => {
    if (!tasksQuery.data) return undefined;
    return tasksQuery.data.filter((task) => !task.isArchived && !task.parentTask).length;
  }, [tasksQuery.data]);

  return (
    <aside className="hidden h-screen w-[272px] shrink-0 flex-col border-r border-border bg-surface/40 lg:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
          <Sparkles className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">SyncSpace</span>
      </div>

      <WorkspaceSwitcher currentWorkspaceId={workspaceId} onCreateWorkspace={onCreateWorkspace} />

      {projectId && workspaceId ? (
        <ProjectContextNav
          workspaceId={workspaceId}
          projectId={projectId}
          activeHash={location.hash}
          activePathname={location.pathname}
          activeTaskCount={activeTaskCount}
        />
      ) : workspaceId ? (
        <WorkspaceContextNav workspaceId={workspaceId} activeHash={location.hash} />
      ) : (
        <DashboardNav />
      )}

      <div className="border-t border-border p-3">
        <UserMenu />
      </div>
    </aside>
  );
}

function DashboardNav() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const workspacesQuery = useWorkspacesQuery();
  const invitationsQuery = useMyInvitationsQuery();
  const unreadCountQuery = useUnreadNotificationCountQuery();

  const allWorkspaces = useMemo(() => workspacesQuery.data ?? [], [workspacesQuery.data]);
  const activeWorkspaces = useMemo(
    () => allWorkspaces.filter((workspace) => !workspace.isArchived),
    [allWorkspaces]
  );
  const recentWorkspaces = useMemo(
    () =>
      [...activeWorkspaces]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, MAX_SIDEBAR_WORKSPACES),
    [activeWorkspaces]
  );

  const pendingInvitationCount = invitationsQuery.data?.length ?? 0;
  const unreadNotificationCount = unreadCountQuery.data ?? 0;

  const isDashboardHome =
    location.pathname === "/dashboard" && !searchParams.get("status") && !location.hash;
  const isActiveFilter = location.pathname === "/dashboard" && searchParams.get("status") === "active";
  const isArchivedFilter = location.pathname === "/dashboard" && searchParams.get("status") === "archived";
  const isInvitationsHash = location.pathname === "/dashboard" && location.hash === "#invitations";
  const isNotificationsHash = location.pathname === "/dashboard" && location.hash === "#notifications";

  return (
    <nav className="flex-1 overflow-y-auto px-3 pt-4">
      <div className="space-y-0.5">
        <NavLink
          to="/dashboard"
          end
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isDashboardHome ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </NavLink>

        <NavLink
          to="/dashboard?status=active"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActiveFilter ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Active workspaces
        </NavLink>

        <NavLink
          to="/dashboard?status=archived"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isArchivedFilter ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
          )}
        >
          <Archive className="h-4 w-4" />
          Archived workspaces
        </NavLink>

        <NavLink
          to="/dashboard#invitations"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isInvitationsHash ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
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
          to="/dashboard#notifications"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isNotificationsHash ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
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
      </div>

      <div className="mt-6">
        <p className="px-3 text-caption uppercase tracking-wide">Workspaces</p>

        <div className="mt-1.5 space-y-0.5">
          {recentWorkspaces.map((workspace) => (
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

          {recentWorkspaces.length === 0 && !workspacesQuery.isLoading && (
            <p className="px-3 text-caption">No active workspaces yet.</p>
          )}

          <NavLink to="/dashboard#workspaces" className="block px-3 py-2 text-xs font-medium text-primary hover:text-primary/80">
            All workspaces
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

interface WorkspaceContextNavProps {
  workspaceId: string;
  activeHash: string;
}

function WorkspaceContextNav({ workspaceId, activeHash }: WorkspaceContextNavProps) {
  const activeTab = activeHash ? activeHash.replace("#", "") : "overview";
  const workspacesQuery = useWorkspacesQuery();
  const workspaceName = workspacesQuery.data?.find((workspace) => workspace._id === workspaceId)?.name;

  return (
    <nav className="flex-1 overflow-y-auto px-3 pt-4">
      <p className="px-3 text-caption uppercase tracking-wide">General</p>
      <div className="mt-1.5 space-y-0.5">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard#workspaces"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          All workspaces
        </NavLink>
      </div>

      <p className="mt-6 truncate px-3 text-caption uppercase tracking-wide">{workspaceName ?? "Workspace"}</p>
      <div className="mt-1.5 space-y-0.5">
        {WORKSPACE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.id}
              to={`/workspaces/${workspaceId}#${tab.id}`}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
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

interface ProjectContextNavProps {
  workspaceId: string;
  projectId: string;
  activeHash: string;
  activePathname: string;
  activeTaskCount?: number;
}

function ProjectContextNav({ workspaceId, projectId, activeHash, activePathname, activeTaskCount }: ProjectContextNavProps) {
  const activeTab = activeHash ? activeHash.replace("#", "") : "overview";
  const tasksPath = `/workspaces/${workspaceId}/projects/${projectId}/tasks`;
  const isTasksRoute = activePathname === tasksPath || activePathname.startsWith(`${tasksPath}/`);
  const workspacesQuery = useWorkspacesQuery();
  const projectQuery = useProjectQuery(projectId);
  const workspaceName = workspacesQuery.data?.find((workspace) => workspace._id === workspaceId)?.name;

  return (
    <nav className="flex-1 overflow-y-auto px-3 pt-4">
      <p className="px-3 text-caption uppercase tracking-wide">General</p>
      <div className="mt-1.5 space-y-0.5">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard#workspaces"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          All workspaces
        </NavLink>
      </div>

      <p className="mt-6 truncate px-3 text-caption uppercase tracking-wide">{workspaceName ?? "Workspace"}</p>
      <div className="mt-1.5 space-y-0.5">
        <NavLink
          to={`/workspaces/${workspaceId}#overview`}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <LayoutGrid className="h-4 w-4" />
          Workspace Overview
        </NavLink>
        <NavLink
          to={`/workspaces/${workspaceId}#projects`}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
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
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            !isTasksRoute && activeTab === "overview"
              ? "bg-primary/15 text-primary"
              : "text-muted hover:bg-surface hover:text-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Overview
        </NavLink>

        <NavLink
          to={`/workspaces/${workspaceId}/projects/${projectId}/tasks`}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isTasksRoute ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
          )}
        >
          <CheckSquare className="h-4 w-4" />
          Tasks &amp; Issues
          {typeof activeTaskCount === "number" && activeTaskCount > 0 && (
            <Badge variant="neutral" className="ml-auto">
              {activeTaskCount}
            </Badge>
          )}
        </NavLink>

        {PROJECT_HASH_TABS.filter((tab) => tab.id !== "overview").map((tab) => {
          const isActive = !isTasksRoute && activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.id}
              to={`/workspaces/${workspaceId}/projects/${projectId}#${tab.id}`}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
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
