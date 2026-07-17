import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store";
import { useWorkspacesQuery } from "../hooks/useWorkspaceQueries";
import { useMyInvitationsQuery } from "@/features/workspace-invitations/hooks/useWorkspaceInvitationQueries";
import { PendingInvitations } from "@/features/workspace-invitations/components/PendingInvitations";
import { WorkspaceToolbar, type WorkspaceFilter } from "../components/WorkspaceToolbar";
import { WorkspaceGrid } from "../components/WorkspaceGrid";
import { WorkspaceGridSkeleton } from "../components/WorkspaceSkeleton";
import {
  ArchivedEmptyState,
  FilteredEmptyState,
  NoWorkspacesEmptyState,
  WorkspaceErrorState,
} from "../components/WorkspaceEmptyState";
import { CreateWorkspaceDialog } from "../components/CreateWorkspaceDialog";
import { EditWorkspaceDialog } from "../components/EditWorkspaceDialog";
import { WorkspaceActionDialogs, type WorkspaceActionTarget } from "../components/WorkspaceActionDialogs";
import type { WorkspaceSummary } from "../types/workspace.types";

export function WorkspaceDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const workspacesQuery = useWorkspacesQuery();
  const invitationsQuery = useMyInvitationsQuery();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WorkspaceFilter>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceSummary | null>(null);
  const [actionTarget, setActionTarget] = useState<WorkspaceActionTarget | null>(null);

  const workspaces = workspacesQuery.data ?? [];

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

      if (!query) return true;

      return (
        workspace.name.toLowerCase().includes(query) ||
        (workspace.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [workspaces, filter, search]);

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h1 text-foreground">
            {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Workspace dashboard"}
          </h1>
          <p className="mt-1 text-body">Manage your workspaces and pending invitations.</p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Create workspace
        </Button>
      </div>

      {!workspacesQuery.isLoading && !workspacesQuery.isError && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryChip label="Total" value={counts.all} />
          <SummaryChip label="Active" value={counts.active} />
          <SummaryChip label="Archived" value={counts.archived} />
          <SummaryChip label="Invitations" value={invitationsQuery.data?.length ?? 0} />
        </div>
      )}

      <PendingInvitations />

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
            <NoWorkspacesEmptyState onCreate={() => setCreateDialogOpen(true)} />
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
                filter === "archived" && !search ? (
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

      <CreateWorkspaceDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <EditWorkspaceDialog workspace={editingWorkspace} onClose={() => setEditingWorkspace(null)} />
      <WorkspaceActionDialogs target={actionTarget} onClose={() => setActionTarget(null)} />
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface/60 px-3 py-2.5">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-caption">{label}</p>
    </div>
  );
}
