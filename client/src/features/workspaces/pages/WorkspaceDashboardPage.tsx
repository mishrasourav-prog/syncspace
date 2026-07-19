// // import { useMemo, useState } from "react";
// // import { Plus } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { useAuthStore } from "@/app/store";
// // import { useWorkspacesQuery } from "../hooks/useWorkspaceQueries";
// // import { useMyInvitationsQuery } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationQueries";
// // import { PendingInvitations } from "@/features/workspace-invitations/components/PendingInvitations";
// // import { WorkspaceToolbar, type WorkspaceFilter } from "../components/WorkspaceToolbar";
// // import { WorkspaceGrid } from "../components/WorkspaceGrid";
// // import { WorkspaceGridSkeleton } from "../components/WorkspaceSkeleton";
// // import {
// //   ArchivedEmptyState,
// //   FilteredEmptyState,
// //   NoWorkspacesEmptyState,
// //   WorkspaceErrorState,
// // } from "../components/WorkspaceEmptyState";
// // import { CreateWorkspaceDialog } from "../components/CreateWorkspaceDialog";
// // import { EditWorkspaceDialog } from "../components/EditWorkspaceDialog";
// // import { WorkspaceActionDialogs, type WorkspaceActionTarget } from "../components/WorkspaceActionDialogs";
// // import type { WorkspaceSummary } from "../types/workspace.types";

// // export function WorkspaceDashboardPage() {
// //   const user = useAuthStore((state) => state.user);
// //   const workspacesQuery = useWorkspacesQuery();
// //   const invitationsQuery = useMyInvitationsQuery();

// //   const [search, setSearch] = useState("");
// //   const [filter, setFilter] = useState<WorkspaceFilter>("all");
// //   const [createDialogOpen, setCreateDialogOpen] = useState(false);
// //   const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceSummary | null>(null);
// //   const [actionTarget, setActionTarget] = useState<WorkspaceActionTarget | null>(null);

// //   const workspaces = workspacesQuery.data ?? [];

// //   const counts = useMemo(
// //     () => ({
// //       all: workspaces.length,
// //       active: workspaces.filter((workspace) => !workspace.isArchived).length,
// //       archived: workspaces.filter((workspace) => workspace.isArchived).length,
// //     }),
// //     [workspaces]
// //   );

// //   const filteredWorkspaces = useMemo(() => {
// //     const query = search.trim().toLowerCase();

// //     return workspaces.filter((workspace) => {
// //       const matchesFilter =
// //         filter === "all" ? true : filter === "active" ? !workspace.isArchived : workspace.isArchived;

// //       if (!matchesFilter) return false;

// //       if (!query) return true;

// //       return (
// //         workspace.name.toLowerCase().includes(query) ||
// //         (workspace.description ?? "").toLowerCase().includes(query)
// //       );
// //     });
// //   }, [workspaces, filter, search]);

// //   function clearFilters() {
// //     setSearch("");
// //     setFilter("all");
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
// //         <div>
// //           <h1 className="text-h1 text-foreground">
// //             {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Workspace dashboard"}
// //           </h1>
// //           <p className="mt-1 text-body">Manage your workspaces and pending invitations.</p>
// //         </div>

// //         <Button onClick={() => setCreateDialogOpen(true)} className="self-start sm:self-auto">
// //           <Plus className="h-4 w-4" />
// //           Create workspace
// //         </Button>
// //       </div>

// //       {!workspacesQuery.isLoading && !workspacesQuery.isError && (
// //         <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
// //           <SummaryChip label="Total" value={counts.all} />
// //           <SummaryChip label="Active" value={counts.active} />
// //           <SummaryChip label="Archived" value={counts.archived} />
// //           <SummaryChip label="Invitations" value={invitationsQuery.data?.length ?? 0} />
// //         </div>
// //       )}

// //       <PendingInvitations />

// //       {workspacesQuery.isLoading && <WorkspaceGridSkeleton />}

// //       {workspacesQuery.isError && (
// //         <WorkspaceErrorState
// //           message={workspacesQuery.error?.message ?? "Something went wrong."}
// //           onRetry={() => workspacesQuery.refetch()}
// //         />
// //       )}

