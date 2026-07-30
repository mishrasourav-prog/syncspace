import { useEffect, useRef, useState } from "react";

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";

import { socket } from "@/realtime/socket";

import { activityQueryKeys } from "@/features/activity/activity.queryKeys";

import { WorkspaceActivityFeed } from "@/features/activity/components/WorkspaceActivityFeed";

import { useWorkspaceProjectsQuery } from "@/features/projects/hooks/useProjectQueries";

import { WorkspaceProjectsPanel } from "@/features/projects/components/WorkspaceProjectsPanel";

import { useWorkspaceMembersQuery } from "@/features/workspace-members/hooks/useWorkspaceMemberQueries";

import { WorkspaceMembersPanel } from "@/features/workspace-members/components/WorkspaceMembersPanel";

import { InviteWorkspaceMemberDialog } from "@/features/workspace-members/components/InviteWorkspaceMemberDialog";

import { useWorkspaceQuery } from "../hooks/useWorkspaceQueries";

import { EditWorkspaceDialog } from "../components/EditWorkspaceDialog";

import {
  WorkspaceActionDialogs,
  type WorkspaceActionTarget,
} from "../components/WorkspaceActionDialogs";

import { WorkspaceHeader } from "../components/overview/WorkspaceHeader";

import { WorkspaceReadOnlyBanner } from "../components/overview/WorkspaceReadOnlyBanner";

import { WorkspaceOverviewNavigation } from "../components/overview/WorkspaceOverviewNavigation";

import { WorkspaceOverviewMetrics } from "../components/overview/WorkspaceOverviewMetrics";

import { WorkspaceAccessPanel } from "../components/overview/WorkspaceAccessPanel";

import type { WorkspaceSummary } from "../types/workspace.types";

function WorkspaceOverviewSkeleton() {
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
          length: 5,
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

export function WorkspaceOverviewPage() {
  const { workspaceId } = useParams<{
    workspaceId: string;
  }>();

  const navigate = useNavigate();

  const location = useLocation();

  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();

  const search = searchParams.get("q") ?? "";

  const workspaceQuery = useWorkspaceQuery(workspaceId);

  const projectsQuery = useWorkspaceProjectsQuery(workspaceId);

  const membersQuery = useWorkspaceMembersQuery(workspaceId);

  const [inviteOpen, setInviteOpen] = useState(false);

  const [editingWorkspace, setEditingWorkspace] =
    useState<WorkspaceSummary | null>(null);

  const [actionTarget, setActionTarget] =
    useState<WorkspaceActionTarget | null>(null);

  const hasShownNotFoundToast = useRef(false);

  useEffect(() => {
    hasShownNotFoundToast.current = false;
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    socket.emit("workspace:join", workspaceId, () => undefined);

    const handleActivityNew = (payload: {
      workspaceId: string;

      projectId: string;

      activityId: string;
    }): void => {
      if (payload.workspaceId !== workspaceId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: activityQueryKeys.workspace(workspaceId),
      });
    };

    socket.on("activity:new", handleActivityNew);

    return () => {
      socket.off("activity:new", handleActivityNew);

      socket.emit("workspace:leave", workspaceId, () => undefined);
    };
  }, [workspaceId, queryClient]);

  useEffect(() => {
    if (
      !workspaceQuery.isError ||
      workspaceQuery.error?.status !== 404 ||
      hasShownNotFoundToast.current
    ) {
      return;
    }

    hasShownNotFoundToast.current = true;

    toast.error("This workspace is no longer accessible.");

    navigate("/dashboard", {
      replace: true,
    });
  }, [workspaceQuery.isError, workspaceQuery.error, navigate]);

  useEffect(() => {
    if (!workspaceQuery.isSuccess || !location.hash) {
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
  }, [location.hash, workspaceQuery.isSuccess]);

  if (!workspaceId) {
    return null;
  }

  if (workspaceQuery.isLoading) {
    return <WorkspaceOverviewSkeleton />;
  }

  if (workspaceQuery.isError) {
    if (workspaceQuery.error?.status === 404) {
      return null;
    }

    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">
          {workspaceQuery.error?.message ?? "Unable to load this workspace."}
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

  const workspace = workspaceQuery.data;

  if (!workspace) {
    return null;
  }

  return (
    <div className="space-y-5">
      <WorkspaceReadOnlyBanner workspace={workspace} />

      <WorkspaceHeader
        workspace={workspace}
        onInvite={() => setInviteOpen(true)}
        onEdit={() => setEditingWorkspace(workspace)}
        onArchive={() =>
          setActionTarget({
            type: "archive",

            workspace,
          })
        }
        onRestore={() =>
          setActionTarget({
            type: "restore",

            workspace,
          })
        }
        onLeave={() =>
          setActionTarget({
            type: "leave",

            workspace,
          })
        }
      />

      <WorkspaceOverviewNavigation />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-9">
          <WorkspaceOverviewMetrics
            projects={projectsQuery.data ?? []}
            members={membersQuery.data ?? []}
            isLoadingProjects={projectsQuery.isLoading}
            isLoadingMembers={membersQuery.isLoading}
            hasProjectsError={projectsQuery.isError}
            hasMembersError={membersQuery.isError}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <WorkspaceProjectsPanel workspace={workspace} search={search} />
            </div>

            <div className="lg:col-span-5">
              <WorkspaceMembersPanel
                workspace={workspace}
                search={search}
                onInvite={() => setInviteOpen(true)}
              />
            </div>
          </div>

          <WorkspaceAccessPanel
            workspace={workspace}
            onInvite={() => setInviteOpen(true)}
            onEdit={() => setEditingWorkspace(workspace)}
          />
        </div>

        <div className="xl:col-span-3">
          <WorkspaceActivityFeed
            workspaceId={workspace._id}
            projects={projectsQuery.data ?? []}
          />
        </div>
      </div>

      <InviteWorkspaceMemberDialog
        workspace={workspace}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      <EditWorkspaceDialog
        workspace={editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
      />

      <WorkspaceActionDialogs
        target={actionTarget}
        onClose={() => setActionTarget(null)}
      />
    </div>
  );
}
