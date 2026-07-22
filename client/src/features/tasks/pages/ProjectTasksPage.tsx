import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/app/store";
import { socket } from "@/realtime/socket";
import { useWorkspaceQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useProjectQuery } from "@/features/projects/hooks/useProjectQueries";
import { useProjectMembersQuery } from "@/features/project-members/hooks/useProjectMemberQueries";
import { InviteProjectMemberDialog } from "@/features/project-invitations/components/InviteProjectMemberDialog";
import { EditProjectDialog } from "@/features/projects/components/EditProjectDialog";
import { ProjectActionDialogs, type ProjectActionTarget } from "@/features/projects/components/ProjectActionDialogs";
import { ProjectHeader } from "@/features/projects/components/overview/ProjectHeader";
import { ProjectOverviewNavigation } from "@/features/projects/components/overview/ProjectOverviewNavigation";
import { ProjectReadOnlyBanner } from "@/features/projects/components/overview/ProjectReadOnlyBanner";
import {
  canCreateWorkItem,
  canEditProject,
  canInviteProjectMember,
  canUpdateWorkItemStatus,
  deriveProjectRole,
} from "@/features/projects/project.permissions";
import { taskQueryKeys } from "../task.queryKeys";
import { useProjectTasksQuery } from "../hooks/useTaskQueries";
import { useReorderProjectTasksMutation } from "../hooks/useTaskMutations";
import {
  canArchiveTask,
  canEditTask,
  canManageTaskAssignees,
  canReorderTaskBoard,
  canRestoreTask,
} from "../task.permissions";
import {
  ALL_STATUSES,
  countActiveFilters,
  filterTasks,
  hasNonSearchFilters,
  parseTaskFilters,
  type TaskDueFilter,
  type TaskStateFilter,
  type TaskView,
} from "../task.filters";
import type { Task, TaskPriority, TaskStatus, TaskType } from "../types/task.types";
import { CreateTaskDialog } from "../components/CreateTaskDialog";
import { EditTaskDialog } from "../components/EditTaskDialog";
import { TaskArchiveDialogs, type TaskActionTarget } from "../components/TaskArchiveDialogs";
import { TaskViewSwitcher } from "../components/TaskViewSwitcher";
import { TaskSummaryRail } from "../components/TaskSummaryRail";
import { TaskFilterToolbar } from "../components/filters/TaskFilterToolbar";
import { TaskBoard } from "../components/board/TaskBoard";
import { TaskListView } from "../components/list/TaskListView";

function ProjectTasksSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface/60 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3.5 w-full max-w-md" />
          </div>
        </div>
      </div>
      <div className="flex gap-4 border-b border-border pb-2.5">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-16" />
        ))}
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-[280px] shrink-0 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ProjectTasksPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = useAuthStore((state) => state.user?._id);

  const workspaceQuery = useWorkspaceQuery(workspaceId);
  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const tasksQuery = useProjectTasksQuery(projectId);
  const reorderMutation = useReorderProjectTasksMutation(projectId ?? "");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [projectActionTarget, setProjectActionTarget] = useState<ProjectActionTarget | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<TaskType>("task");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskActionTarget, setTaskActionTarget] = useState<TaskActionTarget | null>(null);

  const hasShownInaccessibleToast = useRef(false);
  const hasShownWorkspaceNotFoundToast = useRef(false);
  const hasHandledWorkspaceMismatch = useRef(false);

  const isProjectInaccessible =
    projectQuery.isError && (projectQuery.error?.status === 403 || projectQuery.error?.status === 404);

  useEffect(() => {
    hasShownInaccessibleToast.current = false;
    hasShownWorkspaceNotFoundToast.current = false;
    hasHandledWorkspaceMismatch.current = false;
  }, [workspaceId, projectId]);

  // Realtime: join the project's room and keep the task list in sync.
  useEffect(() => {
    if (!projectId || !workspaceId || !projectQuery.isSuccess || projectQuery.data?.workspace !== workspaceId) {
      return;
    }

    socket.emit("project:join", projectId, () => undefined);

    function handleTaskChanged(payload: { projectId: string }) {
      if (payload.projectId !== projectId) return;
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.projectList(projectId) });
    }

    socket.on("task:created", handleTaskChanged);
    socket.on("task:status-changed", handleTaskChanged);
    socket.on("task:assigned", handleTaskChanged);
    socket.on("tasks:reordered", handleTaskChanged);

    return () => {
      socket.off("task:created", handleTaskChanged);
      socket.off("task:status-changed", handleTaskChanged);
      socket.off("task:assigned", handleTaskChanged);
      socket.off("tasks:reordered", handleTaskChanged);
      socket.emit("project:leave", projectId, () => undefined);
    };
  }, [projectId, workspaceId, projectQuery.isSuccess, projectQuery.data, queryClient]);

  useEffect(() => {
    if (!isProjectInaccessible || hasShownInaccessibleToast.current) return;
    hasShownInaccessibleToast.current = true;
    toast.error(
      projectQuery.error?.status === 403
        ? "You do not have access to this project."
        : "This project is no longer accessible."
    );
    navigate(workspaceId ? `/workspaces/${workspaceId}#projects` : "/dashboard", { replace: true });
  }, [isProjectInaccessible, projectQuery.error, navigate, workspaceId]);

  useEffect(() => {
    if (
      !workspaceQuery.isError ||
      workspaceQuery.error?.status !== 404 ||
      isProjectInaccessible ||
      hasShownWorkspaceNotFoundToast.current
    ) {
      return;
    }

    hasShownWorkspaceNotFoundToast.current = true;
    toast.error("This workspace is no longer accessible.");
    navigate("/dashboard", { replace: true });
  }, [workspaceQuery.isError, workspaceQuery.error, isProjectInaccessible, navigate]);

  useEffect(() => {
    const project = projectQuery.data;
    if (!workspaceId || !projectQuery.isSuccess || !project) return;

    if (project.workspace === workspaceId) {
      hasHandledWorkspaceMismatch.current = false;
      return;
    }

    if (hasHandledWorkspaceMismatch.current) return;
    hasHandledWorkspaceMismatch.current = true;

    toast.error("This project does not belong to the selected workspace.");
    navigate(`/workspaces/${workspaceId}#projects`, { replace: true });
  }, [workspaceId, projectQuery.isSuccess, projectQuery.data, navigate]);

  const filters = useMemo(() => parseTaskFilters(searchParams), [searchParams]);

  function updateParams(mutator: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams);
    mutator(next);
    setSearchParams(next, { replace: true });
  }

  function setView(view: TaskView) {
    updateParams((next) => (view === "board" ? next.delete("view") : next.set("view", view)));
  }

  function setSearch(value: string) {
    updateParams((next) => (value ? next.set("q", value) : next.delete("q")));
  }

  function setCsvParam(key: "status" | "type" | "priority", values: string[]) {
    updateParams((next) => (values.length > 0 ? next.set(key, values.join(",")) : next.delete(key)));
  }

  function toggleStatus(status: TaskStatus) {
    const next = filters.status.includes(status)
      ? filters.status.filter((value) => value !== status)
      : [...filters.status, status];
    setCsvParam("status", next);
  }

  function toggleType(type: TaskType) {
    const next = filters.type.includes(type) ? filters.type.filter((value) => value !== type) : [...filters.type, type];
    setCsvParam("type", next);
  }

  function togglePriority(priority: TaskPriority) {
    const next = filters.priority.includes(priority)
      ? filters.priority.filter((value) => value !== priority)
      : [...filters.priority, priority];
    setCsvParam("priority", next);
  }

  function setAssignee(assignee: string | null) {
    updateParams((next) => (assignee ? next.set("assignee", assignee) : next.delete("assignee")));
  }

  function setDue(due: TaskDueFilter | null) {
    updateParams((next) => (due ? next.set("due", due) : next.delete("due")));
  }

  function setState(state: TaskStateFilter) {
    updateParams((next) => (state === "active" ? next.delete("state") : next.set("state", state)));
  }

  function clearFilters() {
    updateParams((next) => {
      next.delete("status");
      next.delete("type");
      next.delete("priority");
      next.delete("assignee");
      next.delete("due");
      next.delete("state");
    });
  }

  if (!workspaceId || !projectId) return null;

  if (projectQuery.isLoading || workspaceQuery.isLoading) {
    return <ProjectTasksSkeleton />;
  }

  if (projectQuery.isError) {
    if (projectQuery.error?.status === 403 || projectQuery.error?.status === 404) return null;

    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">{projectQuery.error?.message ?? "Unable to load this project."}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              void projectQuery.refetch();
            }}
          >
            Retry
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/workspaces/${workspaceId}#projects`)}>
            Back to workspace
          </Button>
        </div>
      </div>
    );
  }

  if (workspaceQuery.isError) {
    if (workspaceQuery.error?.status === 404) return null;

    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">{workspaceQuery.error?.message ?? "Unable to load this project's workspace."}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              void workspaceQuery.refetch();
            }}
          >
            Retry
          </Button>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const project = projectQuery.data;
  const workspace = workspaceQuery.data;
  if (!project || !workspace) return null;

  const members = membersQuery.data ?? [];
  const role = deriveProjectRole(members, currentUserId);
  const allTasks = tasksQuery.data ?? [];
  const rootTasks = allTasks.filter((task) => !task.parentTask);
  const selectedTask = allTasks.find((task) => task._id === selectedTaskId) ?? null;

  const canInvite = canInviteProjectMember(project, workspace, role);
  const canEdit = canEditProject(project, workspace, role);
  const canCreateTask = canCreateWorkItem(project, workspace, role);
  const canUpdateStatus = canUpdateWorkItemStatus(project, workspace, role);
  const canManageAssignees = selectedTask ? canManageTaskAssignees(selectedTask, project, workspace, role) : false;
  const canEditSelectedTask = selectedTask ? canEditTask(selectedTask, project, workspace, role) : false;

  // A single "now" snapshot for this render pass, threaded down to every
  // component that needs to compare against due dates.
  // eslint-disable-next-line react-hooks/purity -- intentional single time snapshot per render, not used for logic that must be reactive to the clock ticking.
  const now = Date.now();
  const activeFilterCount = countActiveFilters(filters);
  const hasFilters = hasNonSearchFilters(filters) || filters.q.trim().length > 0 || filters.state !== "active";

  const filteredTasks = filterTasks(rootTasks, filters, now);

  const columns: Record<TaskStatus, Task[]> = {
    TODO: filteredTasks.filter((task) => task.status === "TODO"),
    IN_PROGRESS: filteredTasks.filter((task) => task.status === "IN_PROGRESS"),
    IN_REVIEW: filteredTasks.filter((task) => task.status === "IN_REVIEW"),
    DONE: filteredTasks.filter((task) => task.status === "DONE"),
  };

  const taskCountByColumn = Object.fromEntries(ALL_STATUSES.map((status) => [status, columns[status].length]));

  const reorderAllowed = canReorderTaskBoard(
    project,
    workspace,
    role,
    { search: filters.q, status: filters.status, type: filters.type, priority: filters.priority, assignee: filters.assignee, due: filters.due, state: filters.state },
    taskCountByColumn
  );

  const reorderEnabled = reorderAllowed && !reorderMutation.isPending;

  function handleReorder(
    next: Record<TaskStatus, Task[]>,
    affectedStatuses: TaskStatus[]
  ) {
    if (!reorderEnabled || !projectId) return;

    const optimisticTasks = allTasks.map((task) => {
      if (task.parentTask || task.isArchived) return task;

      for (const status of ALL_STATUSES) {
        const index = next[status].findIndex((item) => item._id === task._id);

        if (index !== -1) {
          const statusChanged = task.status !== status;
          const optimisticTask: Task = {
            ...task,
            status,
            position: (index + 1) * 1000,
          };

          if (statusChanged && status === "DONE") {
            optimisticTask.completedAt = new Date(now).toISOString();
            optimisticTask.completedBy = currentUserId;
          }

          if (statusChanged && task.status === "DONE" && status !== "DONE") {
            optimisticTask.completedAt = undefined;
            optimisticTask.completedBy = undefined;
          }

          return optimisticTask;
        }
      }

      return task;
    });

    reorderMutation.mutate(
      {
        payload: {
          columns: affectedStatuses.map((status) => ({
            status,
            taskIds: next[status].map((task) => task._id),
          })),
        },
        optimisticTasks,
      },
      {
        onError: (error) => {
          toast.error(
            error.status === 409
              ? "The task board changed. It has been refreshed."
              : error.message ?? "Unable to reorder tasks. The board has been refreshed."
          );
        },
      }
    );
  }

  function openCreateDialog(type: TaskType) {
    setCreateDialogType(type);
    setCreateDialogOpen(true);
  }

  return (
    <div className="space-y-5">
      <ProjectReadOnlyBanner project={project} workspace={workspace} role={role} />

      <ProjectHeader
        project={project}
        workspace={workspace}
        role={role}
        members={members}
        onInvite={() => {
          if (canInvite) setInviteOpen(true);
        }}
        onEdit={() => setEditingProject(true)}
        onArchive={() => setProjectActionTarget({ type: "archive", project })}
        onRestore={() => setProjectActionTarget({ type: "restore", project })}
        onLeave={() => setProjectActionTarget({ type: "leave", project })}
      />

      <ProjectOverviewNavigation />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-h2 text-foreground">Tasks &amp; Issues</h2>

            <div className="flex flex-wrap items-center gap-3">
              <TaskViewSwitcher view={filters.view} onChange={setView} />

              {canCreateTask && (
                <div className="flex">
                <Button size="sm" onClick={() => openCreateDialog("task")} className="rounded-r-none">
                  <Plus className="h-3.5 w-3.5" />
                  New Task
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Choose item type"
                    className="!h-8 !w-8 rounded-l-none border-l border-primary-foreground/20 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openCreateDialog("task")}>New task</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openCreateDialog("issue")}>New issue</DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          <TaskFilterToolbar
            filters={filters}
            members={members}
            activeFilterCount={activeFilterCount}
            onSearchChange={setSearch}
            onToggleStatus={toggleStatus}
            onToggleType={toggleType}
            onTogglePriority={togglePriority}
            onAssigneeChange={setAssignee}
            onDueChange={setDue}
            onStateChange={setState}
            onClear={clearFilters}
          />

          {tasksQuery.isLoading && (
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-72 w-[280px] shrink-0 rounded-xl" />
              ))}
            </div>
          )}

          {tasksQuery.isError && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
              <p className="text-body">{tasksQuery.error?.message ?? "Unable to load tasks."}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    void tasksQuery.refetch();
                  }}
                >
                  Retry
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)}
                >
                  Back to Project Overview
                </Button>
              </div>
            </div>
          )}

          {!tasksQuery.isLoading && !tasksQuery.isError && filters.view === "board" && (
            <>
              {filteredTasks.length === 0 && hasFilters && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface/50 px-4 py-3">
                  <p className="text-sm text-muted">No tasks or issues match the current filters.</p>
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              )}

              <TaskBoard
                columns={columns}
                now={now}
                onTaskClick={(task) => setSelectedTaskId(task._id)}
                reorderDisabled={!reorderEnabled}
                reorderDisabledReason={
                  reorderMutation.isPending
                    ? "Saving the board order…"
                    : !reorderAllowed && role
                      ? hasFilters
                        ? "Clear filters and switch to Active tasks to reorder the board."
                        : project.isArchived || workspace.isArchived
                          ? "This board is read-only while its project or workspace is archived."
                          : undefined
                      : undefined
                }
                onReorder={handleReorder}
                onAddTask={canCreateTask ? () => openCreateDialog("task") : undefined}
              />
            </>
          )}

          {!tasksQuery.isLoading && !tasksQuery.isError && filters.view === "list" && (
            <TaskListView
              tasks={filteredTasks}
              now={now}
              onTaskClick={(task) => setSelectedTaskId(task._id)}
              emptyMessage={
                rootTasks.length === 0 ? "No tasks or issues yet." : "No tasks or issues match your filters."
              }
            />
          )}
        </div>

        <div className="xl:col-span-3 xl:sticky xl:top-[6.5rem] xl:self-start">
          <TaskSummaryRail
            tasks={filteredTasks}
            now={now}
            isLoading={tasksQuery.isLoading}
            isError={tasksQuery.isError}
            errorMessage={tasksQuery.error?.message}
            isFiltered={hasFilters}
            onRetry={() => {
              void tasksQuery.refetch();
            }}
            onSelectTask={(task) => setSelectedTaskId(task._id)}
          />
        </div>
      </div>

      {canInvite && (
        <InviteProjectMemberDialog
          projectId={project._id}
          projectName={project.name}
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
        />
      )}

      {canCreateTask && (
        <CreateTaskDialog
          projectId={project._id}
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          initialType={createDialogType}
        />
      )}

      <EditTaskDialog
        task={selectedTask}
        projectId={project._id}
        members={members}
        canEdit={canEditSelectedTask}
        canChangeStatus={canUpdateStatus && Boolean(selectedTask) && !selectedTask?.isArchived}
        canManageAssignees={canManageAssignees}
        canArchive={selectedTask ? canArchiveTask(selectedTask, project, workspace, role, currentUserId) : false}
        canRestore={selectedTask ? canRestoreTask(selectedTask, project, workspace, role, currentUserId) : false}
        onClose={() => setSelectedTaskId(null)}
        onRequestArchive={(task) => {
          setSelectedTaskId(null);
          setTaskActionTarget({ type: "archive", task });
        }}
        onRequestRestore={(task) => {
          setSelectedTaskId(null);
          setTaskActionTarget({ type: "restore", task });
        }}
      />

      <TaskArchiveDialogs target={taskActionTarget} projectId={project._id} onClose={() => setTaskActionTarget(null)} />

      {canEdit && (
        <EditProjectDialog
          project={editingProject ? project : null}
          workspaceId={workspace._id}
          onClose={() => setEditingProject(false)}
        />
      )}

      <ProjectActionDialogs
        target={projectActionTarget}
        workspaceId={workspace._id}
        onClose={() => setProjectActionTarget(null)}
      />
    </div>
  );
}