// //       {!workspacesQuery.isLoading && !workspacesQuery.isError && (
// //         <>
// //           {workspaces.length === 0 ? (
// //             <NoWorkspacesEmptyState onCreate={() => setCreateDialogOpen(true)} />
// //           ) : (
// //             <div className="space-y-4">
// //               <WorkspaceToolbar
// //                 search={search}
// //                 onSearchChange={setSearch}
// //                 filter={filter}
// //                 onFilterChange={setFilter}
// //                 counts={counts}
// //               />

// //               {filteredWorkspaces.length === 0 ? (
// //                 filter === "archived" && !search ? (
// //                   <ArchivedEmptyState />
// //                 ) : (
// //                   <FilteredEmptyState onClear={clearFilters} />
// //                 )
// //               ) : (
// //                 <WorkspaceGrid
// //                   workspaces={filteredWorkspaces}
// //                   onEdit={setEditingWorkspace}
// //                   onArchive={(workspace) => setActionTarget({ type: "archive", workspace })}
// //                   onRestore={(workspace) => setActionTarget({ type: "restore", workspace })}
// //                   onLeave={(workspace) => setActionTarget({ type: "leave", workspace })}
// //                 />
// //               )}
// //             </div>
// //           )}
// //         </>
// //       )}

// //       <CreateWorkspaceDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
// //       <EditWorkspaceDialog workspace={editingWorkspace} onClose={() => setEditingWorkspace(null)} />
// //       <WorkspaceActionDialogs target={actionTarget} onClose={() => setActionTarget(null)} />
// //     </div>
// //   );
// // }

// // function SummaryChip({ label, value }: { label: string; value: number }) {
// //   return (
// //     <div className="rounded-lg border border-border bg-surface/60 px-3 py-2.5">
// //       <p className="text-lg font-semibold text-foreground">{value}</p>
// //       <p className="text-caption">{label}</p>
// //     </div>
// //   );
// // }


// import { useEffect, useMemo, useState } from "react";
// import { useOutletContext, useLocation, useSearchParams } from "react-router-dom";
// import { useWorkspacesQuery } from "../hooks/useWorkspaceQueries";
// import { useMyInvitationsQuery } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationQueries";
// import { useUnreadNotificationCountQuery } from "@/features/notifications/hooks/useNotificationQueries";
// import { PendingInvitations } from "@/features/workspace-invitations/components/PendingInvitations";
// import { DashboardNotificationFeed } from "@/features/notifications/components/DashboardNotificationFeed";
// import { DashboardGreeting } from "../components/dashboard/DashboardGreeting";
// import { DashboardQuickActions } from "../components/dashboard/DashboardQuickActions";
// import { DashboardOverview } from "../components/dashboard/DashboardOverview";
// import { WorkspaceAccessSummary } from "../components/dashboard/WorkspaceAccessSummary";
// import { RecentlyUpdatedWorkspaces } from "../components/dashboard/RecentlyUpdatedWorkspaces";
// import { WorkspaceToolbar, type WorkspaceFilter } from "../components/WorkspaceToolbar";
// import { WorkspaceGrid } from "../components/WorkspaceGrid";
// import { WorkspaceGridSkeleton } from "../components/WorkspaceSkeleton";
// import {
//   ArchivedEmptyState,
//   FilteredEmptyState,
//   NoWorkspacesEmptyState,
//   WorkspaceErrorState,
// } from "../components/WorkspaceEmptyState";
// import { EditWorkspaceDialog } from "../components/EditWorkspaceDialog";
// import { WorkspaceActionDialogs, type WorkspaceActionTarget } from "../components/WorkspaceActionDialogs";
// import type { WorkspaceRole, WorkspaceSummary } from "../types/workspace.types";
// import type { AppShellOutletContext } from "@/layouts/AppShell";

// const VALID_ROLES: WorkspaceRole[] = ["owner", "admin", "member", "guest"];

// export function WorkspaceDashboardPage() {
//   const { onCreateWorkspace } = useOutletContext<AppShellOutletContext>();
//   const location = useLocation();

//   const workspacesQuery = useWorkspacesQuery();
//   const invitationsQuery = useMyInvitationsQuery();
//   const unreadCountQuery = useUnreadNotificationCountQuery();

//   const [searchParams, setSearchParams] = useSearchParams();
//   const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceSummary | null>(null);
//   const [actionTarget, setActionTarget] = useState<WorkspaceActionTarget | null>(null);

