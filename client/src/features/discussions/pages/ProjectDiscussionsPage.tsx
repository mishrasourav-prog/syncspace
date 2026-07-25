import { useEffect, useMemo, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store";
import {
  socket,
  type DiscussionReplySocketPayload,
  type DiscussionSocketPayload,
} from "@/realtime/socket";
import { useWorkspaceQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useProjectQuery } from "@/features/projects/hooks/useProjectQueries";
import { useProjectMembersQuery } from "@/features/project-members/hooks/useProjectMemberQueries";
import { deriveProjectRole } from "@/features/projects/project.permissions";
import { activityQueryKeys } from "@/features/activity/activity.queryKeys";
import { ProjectReadOnlyBanner } from "@/features/projects/components/overview/ProjectReadOnlyBanner";
import { discussionQueryKeys } from "../discussion.queryKeys";
import {
  useDiscussionQuery,
  useDiscussionRepliesQuery,
  useProjectDiscussionsInfiniteQuery,
} from "../hooks/useDiscussionQueries";
import { useMediaQuery } from "../hooks/useMediaQuery";
import {
  canCreateDiscussion,
  canDeleteDiscussion,
  canEditDiscussion,
  canModerateDiscussion,
} from "../discussion.permissions";
import { DiscussionPageHeader } from "../components/DiscussionPageHeader";
import { CreateDiscussionDialog } from "../components/CreateDiscussionDialog";
import { EditDiscussionDialog } from "../components/EditDiscussionDialog";
import { DeleteDiscussionDialog } from "../components/DeleteDiscussionDialog";
import { DiscussionListPanel } from "../components/list/DiscussionListPanel";
import { DiscussionDetailHeader } from "../components/detail/DiscussionDetailHeader";
import { DiscussionAboutRail } from "../components/detail/DiscussionAboutRail";
import { DiscussionParticipantsRail } from "../components/detail/DiscussionParticipantsRail";
import { DiscussionActivityRail } from "../components/detail/DiscussionActivityRail";
import { DiscussionRepliesPanel } from "../components/replies/DiscussionRepliesPanel";
import type {
  Discussion,
  DiscussionListFilter,
} from "../types/discussion.types";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-80 max-w-[60vw]" />
          </div>
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)_300px]">
        <Skeleton className="h-[560px] rounded-xl" />
        <Skeleton className="h-[560px] rounded-xl" />
        <Skeleton className="hidden h-[560px] rounded-xl xl:block" />
      </div>
    </div>
  );
}

