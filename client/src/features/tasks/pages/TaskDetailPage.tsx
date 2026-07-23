import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store";
import { socket } from "@/realtime/socket";
import { useWorkspaceQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useProjectQuery } from "@/features/projects/hooks/useProjectQueries";
import { useProjectMembersQuery } from "@/features/project-members/hooks/useProjectMemberQueries";
import { deriveProjectRole } from "@/features/projects/project.permissions";
import { activityQueryKeys } from "@/features/activity/activity.queryKeys";
import { taskQueryKeys } from "../task.queryKeys";
import { useProjectTasksQuery, useTaskQuery } from "../hooks/useTaskQueries";
import { useUpdateTaskStatusMutation } from "../hooks/useTaskMutations";
import {
  canArchiveTask,
  canChangeTaskStatus,
  canCreateSubtask,
  canEditTask,
  canManageTaskAssignees,
  canRestoreTask,
} from "../task.permissions";
import { canUpdateWorkItemStatus } from "@/features/projects/project.permissions";
import { EditTaskDialog } from "../components/EditTaskDialog";
import { TaskArchiveDialogs, type TaskActionTarget } from "../components/TaskArchiveDialogs";
import { CreateSubtaskDialog } from "../components/CreateSubtaskDialog";
import { TaskSiblingNavigation } from "../components/detail/TaskSiblingNavigation";
import { TaskDetailHeader } from "../components/detail/TaskDetailHeader";
import { TaskDescriptionPanel } from "../components/detail/TaskDescriptionPanel";
import { TaskAssigneesSection } from "../components/detail/TaskAssigneesSection";
import { TaskSubtasksSection } from "../components/detail/TaskSubtasksSection";
import { TaskDetailActions } from "../components/detail/TaskDetailActions";
import { TaskDetailsRail } from "../components/detail/TaskDetailsRail";
import { TaskHierarchyPanel } from "../components/detail/TaskHierarchyPanel";
import { TaskActivityPanel } from "../components/detail/TaskActivityPanel";
import { TaskCommentsPanel } from "../components/comments/TaskCommentsPanel";
import type { Task, TaskStatus } from "../types/task.types";

function TaskDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-56" />
      <div className="rounded-xl border border-border bg-surface/60 p-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-3 h-8 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-4 xl:col-span-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function sortByPosition(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => (a.position - b.position) || a._id.localeCompare(b._id));
}