//   const search = searchParams.get("q") ?? "";
//   const statusParam = searchParams.get("status");
//   const filter: WorkspaceFilter = statusParam === "active" || statusParam === "archived" ? statusParam : "all";
//   const roleParam = searchParams.get("role");
//   const roleFilter: WorkspaceRole | null = VALID_ROLES.includes(roleParam as WorkspaceRole)
//     ? (roleParam as WorkspaceRole)
//     : null;

//   useEffect(() => {
//     if (!location.hash) return;
//     const id = location.hash.replace("#", "");
//     const timer = window.setTimeout(() => {
//       document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
//     }, 150);
//     return () => window.clearTimeout(timer);
//   }, [location.hash]);

//   function updateParam(key: string, value: string | null) {
//     const next = new URLSearchParams(searchParams);
//     if (value) {
//       next.set(key, value);
//     } else {
//       next.delete(key);
//     }
//     setSearchParams(next, { replace: true });
//   }

//   function setSearch(value: string) {
//     updateParam("q", value || null);
//   }

//   function setFilter(value: WorkspaceFilter) {
//     updateParam("status", value === "all" ? null : value);
//   }

//   function setRoleFilter(value: WorkspaceRole | null) {
//     updateParam("role", value);
//   }

//   const workspaces = useMemo(() => workspacesQuery.data ?? [], [workspacesQuery.data]);

//   const counts = useMemo(
//     () => ({
//       all: workspaces.length,
//       active: workspaces.filter((workspace) => !workspace.isArchived).length,
//       archived: workspaces.filter((workspace) => workspace.isArchived).length,
//     }),
//     [workspaces]
//   );

//   const filteredWorkspaces = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return workspaces.filter((workspace) => {
//       const matchesFilter =
//         filter === "all" ? true : filter === "active" ? !workspace.isArchived : workspace.isArchived;

//       if (!matchesFilter) return false;

//       if (roleFilter && workspace.role !== roleFilter) return false;

//       if (!query) return true;

//       return (
//         workspace.name.toLowerCase().includes(query) ||
//         (workspace.description ?? "").toLowerCase().includes(query)
//       );
//     });
//   }, [workspaces, filter, search, roleFilter]);

//   function clearFilters() {
//     const next = new URLSearchParams(searchParams);
//     next.delete("q");
//     next.delete("status");
//     next.delete("role");
//     setSearchParams(next, { replace: true });
//   }

//   return (
//     <div className="space-y-6">
//       <DashboardGreeting />

//       <DashboardQuickActions
//         onCreateWorkspace={onCreateWorkspace}
//         activeCount={counts.active}
//         pendingInvitationCount={invitationsQuery.data?.length ?? 0}
//         unreadNotificationCount={unreadCountQuery.data ?? 0}
//       />

//       <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
//         <div className="space-y-6 xl:col-span-8">
//           <DashboardOverview
//             total={counts.all}
//             active={counts.active}
//             archived={counts.archived}
//             pendingInvitations={invitationsQuery.data?.length ?? 0}
//             isLoading={workspacesQuery.isLoading}
//           />

//           <section id="workspaces" aria-labelledby="your-workspaces-heading" className="space-y-4">
//             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//               <h2 id="your-workspaces-heading" className="text-h3 text-foreground">
//                 Your workspaces
//                 {!workspacesQuery.isLoading && !workspacesQuery.isError && (
//                   <span className="ml-2 text-caption">
//                     {filteredWorkspaces.length} of {workspaces.length}
//                   </span>
//                 )}
//               </h2>
//             </div>

//             {workspacesQuery.isLoading && <WorkspaceGridSkeleton />}

//             {workspacesQuery.isError && (
//               <WorkspaceErrorState
//                 message={workspacesQuery.error?.message ?? "Something went wrong."}
//                 onRetry={() => workspacesQuery.refetch()}
//               />
//             )}

//             {!workspacesQuery.isLoading && !workspacesQuery.isError && (
//               <>
//                 {workspaces.length === 0 ? (
//                   <NoWorkspacesEmptyState onCreate={onCreateWorkspace} />
//                 ) : (
//                   <div className="space-y-4">
//                     <WorkspaceToolbar
//                       search={search}
//                       onSearchChange={setSearch}
//                       filter={filter}
//                       onFilterChange={setFilter}
//                       counts={counts}
//                     />