function useDebouncedValue(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function parseFilter(value: string | null): DiscussionListFilter {
  if (
    value === "pinned" ||
    value === "mine" ||
    value === "locked"
  ) {
    return value;
  }

  return "all";
}

export function ProjectDiscussionsPage() {
  const { workspaceId, projectId, discussionId } = useParams<{
    workspaceId: string;
    projectId: string;
    discussionId?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);
  const isDesktopMasterDetail = useMediaQuery("(min-width: 1024px)");

  const workspaceQuery = useWorkspaceQuery(workspaceId);
  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);

  const isProjectRouteValid = Boolean(
    workspaceId &&
      projectId &&
      workspaceQuery.isSuccess &&
      projectQuery.isSuccess &&
      projectQuery.data?.workspace === workspaceId
  );

  const searchValue = searchParams.get("q") ?? "";
  const filter = parseFilter(searchParams.get("filter"));
  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300);

  const discussionsQuery = useProjectDiscussionsInfiniteQuery(
    projectId,
    debouncedSearch,
    isProjectRouteValid
  );
  const discussionQuery = useDiscussionQuery(
    projectId,
    discussionId,
    isProjectRouteValid && Boolean(discussionId)
  );
  const repliesQuery = useDiscussionRepliesQuery(
    projectId,
    discussionId,
    isProjectRouteValid &&
      Boolean(discussionId) &&
      discussionQuery.isSuccess &&
      discussionQuery.data?.project === projectId &&
      discussionQuery.data?.workspace === workspaceId
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Discussion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Discussion | null>(null);

  const hasShownProjectInaccessibleToast = useRef(false);
  const hasShownWorkspaceNotFoundToast = useRef(false);
  const hasShownProjectMismatchToast = useRef(false);
  const hasShownDiscussionInaccessibleToast = useRef(false);
  const hasShownDiscussionMismatchToast = useRef(false);

  const basePath = `/workspaces/${workspaceId ?? ""}/projects/${projectId ?? ""}/discussions`;
  const currentSearch = searchParams.toString();
  const basePathWithSearch = `${basePath}${currentSearch ? `?${currentSearch}` : ""}`;

  const loadedDiscussions = useMemo(
    () =>
      discussionsQuery.data?.pages.flatMap((page) => page.discussions) ?? [],
    [discussionsQuery.data]
  );

  const filteredDiscussions = useMemo(() => {
    if (filter === "pinned") {
      return loadedDiscussions.filter((discussion) => discussion.isPinned);
    }

    if (filter === "mine") {
      return loadedDiscussions.filter(
        (discussion) => discussion.author?._id === currentUser?._id
      );
    }

    if (filter === "locked") {
      return loadedDiscussions.filter((discussion) => discussion.isLocked);
    }

    return [...loadedDiscussions].sort(
      (left, right) => Number(right.isPinned) - Number(left.isPinned)
    );
  }, [loadedDiscussions, filter, currentUser?._id]);

  const role = deriveProjectRole(membersQuery.data, currentUser?._id);
  const isProjectInaccessible =
    projectQuery.isError &&
    (projectQuery.error?.status === 403 || projectQuery.error?.status === 404);

  useEffect(() => {
    hasShownProjectInaccessibleToast.current = false;
    hasShownWorkspaceNotFoundToast.current = false;
    hasShownProjectMismatchToast.current = false;
    hasShownDiscussionInaccessibleToast.current = false;
    hasShownDiscussionMismatchToast.current = false;
  }, [workspaceId, projectId, discussionId]);

  useEffect(() => {
    if (
      !isProjectInaccessible ||
      hasShownProjectInaccessibleToast.current
    ) {
      return;
    }

    hasShownProjectInaccessibleToast.current = true;
    toast.error(
      projectQuery.error?.status === 403
        ? "You do not have access to this project."
        : "This project is no longer accessible."
    );
    navigate(
      workspaceId ? `/workspaces/${workspaceId}#projects` : "/dashboard",
      { replace: true }
    );
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
  }, [
    workspaceQuery.isError,
    workspaceQuery.error,
    isProjectInaccessible,
    navigate,
  ]);

  useEffect(() => {
    const project = projectQuery.data;
    if (!workspaceId || !projectQuery.isSuccess || !project) return;

    if (project.workspace === workspaceId) {
      hasShownProjectMismatchToast.current = false;
      return;
    }

    if (hasShownProjectMismatchToast.current) return;
    hasShownProjectMismatchToast.current = true;
    toast.error("This project does not belong to the selected workspace.");
    navigate(`/workspaces/${workspaceId}#projects`, { replace: true });
  }, [workspaceId, projectQuery.isSuccess, projectQuery.data, navigate]);

  const isDiscussionInaccessible =
    Boolean(discussionId) &&
    discussionQuery.isError &&
    (discussionQuery.error?.status === 403 ||
      discussionQuery.error?.status === 404);

  useEffect(() => {
    if (
      !isDiscussionInaccessible ||
      hasShownDiscussionInaccessibleToast.current ||
      !workspaceId ||
      !projectId
    ) {
      return;
    }

    hasShownDiscussionInaccessibleToast.current = true;
    toast.error(
      discussionQuery.error?.status === 403
        ? "You do not have access to this discussion."
        : "This discussion no longer exists."
    );
    navigate(basePathWithSearch, { replace: true });
  }, [
    isDiscussionInaccessible,
    discussionQuery.error,
    navigate,
    workspaceId,
    projectId,
    basePathWithSearch,
  ]);

  useEffect(() => {
    const discussion = discussionQuery.data;
    if (
      !workspaceId ||
      !projectId ||
      !discussionId ||
      !discussionQuery.isSuccess ||
      !discussion
    ) {
      return;
    }

    const mismatch =
      discussion.project !== projectId || discussion.workspace !== workspaceId;

    if (!mismatch) {
      hasShownDiscussionMismatchToast.current = false;
      return;
    }

    if (hasShownDiscussionMismatchToast.current) return;
    hasShownDiscussionMismatchToast.current = true;
    toast.error("This discussion does not belong to the selected project.");
    navigate(basePathWithSearch, { replace: true });
  }, [
    workspaceId,
    projectId,
    discussionId,
    discussionQuery.isSuccess,
    discussionQuery.data,
    navigate,
    basePathWithSearch,
  ]);

  useEffect(() => {
    if (
      !isDesktopMasterDetail ||
      discussionId ||
      !discussionsQuery.isSuccess ||
      filteredDiscussions.length === 0
    ) {
      return;
    }

    navigate(
      `${basePath}/${filteredDiscussions[0]._id}${
        currentSearch ? `?${currentSearch}` : ""
      }`,
      { replace: true }
    );
  }, [
    isDesktopMasterDetail,
    discussionId,
    discussionsQuery.isSuccess,
    filteredDiscussions,
    navigate,
    basePath,
    currentSearch,
  ]);

  useEffect(() => {
    if (!projectId || !isProjectRouteValid) return;

    socket.emit("project:join", projectId, () => undefined);

    return () => {
      socket.emit("project:leave", projectId, () => undefined);
    };
  }, [projectId, isProjectRouteValid]);

  useEffect(() => {
    if (!projectId || !workspaceId || !isProjectRouteValid) return;

    function handleDiscussionChanged(payload: DiscussionSocketPayload) {
      if (
        payload.projectId !== projectId ||
        payload.workspaceId !== workspaceId
      ) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.infinite(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.projectListAll(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: activityQueryKeys.project(projectId),
      });

      if (payload.discussionId !== discussionId) return;

      if (payload.change === "deleted") {
        queryClient.removeQueries({
          queryKey: discussionQueryKeys.detail(projectId, payload.discussionId),
        });
        queryClient.removeQueries({
          queryKey: discussionQueryKeys.replies(projectId, payload.discussionId),
        });

        if (payload.actorId !== currentUser?._id) {
          toast.info("This discussion was deleted by another project member.");
        }

        navigate(basePathWithSearch, { replace: true });
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.detail(projectId, payload.discussionId),
      });
    }

    function handleReplyChanged(payload: DiscussionReplySocketPayload) {
      if (
        payload.projectId !== projectId ||
        payload.workspaceId !== workspaceId
      ) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.infinite(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.projectListAll(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: activityQueryKeys.project(projectId),
      });

      if (payload.discussionId !== discussionId) return;

      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.replies(projectId, payload.discussionId),
      });
      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.detail(projectId, payload.discussionId),
      });
    }

    function handleActivityCreated(payload: {
      workspaceId: string;
      projectId: string;
    }) {
      if (
        payload.projectId !== projectId ||
        payload.workspaceId !== workspaceId
      ) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: activityQueryKeys.project(projectId),
      });
    }

    socket.on("discussion:changed", handleDiscussionChanged);
    socket.on("discussion:reply-changed", handleReplyChanged);
    socket.on("activity:new", handleActivityCreated);

    return () => {
      socket.off("discussion:changed", handleDiscussionChanged);
      socket.off("discussion:reply-changed", handleReplyChanged);
      socket.off("activity:new", handleActivityCreated);
    };
  }, [
    projectId,
    workspaceId,
    discussionId,
    isProjectRouteValid,
    queryClient,
    navigate,
    currentUser?._id,
    basePathWithSearch,
  ]);

  if (!workspaceId || !projectId) return null;

  if (workspaceQuery.isLoading || projectQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (isProjectInaccessible || workspaceQuery.error?.status === 404) {
    return null;
  }

  if (projectQuery.isError || workspaceQuery.isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">
          {projectQuery.error?.message ??
            workspaceQuery.error?.message ??
            "Unable to load this project."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              void workspaceQuery.refetch();
              void projectQuery.refetch();
            }}
          >
            Retry
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/workspaces/${workspaceId}#projects`)}
          >
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const project = projectQuery.data;
  const workspace = workspaceQuery.data;
  if (!project || !workspace || project.workspace !== workspaceId) return null;

  const discussion = discussionQuery.data;
  const replies =
    repliesQuery.data?.pages.flatMap((page) => page.replies) ?? [];
  const canCreate = canCreateDiscussion(project, workspace, role);

  function updateSearch(value: string) {
    const constrainedValue = value.slice(0, 100);
    const next = new URLSearchParams(searchParams);
    if (constrainedValue) next.set("q", constrainedValue);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  function updateFilter(nextFilter: DiscussionListFilter) {
    const next = new URLSearchParams(searchParams);
    if (nextFilter === "all") next.delete("filter");
    else next.set("filter", nextFilter);

    const nextSearch = next.toString();
    navigate(`${basePath}${nextSearch ? `?${nextSearch}` : ""}`, {
      replace: true,
    });
  }

  return (
    <main className="flex h-full min-h-0 flex-col gap-4">
      <ProjectReadOnlyBanner
        project={project}
        workspace={workspace}
        role={role}
      />

      {membersQuery.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <p>
            Permissions could not be verified. Discussion actions are disabled
            until project members reload.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void membersQuery.refetch()}
          >
            Retry permissions
          </Button>
        </div>
      )}

      <DiscussionPageHeader
        filter={filter}
        canCreate={canCreate}
        onFilterChange={updateFilter}
        onCreate={() => setIsCreateOpen(true)}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)_300px]">
        <div className={discussionId ? "hidden min-h-0 lg:flex" : "flex min-h-0"}>
          <DiscussionListPanel
            workspaceId={workspaceId}
            projectId={projectId}
            selectedDiscussionId={discussionId}
            searchValue={searchValue}
            filter={filter}
            discussions={filteredDiscussions}
            loadedCount={loadedDiscussions.length}
            isLoading={discussionsQuery.isLoading}
            isFetching={discussionsQuery.isFetching}
            isError={discussionsQuery.isError}
            errorMessage={discussionsQuery.error?.message}
            hasMore={discussionsQuery.hasNextPage ?? false}
            isFetchingNextPage={discussionsQuery.isFetchingNextPage}
            detailSearch={currentSearch}
            onSearchChange={updateSearch}
            onRetry={() => void discussionsQuery.refetch()}
            onLoadMore={() => void discussionsQuery.fetchNextPage()}
          />
        </div>

        <div
          className={
            discussionId
              ? "min-h-0 space-y-4 overflow-y-auto"
              : "hidden min-h-0 space-y-4 overflow-y-auto lg:block"
          }
        >
          {!discussionId && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/40 text-center">
              <MessageSquare className="h-8 w-8 text-muted" />
              <p className="mt-2 text-body">
                Select a discussion to view its details.
              </p>
            </div>
          )}

          {discussionId && (
            <>
              <button
                type="button"
                onClick={() => navigate(basePathWithSearch)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" /> Back to discussions
              </button>

              {discussionQuery.isLoading && <DetailSkeleton />}

              {discussionQuery.isError && !isDiscussionInaccessible && (
                <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
                  <p className="text-body">
                    {discussionQuery.error?.message ??
                      "Unable to load this discussion."}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => void discussionQuery.refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {discussion &&
                discussion.project === projectId &&
                discussion.workspace === workspaceId && (
                  <>
                    <DiscussionDetailHeader
                      projectId={projectId}
                      discussion={discussion}
                      canEdit={canEditDiscussion(
                        discussion,
                        project,
                        workspace,
                        currentUser?._id
                      )}
                      canDelete={canDeleteDiscussion(
                        discussion,
                        project,
                        workspace,
                        role,
                        currentUser?._id
                      )}
                      canModerate={canModerateDiscussion(
                        project,
                        workspace,
                        role
                      )}
                      onEdit={() => setEditTarget(discussion)}
                      onDelete={() => setDeleteTarget(discussion)}
                    />

                    <DiscussionRepliesPanel
                      projectId={projectId}
                      discussion={discussion}
                      project={project}
                      workspace={workspace}
                      role={role}
                      currentUser={currentUser ?? undefined}
                      repliesQuery={repliesQuery}
                      replies={replies}
                    />

                    <div className="space-y-4 xl:hidden">
                      <DiscussionAboutRail
                        discussion={discussion}
                        project={project}
                      />
                      <DiscussionParticipantsRail
                        discussion={discussion}
                        replies={replies}
                        hasMoreReplies={repliesQuery.hasNextPage ?? false}
                      />
                      <DiscussionActivityRail
                        projectId={projectId}
                        discussionId={discussion._id}
                      />
                    </div>
                  </>
                )}
            </>
          )}
        </div>

        {discussionId &&
          discussion &&
          discussion.project === projectId &&
          discussion.workspace === workspaceId && (
            <aside className="hidden min-h-0 space-y-4 overflow-y-auto xl:block">
              <DiscussionAboutRail
                discussion={discussion}
                project={project}
              />
              <DiscussionParticipantsRail
                discussion={discussion}
                replies={replies}
                hasMoreReplies={repliesQuery.hasNextPage ?? false}
              />
              <DiscussionActivityRail
                projectId={projectId}
                discussionId={discussion._id}
              />
            </aside>
          )}
      </div>

      <CreateDiscussionDialog
        workspaceId={workspaceId}
        projectId={projectId}
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <EditDiscussionDialog
        projectId={projectId}
        discussion={editTarget}
        onClose={() => setEditTarget(null)}
      />
      <DeleteDiscussionDialog
        workspaceId={workspaceId}
        projectId={projectId}
        discussion={deleteTarget}
        returnSearch={currentSearch}
        onClose={() => setDeleteTarget(null)}
      />
    </main>
  );
}
