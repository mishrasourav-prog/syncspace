import { useEffect, useRef, useState } from "react";

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";

import { useAuthStore } from "@/app/store";

import { activityQueryKeys } from "@/features/activity/activity.queryKeys";

import { ProjectActivityFeed } from "@/features/activity/components/ProjectActivityFeed";

import { discussionQueryKeys } from "@/features/discussions/discussion.queryKeys";

import { ProjectDiscussionsPreview } from "@/features/discussions/components/ProjectDiscussionsPreview";

import { documentQueryKeys } from "@/features/documents/document.queryKeys";

import { ProjectDocumentsPreview } from "@/features/documents/components/ProjectDocumentsPreview";

import { useProjectDocumentsQuery } from "@/features/documents/hooks/useDocumentQueries";

import { InviteProjectMemberDialog } from "@/features/project-invitations/components/InviteProjectMemberDialog";

import { PendingProjectInvitationsPanel } from "@/features/project-invitations/components/PendingProjectInvitationsPanel";

import { ProjectMembersPanel } from "@/features/project-members/components/ProjectMembersPanel";

import { useProjectMembersQuery } from "@/features/project-members/hooks/useProjectMemberQueries";

import { CreateTaskDialog } from "@/features/tasks/components/CreateTaskDialog";

import { ProjectCompletionPanel } from "@/features/tasks/components/ProjectCompletionPanel";

import { RecentWorkItems } from "@/features/tasks/components/RecentWorkItems";

import { WorkItemStatusOverview } from "@/features/tasks/components/WorkItemStatusOverview";

import { useProjectTasksQuery } from "@/features/tasks/hooks/useTaskQueries";

import { taskQueryKeys } from "@/features/tasks/task.queryKeys";

import { useWorkspaceQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";

import { socket } from "@/realtime/socket";

import { EditProjectDialog } from "../components/EditProjectDialog";

import {
  ProjectActionDialogs,
  type ProjectActionTarget,
} from "../components/ProjectActionDialogs";

import { ProjectAccessPanel } from "../components/overview/ProjectAccessPanel";

import { ProjectHeader } from "../components/overview/ProjectHeader";

import { ProjectOverviewMetrics } from "../components/overview/ProjectOverviewMetrics";

import { ProjectOverviewNavigation } from "../components/overview/ProjectOverviewNavigation";

import { ProjectReadOnlyBanner } from "../components/overview/ProjectReadOnlyBanner";

import { useProjectQuery } from "../hooks/useProjectQueries";

import {
  canCreateWorkItem,
  canEditProject,
  canInviteProjectMember,
  canManageProjectMembers,
  canUpdateWorkItemStatus,
  deriveProjectRole,
} from "../project.permissions";

function ProjectOverviewSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface/60 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />

          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3.5 w-full max-w-md" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border pb-2.5">
        {Array.from({
          length: 7,
        }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-16" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ProjectOverviewPage() {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;

    projectId: string;
  }>();

  const navigate = useNavigate();

  const location = useLocation();

  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();

  const search = searchParams.get("q") ?? "";

  const currentUserId = useAuthStore((state) => state.user?._id);

  const workspaceQuery = useWorkspaceQuery(workspaceId);

  const projectQuery = useProjectQuery(projectId);

  const membersQuery = useProjectMembersQuery(projectId);

  const tasksQuery = useProjectTasksQuery(projectId);

  const documentsQuery = useProjectDocumentsQuery(projectId, "");

  const [inviteOpen, setInviteOpen] = useState(false);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const [editingProject, setEditingProject] = useState(false);

  const [actionTarget, setActionTarget] = useState<ProjectActionTarget | null>(
    null,
  );

  const hasShownInaccessibleToast = useRef(false);

  const hasHandledWorkspaceMismatch = useRef(false);

  const isProjectInaccessible =
    projectQuery.isError &&
    (projectQuery.error?.status === 403 || projectQuery.error?.status === 404);

  useEffect(() => {
    hasShownInaccessibleToast.current = false;

    hasHandledWorkspaceMismatch.current = false;
  }, [workspaceId, projectId]);

  useEffect(() => {
    if (
      !projectId ||
      !workspaceId ||
      !projectQuery.isSuccess ||
      projectQuery.data?.workspace !== workspaceId
    ) {
      return;
    }

    socket.emit("project:join", projectId, () => undefined);

    const handleActivityNew = (payload: { projectId: string }): void => {
      if (payload.projectId !== projectId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: activityQueryKeys.project(projectId),
      });
    };

    const handleTaskChanged = (payload: { projectId: string }): void => {
      if (payload.projectId !== projectId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.projectList(projectId),
      });
    };

    const handleDocumentChanged = (payload: { projectId: string }): void => {
      if (payload.projectId !== projectId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: documentQueryKeys.project(projectId),
      });
    };

    const handleDiscussionChanged = (payload: { projectId: string }): void => {
      if (payload.projectId !== projectId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.project(projectId),
      });
    };

    socket.on("activity:new", handleActivityNew);

    socket.on("task:created", handleTaskChanged);

    socket.on("task:status-changed", handleTaskChanged);

    socket.on("task:updated", handleTaskChanged);

    socket.on("task:assigned", handleTaskChanged);

    socket.on("task:unassigned", handleTaskChanged);

    socket.on("task:assignment-request-accepted", handleTaskChanged);

    socket.on("tasks:reordered", handleTaskChanged);

    socket.on("document:created", handleDocumentChanged);

    socket.on("document:updated", handleDocumentChanged);

    socket.on("document:archived", handleDocumentChanged);

    socket.on("document:restored", handleDocumentChanged);

    socket.on("discussion:changed", handleDiscussionChanged);

    socket.on("discussion:reply-changed", handleDiscussionChanged);

    return () => {
      socket.off("activity:new", handleActivityNew);

      socket.off("task:created", handleTaskChanged);

      socket.off("task:status-changed", handleTaskChanged);

      socket.off("task:updated", handleTaskChanged);

      socket.off("task:assigned", handleTaskChanged);

      socket.off("task:unassigned", handleTaskChanged);

      socket.off("task:assignment-request-accepted", handleTaskChanged);

      socket.off("tasks:reordered", handleTaskChanged);

      socket.off("document:created", handleDocumentChanged);

      socket.off("document:updated", handleDocumentChanged);

      socket.off("document:archived", handleDocumentChanged);

      socket.off("document:restored", handleDocumentChanged);

      socket.off("discussion:changed", handleDiscussionChanged);

      socket.off("discussion:reply-changed", handleDiscussionChanged);

      socket.emit("project:leave", projectId, () => undefined);
    };
  }, [
    projectId,
    workspaceId,
    projectQuery.isSuccess,
    projectQuery.data,
    queryClient,
  ]);

  useEffect(() => {
    if (!isProjectInaccessible || hasShownInaccessibleToast.current) {
      return;
    }

    hasShownInaccessibleToast.current = true;

    toast.error(
      projectQuery.error?.status === 403
        ? "You do not have access to this project."
        : "This project is no longer accessible.",
    );

    navigate(
      workspaceId ? `/workspaces/${workspaceId}#projects` : "/dashboard",
      {
        replace: true,
      },
    );
  }, [isProjectInaccessible, projectQuery.error, navigate, workspaceId]);

  useEffect(() => {
    const project = projectQuery.data;

    if (!workspaceId || !projectQuery.isSuccess || !project) {
      return;
    }

    if (project.workspace === workspaceId) {
      hasHandledWorkspaceMismatch.current = false;

      return;
    }

    if (hasHandledWorkspaceMismatch.current) {
      return;
    }

    hasHandledWorkspaceMismatch.current = true;

    toast.error("This project does not belong to the selected workspace.");

    navigate(`/workspaces/${workspaceId}#projects`, {
      replace: true,
    });
  }, [workspaceId, projectQuery.isSuccess, projectQuery.data, navigate]);

  useEffect(() => {
    if (!projectQuery.isSuccess || !location.hash) {
      return;
    }

    const sectionId = location.hash.replace("#", "");

    if (!sectionId) {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",

        block: "start",
      });
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.hash, projectQuery.isSuccess]);

  if (!workspaceId || !projectId) {
    return null;
  }

  if (projectQuery.isLoading || workspaceQuery.isLoading) {
    return <ProjectOverviewSkeleton />;
  }

  if (projectQuery.isError) {
    if (
      projectQuery.error?.status === 403 ||
      projectQuery.error?.status === 404
    ) {
      return null;
    }

    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">
          {projectQuery.error?.message ?? "Unable to load this project."}
        </p>

        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              void projectQuery.refetch();
            }}
          >
            Retry
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate(`/workspaces/${workspaceId}#projects`)}
          >
            Back to workspace
          </Button>
        </div>
      </div>
    );
  }

  if (workspaceQuery.isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">
          {workspaceQuery.error?.message ??
            "Unable to load this project's workspace."}
        </p>

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

  if (!project || !workspace) {
    return null;
  }

  const members = membersQuery.data ?? [];

  const role = deriveProjectRole(members, currentUserId);

  const tasks = tasksQuery.data ?? [];

  const canManageMembers = canManageProjectMembers(project, workspace, role);

  const canInvite = canInviteProjectMember(project, workspace, role);

  const canCreateTask = canCreateWorkItem(project, workspace, role);

  const canUpdateStatus = canUpdateWorkItemStatus(project, workspace, role);

  const canEdit = canEditProject(project, workspace, role);

  const canViewProjectInvitations = role === "admin";

  const canCancelProjectInvitations = role === "admin";

  return (
    <div className="space-y-5">
      <ProjectReadOnlyBanner
        project={project}
        workspace={workspace}
        role={role}
      />

      <ProjectHeader
        project={project}
        workspace={workspace}
        role={role}
        members={members}
        onInvite={() => setInviteOpen(true)}
        onEdit={() => setEditingProject(true)}
        onArchive={() =>
          setActionTarget({
            type: "archive",

            project,
          })
        }
        onRestore={() =>
          setActionTarget({
            type: "restore",

            project,
          })
        }
        onLeave={() =>
          setActionTarget({
            type: "leave",

            project,
          })
        }
      />

      <ProjectOverviewNavigation />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-9">
          <ProjectOverviewMetrics
            tasks={tasks}
            members={members}
            documentCount={documentsQuery.data?.documents.length ?? null}
            documentCountHasMore={Boolean(documentsQuery.data?.nextCursor)}
            isLoadingTasks={tasksQuery.isLoading}
            isLoadingMembers={membersQuery.isLoading}
            isLoadingDocuments={documentsQuery.isLoading}
            hasTasksError={tasksQuery.isError}
            hasMembersError={membersQuery.isError}
            hasDocumentsError={documentsQuery.isError}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <WorkItemStatusOverview
              tasks={tasks}
              isLoading={tasksQuery.isLoading}
              isError={tasksQuery.isError}
              errorMessage={tasksQuery.error?.message}
              onRetry={() => {
                void tasksQuery.refetch();
              }}
            />

            <ProjectCompletionPanel
              tasks={tasks}
              isLoading={tasksQuery.isLoading}
              isError={tasksQuery.isError}
              errorMessage={tasksQuery.error?.message}
              onRetry={() => {
                void tasksQuery.refetch();
              }}
            />
          </div>

          <RecentWorkItems
            projectId={project._id}
            workspaceId={workspace._id}
            tasks={tasks}
            search={search}
            canUpdateStatus={canUpdateStatus}
            canCreateTask={canCreateTask}
            isLoading={tasksQuery.isLoading}
            isError={tasksQuery.isError}
            errorMessage={tasksQuery.error?.message}
            onRetry={() => {
              void tasksQuery.refetch();
            }}
            onCreateTask={() => setCreateTaskOpen(true)}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ProjectDocumentsPreview projectId={project._id} search={search} />

            <ProjectDiscussionsPreview
              projectId={project._id}
              search={search}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ProjectMembersPanel
              workspaceId={workspaceId}
              projectId={project._id}
              search={search}
              canManage={canManageMembers}
              canInvite={canInvite}
              onInvite={() => setInviteOpen(true)}
            />

            <PendingProjectInvitationsPanel
              projectId={project._id}
              canView={canViewProjectInvitations}
              canCancel={canCancelProjectInvitations}
            />
          </div>

          <ProjectAccessPanel
            project={project}
            workspace={workspace}
            role={role}
            members={members}
            onInvite={() => setInviteOpen(true)}
            onEdit={() => setEditingProject(true)}
          />
        </div>

        <div className="xl:col-span-3">
          <ProjectActivityFeed projectId={project._id} />
        </div>
      </div>

      <InviteProjectMemberDialog
        projectId={project._id}
        projectName={project.name}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      <CreateTaskDialog
        projectId={project._id}
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
      />

      {canEdit && (
        <EditProjectDialog
          project={editingProject ? project : null}
          workspaceId={workspace._id}
          onClose={() => setEditingProject(false)}
        />
      )}

      <ProjectActionDialogs
        target={actionTarget}
        workspaceId={workspace._id}
        onClose={() => setActionTarget(null)}
      />
    </div>
  );
}