//                     {filteredWorkspaces.length === 0 ? (
//                       filter === "archived" && !search && !roleFilter ? (
//                         <ArchivedEmptyState />
//                       ) : (
//                         <FilteredEmptyState onClear={clearFilters} />
//                       )
//                     ) : (
//                       <WorkspaceGrid
//                         workspaces={filteredWorkspaces}
//                         onEdit={setEditingWorkspace}
//                         onArchive={(workspace) => setActionTarget({ type: "archive", workspace })}
//                         onRestore={(workspace) => setActionTarget({ type: "restore", workspace })}
//                         onLeave={(workspace) => setActionTarget({ type: "leave", workspace })}
//                       />
//                     )}
//                   </div>
//                 )}
//               </>
//             )}
//           </section>

//           {!workspacesQuery.isLoading && !workspacesQuery.isError && workspaces.length > 0 && (
//             <WorkspaceAccessSummary
//               workspaces={workspaces}
//               roleFilter={roleFilter}
//               onRoleFilterChange={setRoleFilter}
//             />
//           )}

//           <PendingInvitations />
//         </div>

//         <div className="xl:col-span-4">
//           <DashboardNotificationFeed />
//         </div>
//       </div>

//       {!workspacesQuery.isLoading && !workspacesQuery.isError && (
//         <RecentlyUpdatedWorkspaces workspaces={workspaces} />
//       )}

//       <EditWorkspaceDialog workspace={editingWorkspace} onClose={() => setEditingWorkspace(null)} />
//       <WorkspaceActionDialogs target={actionTarget} onClose={() => setActionTarget(null)} />
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useLocation, useSearchParams } from "react-router-dom";
import { useWorkspacesQuery } from "../hooks/useWorkspaceQueries";
import { useMyInvitationsQuery } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationQueries";
import { useUnreadNotificationCountQuery } from "@/features/notifications/hooks/useNotificationQueries";
import { PendingInvitations } from "@/features/workspace-invitations/components/PendingInvitations";
import { DashboardNotificationFeed } from "@/features/notifications/components/DashboardNotificationFeed";
import { DashboardGreeting } from "../components/dashboard/DashboardGreeting";
import { DashboardQuickActions } from "../components/dashboard/DashboardQuickActions";
import { DashboardOverview } from "../components/dashboard/DashboardOverview";
import { WorkspaceAccessSummary } from "../components/dashboard/WorkspaceAccessSummary";
import { RecentlyUpdatedWorkspaces } from "../components/dashboard/RecentlyUpdatedWorkspaces";
import { WorkspaceToolbar, type WorkspaceFilter } from "../components/WorkspaceToolbar";
import { WorkspaceGrid } from "../components/WorkspaceGrid";
import { WorkspaceGridSkeleton } from "../components/WorkspaceSkeleton";
import {
  ArchivedEmptyState,
  FilteredEmptyState,
  NoWorkspacesEmptyState,
  WorkspaceErrorState,
} from "../components/WorkspaceEmptyState";
import { EditWorkspaceDialog } from "../components/EditWorkspaceDialog";
import { WorkspaceActionDialogs, type WorkspaceActionTarget } from "../components/WorkspaceActionDialogs";
import type { WorkspaceRole, WorkspaceSummary } from "../types/workspace.types";
import type { AppShellOutletContext } from "@/layouts/AppShell";

const VALID_ROLES: WorkspaceRole[] = ["owner", "admin", "member", "guest"];