export function TaskDetailPage() {
  const { workspaceId, projectId, taskId } = useParams<{
    workspaceId: string;
    projectId: string;
    taskId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?._id);

  const workspaceQuery = useWorkspaceQuery(workspaceId);
  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const taskQuery = useTaskQuery(projectId, taskId);
  const projectTasksQuery = useProjectTasksQuery(projectId);

  const updateStatusMutation = useUpdateTaskStatusMutation(projectId ?? "");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskActionTarget, setTaskActionTarget] = useState<TaskActionTarget | null>(null);
  const [isCreateSubtaskOpen, setIsCreateSubtaskOpen] = useState(false);
  const [pendingSubtaskId, setPendingSubtaskId] = useState<string | undefined>(undefined);

  const hasShownMismatchToast = useRef(false);
  const hasShownProjectInaccessibleToast = useRef(false);
  const hasShownWorkspaceNotFoundToast = useRef(false);
  const hasShownTaskInaccessibleToast = useRef(false);

  useEffect(() => {
    hasShownMismatchToast.current = false;
    hasShownProjectInaccessibleToast.current = false;
    hasShownWorkspaceNotFoundToast.current = false;
    hasShownTaskInaccessibleToast.current = false;
  }, [workspaceId, projectId, taskId]);

  const isTaskInaccessible = taskQuery.isError && (taskQuery.error?.status === 403 || taskQuery.error?.status === 404);
  const isProjectInaccessible =
    projectQuery.isError && (projectQuery.error?.status === 403 || projectQuery.error?.status === 404);

  // Task 403/404 -> back to Tasks & Issues.
  useEffect(() => {
    if (!isTaskInaccessible || hasShownTaskInaccessibleToast.current || !workspaceId || !projectId) return;
    hasShownTaskInaccessibleToast.current = true;
    toast.error(taskQuery.error?.status === 403 ? "You do not have access to this task." : "This task no longer exists.");
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, { replace: true });
  }, [isTaskInaccessible, taskQuery.error, navigate, workspaceId, projectId]);

  // Project 403/404 -> back to workspace projects.
  useEffect(() => {
    if (!isProjectInaccessible || hasShownProjectInaccessibleToast.current || !workspaceId) return;
    hasShownProjectInaccessibleToast.current = true;
    toast.error(
      projectQuery.error?.status === 403 ? "You do not have access to this project." : "This project is no longer accessible."
    );
    navigate(`/workspaces/${workspaceId}#projects`, { replace: true });
  }, [isProjectInaccessible, projectQuery.error, navigate, workspaceId]);

  // Workspace 404 -> dashboard.
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

  // URL mismatch: project must belong to workspace; task must belong to project.
  useEffect(() => {
    const project = projectQuery.data;
    const task = taskQuery.data;
    if (!workspaceId || !projectId) return;

    const projectMismatch = projectQuery.isSuccess && project && project.workspace !== workspaceId;
    const taskMismatch = taskQuery.isSuccess && task && task.project !== projectId;

    if (!projectMismatch && !taskMismatch) {
      hasShownMismatchToast.current = false;
      return;
    }
    if (hasShownMismatchToast.current) return;
    hasShownMismatchToast.current = true;

    toast.error(
      projectMismatch ? "This project does not belong to the selected workspace." : "This task does not belong to this project."
    );
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, { replace: true });
  }, [workspaceId, projectId, projectQuery.isSuccess, projectQuery.data, taskQuery.isSuccess, taskQuery.data, navigate]);

  // Realtime: join the project room and refresh on real server events only.
  useEffect(() => {
    if (
      !projectId ||
      !workspaceId ||
      !taskId ||
      !projectQuery.isSuccess ||
      projectQuery.data?.workspace !== workspaceId ||
      !taskQuery.isSuccess ||
      taskQuery.data?.project !== projectId
    ) {
      return;
    }

    socket.emit("project:join", projectId, () => undefined);

    function handleStatusChanged(payload: { projectId: string; taskId: string }) {
      if (payload.projectId !== projectId) return;
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.projectList(projectId) });
      if (payload.taskId === taskId) {
        void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(projectId, taskId) });
      }
      void queryClient.invalidateQueries({ queryKey: activityQueryKeys.project(projectId) });
    }

    function handleAssigned(payload: { projectId: string; taskId: string }) {
      if (payload.projectId !== projectId) return;
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.projectList(projectId) });
      if (payload.taskId === taskId) {
        void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(projectId, taskId) });
        void queryClient.invalidateQueries({ queryKey: taskQueryKeys.assignees(projectId, taskId) });
      }
    }

    function handleCreated(payload: { projectId: string }) {
      if (payload.projectId !== projectId) return;
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.projectList(projectId) });
    }

    function handleReordered(payload: { projectId: string }) {
      if (payload.projectId !== projectId) return;
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.projectList(projectId) });
    }

    function handleActivity(payload: { projectId: string }) {
      if (payload.projectId !== projectId) return;
      void queryClient.invalidateQueries({ queryKey: activityQueryKeys.project(projectId) });
    }

    socket.on("task:status-changed", handleStatusChanged);
    socket.on("task:assigned", handleAssigned);
    socket.on("task:created", handleCreated);
    socket.on("tasks:reordered", handleReordered);
    socket.on("activity:new", handleActivity);

    return () => {
      socket.off("task:status-changed", handleStatusChanged);
      socket.off("task:assigned", handleAssigned);
      socket.off("task:created", handleCreated);
      socket.off("tasks:reordered", handleReordered);
      socket.off("activity:new", handleActivity);
      socket.emit("project:leave", projectId, () => undefined);
    };
  }, [projectId, workspaceId, taskId, projectQuery.isSuccess, projectQuery.data, taskQuery.isSuccess, taskQuery.data, queryClient]);

  if (!workspaceId || !projectId || !taskId) return null;

  if (workspaceQuery.isLoading || projectQuery.isLoading || taskQuery.isLoading || membersQuery.isLoading) {
    return <TaskDetailSkeleton />;
  }

  if (isTaskInaccessible || isProjectInaccessible) return null;

  if (workspaceQuery.isError && workspaceQuery.error?.status === 404) return null;

  if (taskQuery.isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">{taskQuery.error?.message ?? "Unable to load this task."}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => void taskQuery.refetch()}>
            Retry
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks`)}>
            Back to Tasks &amp; Issues
          </Button>
        </div>
      </div>
    );
  }

  if (projectQuery.isError || workspaceQuery.isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">
          {projectQuery.error?.message ?? workspaceQuery.error?.message ?? "Unable to load this task's project."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              void projectQuery.refetch();
              void workspaceQuery.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const task = taskQuery.data;
  const project = projectQuery.data;
  const workspace = workspaceQuery.data;
  if (!task || !project || !workspace) return null;

  const members = membersQuery.data ?? [];
  const role = deriveProjectRole(members, currentUserId);
  const allTasks = projectTasksQuery.data ?? [];
  const subtasks = sortByPosition(allTasks.filter((candidate) => candidate.parentTask === task._id));

  const parentTask = !task.parentTask
    ? null
    : allTasks.find((candidate) => candidate._id === task.parentTask) ??
      (projectTasksQuery.isLoading ? undefined : null);

  const canEdit = canEditTask(task, project, workspace, role);
  const canChangeStatus = canChangeTaskStatus(task, project, workspace, role);
  const canManageAssignees = canManageTaskAssignees(task, project, workspace, role);
  const canArchive = canArchiveTask(task, project, workspace, role, currentUserId);
  const canRestore = canRestoreTask(task, project, workspace, role, currentUserId);
  const canAddSubtask = canCreateSubtask(task, project, workspace, role);

  function handleStatusChange(status: TaskStatus) {
    if (status === task!.status) return;
    updateStatusMutation.mutate(
      { taskId: task!._id, status },
      {
        onSuccess: () => toast.success("Status updated."),
        onError: (error) => toast.error(error.message ?? "Unable to update status."),
      }
    );
  }

  function handleToggleSubtaskComplete(subtask: Task) {
    if (subtask.isArchived || updateStatusMutation.isPending) return;

    setPendingSubtaskId(subtask._id);
    updateStatusMutation.mutate(
      { taskId: subtask._id, status: subtask.status === "DONE" ? "TODO" : "DONE" },
      {
        onSuccess: () => toast.success("Subtask updated."),
        onError: (error) => toast.error(error.message ?? "Unable to update subtask."),
        onSettled: () => setPendingSubtaskId(undefined),
      }
    );
  }

  return (
    <div className="space-y-5">
      {workspace.isArchived && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          This workspace is archived. This task is read-only.
        </div>
      )}
      {!workspace.isArchived && project.isArchived && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          This project is archived. This task is read-only.
        </div>
      )}
      {!workspace.isArchived && !project.isArchived && task.isArchived && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          This task is archived and read-only.
        </div>
      )}

      {membersQuery.isError && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Member roles and names could not be loaded. Role-dependent actions are disabled.</span>
            <Button type="button" size="sm" variant="secondary" onClick={() => void membersQuery.refetch()}>
              Retry
            </Button>
          </div>
        </div>
      )}

      <TaskSiblingNavigation
        workspaceId={workspaceId}
        projectId={projectId}
        orderedTasks={sortByPosition(allTasks)}
        currentTaskId={task._id}
      />

      <TaskDetailHeader
        task={task}
        canEdit={canEdit}
        canChangeStatus={canChangeStatus}
        canManageAssignees={canManageAssignees}
        canArchive={canArchive}
        canRestore={canRestore}
        isUpdatingStatus={updateStatusMutation.isPending}
        onEdit={() => setIsEditOpen(true)}
        onManageAssignees={() => setIsEditOpen(true)}
        onArchive={() => setTaskActionTarget({ type: "archive", task })}
        onRestore={() => setTaskActionTarget({ type: "restore", task })}
        onStatusChange={handleStatusChange}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <section className="space-y-6 rounded-xl border border-border bg-surface/60 p-5 shadow-soft sm:p-6">
            <TaskDescriptionPanel description={task.description} />
            <TaskAssigneesSection task={task} projectId={projectId} members={members} canManage={canManageAssignees} />
            <TaskSubtasksSection
              subtasks={subtasks}
              workspaceId={workspaceId}
              projectId={projectId}
              canToggleStatus={canUpdateWorkItemStatus(project, workspace, role)}
              canCreateSubtask={canAddSubtask}
              isLoading={projectTasksQuery.isLoading}
              isError={projectTasksQuery.isError}
              isUpdatingStatus={updateStatusMutation.isPending}
              pendingSubtaskId={pendingSubtaskId}
              onRetry={() => void projectTasksQuery.refetch()}
              onToggleComplete={handleToggleSubtaskComplete}
              onAddSubtask={() => setIsCreateSubtaskOpen(true)}
            />
          </section>

          <TaskCommentsPanel
            projectId={projectId}
            task={task}
            project={project}
            workspace={workspace}
            role={role}
            currentUserId={currentUserId}
          />
        </div>

        <div className="space-y-4 xl:col-span-4 xl:sticky xl:top-[5.5rem] xl:self-start">
          <TaskDetailActions
            task={task}
            canArchive={canArchive}
            canRestore={canRestore}
            canMarkDone={canChangeStatus}
            isUpdatingStatus={updateStatusMutation.isPending}
            onArchive={() => setTaskActionTarget({ type: "archive", task })}
            onRestore={() => setTaskActionTarget({ type: "restore", task })}
            onMarkDone={() => handleStatusChange("DONE")}
            onReopen={() => handleStatusChange("TODO")}
          />
          <TaskDetailsRail task={task} members={members} />
          <TaskHierarchyPanel
            task={task}
            workspaceId={workspaceId}
            projectId={projectId}
            parentTask={parentTask}
            subtaskCount={subtasks.length}
            isLoading={projectTasksQuery.isLoading}
            isError={projectTasksQuery.isError}
            onRetry={() => void projectTasksQuery.refetch()}
          />
          <TaskActivityPanel projectId={projectId} taskId={task._id} />
        </div>
      </div>

      <EditTaskDialog
        task={isEditOpen ? task : null}
        projectId={projectId}
        members={members}
        canEdit={canEdit}
        canChangeStatus={canChangeStatus}
        canManageAssignees={canManageAssignees}
        canArchive={canArchive}
        canRestore={canRestore}
        onClose={() => setIsEditOpen(false)}
        onRequestArchive={(target) => {
          setIsEditOpen(false);
          setTaskActionTarget({ type: "archive", task: target });
        }}
        onRequestRestore={(target) => {
          setIsEditOpen(false);
          setTaskActionTarget({ type: "restore", task: target });
        }}
      />

      <TaskArchiveDialogs target={taskActionTarget} projectId={projectId} onClose={() => setTaskActionTarget(null)} />

      {canAddSubtask && (
        <CreateSubtaskDialog
          projectId={projectId}
          parentTaskId={task._id}
          parentTaskTitle={task.title}
          open={isCreateSubtaskOpen}
          onClose={() => setIsCreateSubtaskOpen(false)}
        />
      )}
    </div>
  );
}
