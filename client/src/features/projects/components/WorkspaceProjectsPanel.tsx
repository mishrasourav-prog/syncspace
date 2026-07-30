import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { canCreateProject } from "@/features/workspaces/workspace.permissions";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import { useWorkspaceProjectsQuery } from "../hooks/useProjectQueries";
import { CreateProjectDialog } from "./CreateProjectDialog";

const INITIAL_VISIBLE = 5;

function ProjectRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
    </div>
  );
}

interface WorkspaceProjectsPanelProps {
  workspace: WorkspaceSummary;
  search: string;
}

export function WorkspaceProjectsPanel({
  workspace,
  search,
}: WorkspaceProjectsPanelProps) {
  const navigate = useNavigate();
  const projectsQuery = useWorkspaceProjectsQuery(workspace._id);
  const [showAll, setShowAll] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const projects = useMemo(
    () => projectsQuery.data ?? [],
    [projectsQuery.data],
  );
  const canCreate = canCreateProject(workspace);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.slug.toLowerCase().includes(query),
    );
  }, [projects, search]);

  const visibleProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_VISIBLE);
  const hasMore = filteredProjects.length > INITIAL_VISIBLE;

  return (
    <section
      id="projects"
      aria-labelledby="projects-panel-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="projects-panel-heading" className="text-h3 text-foreground">
          Projects
          {!projectsQuery.isLoading && !projectsQuery.isError && (
            <span className="ml-2 text-caption">{filteredProjects.length}</span>
          )}
        </h2>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            New project
          </Button>
        )}
      </div>

      {projectsQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProjectRowSkeleton key={index} />
          ))}
        </div>
      )}

      {projectsQuery.isError && (
        <DashboardSectionError
          message={projectsQuery.error?.message ?? "Unable to load projects."}
          onRetry={() => projectsQuery.refetch()}
        />
      )}

      {!projectsQuery.isLoading &&
        !projectsQuery.isError &&
        projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
            <FolderKanban className="mx-auto h-6 w-6 text-muted" />
            <p className="mt-2 text-body">No projects yet.</p>
            <p className="text-caption">
              Create the first project for this workspace.
            </p>
            {canCreate && (
              <Button
                size="sm"
                className="mt-3"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                New project
              </Button>
            )}
          </div>
        )}

      {!projectsQuery.isLoading &&
        !projectsQuery.isError &&
        projects.length > 0 &&
        filteredProjects.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
            <p className="text-body">No projects match your search.</p>
          </div>
        )}

      {!projectsQuery.isLoading &&
        !projectsQuery.isError &&
        filteredProjects.length > 0 && (
          <div className="space-y-2">
            {visibleProjects.map((project) => (
              <button
                key={project._id}
                type="button"
                onClick={() =>
                  navigate(
                    `/workspaces/${workspace._id}/projects/${project._id}`,
                  )
                }
                className="flex w-full items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-left transition-colors hover:border-muted/40 hover:bg-background/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm text-primary">
                  {project.icon || <FolderKanban className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {project.name}
                  </p>
                  <p className="truncate text-caption">
                    {project.description || "No description."}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant={project.isArchived ? "warning" : "success"}>
                    {project.isArchived ? "Archived" : "Active"}
                  </Badge>
                  <span className="text-[11px] text-muted">
                    {formatRelativeTime(project.updatedAt)}
                  </span>
                </div>
              </button>
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="w-full rounded-lg py-2 text-center text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {showAll
                  ? "Show less"
                  : `View all ${filteredProjects.length} projects`}
              </button>
            )}
          </div>
        )}

      <CreateProjectDialog
        workspaceId={workspace._id}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </section>
  );
}