export function WorkspaceDashboardPage() {
  const { onCreateWorkspace } = useOutletContext<AppShellOutletContext>();
  const location = useLocation();

  const workspacesQuery = useWorkspacesQuery();
  const invitationsQuery = useMyInvitationsQuery();
  const unreadCountQuery = useUnreadNotificationCountQuery();

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceSummary | null>(null);
  const [actionTarget, setActionTarget] = useState<WorkspaceActionTarget | null>(null);

  const search = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status");
  const filter: WorkspaceFilter = statusParam === "active" || statusParam === "archived" ? statusParam : "all";
  const roleParam = searchParams.get("role");
  const roleFilter: WorkspaceRole | null = VALID_ROLES.includes(roleParam as WorkspaceRole)
    ? (roleParam as WorkspaceRole)
    : null;

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  }

  function setSearch(value: string) {
    updateParam("q", value || null);
  }

  function setFilter(value: WorkspaceFilter) {
    updateParam("status", value === "all" ? null : value);
  }

  function setRoleFilter(value: WorkspaceRole | null) {
    updateParam("role", value);
  }

  const workspaces = useMemo(() => workspacesQuery.data ?? [], [workspacesQuery.data]);

  const counts = useMemo(
    () => ({
      all: workspaces.length,
      active: workspaces.filter((workspace) => !workspace.isArchived).length,
      archived: workspaces.filter((workspace) => workspace.isArchived).length,
    }),
    [workspaces]
  );

  const filteredWorkspaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workspaces.filter((workspace) => {
      const matchesFilter =
        filter === "all" ? true : filter === "active" ? !workspace.isArchived : workspace.isArchived;

      if (!matchesFilter) return false;

      if (roleFilter && workspace.role !== roleFilter) return false;

      if (!query) return true;

      return (
        workspace.name.toLowerCase().includes(query) ||
        (workspace.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [workspaces, filter, search, roleFilter]);

  function clearFilters() {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    next.delete("status");
    next.delete("role");
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="space-y-6">
      <DashboardGreeting />

      <DashboardQuickActions
        onCreateWorkspace={onCreateWorkspace}
        activeCount={counts.active}
        pendingInvitationCount={invitationsQuery.data?.length ?? 0}
        unreadNotificationCount={unreadCountQuery.data ?? 0}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <DashboardOverview
            total={counts.all}
            active={counts.active}
            archived={counts.archived}
            pendingInvitations={invitationsQuery.data?.length ?? 0}
            isLoading={workspacesQuery.isLoading}
          />

          <section id="workspaces" aria-labelledby="your-workspaces-heading" className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="your-workspaces-heading" className="text-h3 text-foreground">
                Your workspaces
                {!workspacesQuery.isLoading && !workspacesQuery.isError && (
                  <span className="ml-2 text-caption">
                    {filteredWorkspaces.length} of {workspaces.length}
                  </span>
                )}
              </h2>
            </div>

            {workspacesQuery.isLoading && <WorkspaceGridSkeleton />}

            {workspacesQuery.isError && (
              <WorkspaceErrorState
                message={workspacesQuery.error?.message ?? "Something went wrong."}
                onRetry={() => workspacesQuery.refetch()}
              />
            )}

            {!workspacesQuery.isLoading && !workspacesQuery.isError && (
              <>
                {workspaces.length === 0 ? (
                  <NoWorkspacesEmptyState onCreate={onCreateWorkspace} />
                ) : (
                  <div className="space-y-4">
                    <WorkspaceToolbar
                      search={search}
                      onSearchChange={setSearch}
                      filter={filter}
                      onFilterChange={setFilter}
                      counts={counts}
                    />

                    {filteredWorkspaces.length === 0 ? (
                      filter === "archived" && !search && !roleFilter ? (
                        <ArchivedEmptyState />
                      ) : (
                        <FilteredEmptyState onClear={clearFilters} />
                      )
                    ) : (
                      <WorkspaceGrid
                        workspaces={filteredWorkspaces}
                        onEdit={setEditingWorkspace}
                        onArchive={(workspace) => setActionTarget({ type: "archive", workspace })}
                        onRestore={(workspace) => setActionTarget({ type: "restore", workspace })}
                        onLeave={(workspace) => setActionTarget({ type: "leave", workspace })}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          {!workspacesQuery.isLoading && !workspacesQuery.isError && workspaces.length > 0 && (
            <WorkspaceAccessSummary
              workspaces={workspaces}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
            />
          )}

          <PendingInvitations />
        </div>

        <div className="xl:col-span-4">
          <DashboardNotificationFeed />
        </div>
      </div>

      {!workspacesQuery.isLoading && !workspacesQuery.isError && (
        <RecentlyUpdatedWorkspaces workspaces={workspaces} />
      )}

      <EditWorkspaceDialog workspace={editingWorkspace} onClose={() => setEditingWorkspace(null)} />
      <WorkspaceActionDialogs target={actionTarget} onClose={() => setActionTarget(null)} />
    </div>
  );
}

