import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  FileText,
  Plus,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  useAuthStore,
} from "@/app/store";

import {
  Button,
} from "@/components/ui/button";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  useProjectMembersQuery,
} from "@/features/project-members/hooks/useProjectMemberQueries";

import {
  ProjectReadOnlyBanner,
} from "@/features/projects/components/overview/ProjectReadOnlyBanner";

import {
  deriveProjectRole,
} from "@/features/projects/project.permissions";

import {
  useProjectQuery,
} from "@/features/projects/hooks/useProjectQueries";

import {
  useWorkspaceQuery,
} from "@/features/workspaces/hooks/useWorkspaceQueries";

import {
  socket,
} from "@/realtime/socket";

import {
  CreateDocumentDialog,
} from "../components/CreateDocumentDialog";

import {
  DocumentArchiveDialogs,
  type DocumentActionTarget,
} from "../components/DocumentArchiveDialogs";

import {
  DocumentFilterToolbar,
} from "../components/DocumentFilterToolbar";

import {
  DocumentFiltersRail,
} from "../components/DocumentFiltersRail";

import {
  DocumentGridView,
} from "../components/DocumentGridView";

import {
  DocumentListView,
} from "../components/DocumentListView";

import {
  DocumentQuickActionsRail,
} from "../components/DocumentQuickActionsRail";

import {
  DocumentStateTabs,
} from "../components/DocumentStateTabs";

import {
  DocumentSummaryRail,
} from "../components/DocumentSummaryRail";

import {
  DocumentViewSwitcher,
} from "../components/DocumentViewSwitcher";

import {
  RenameDocumentDialog,
} from "../components/RenameDocumentDialog";

import {
  applyClientDocumentFilters,
  computeTabCountLabels,
  countActiveDocumentFilters,
  deduplicateDocuments,
  parseDocumentFilters,
  sortDocuments,
  type DocumentRevisionFilter,
  type DocumentSort,
  type DocumentState,
  type DocumentUpdatedFilter,
  type DocumentView,
} from "../document.filters";

import {
  canArchiveDocument,
  canCreateDocument,
  canRenameDocument,
  canRestoreDocument,
  getDocumentsReadOnlyReason,
} from "../document.permissions";

import {
  documentQueryKeys,
} from "../document.queryKeys";

import {
  useProjectDocumentsInfiniteQuery,
} from "../hooks/useDocumentQueries";

import type {
  ProjectDocument,
} from "../types/document.types";

function ProjectDocumentsSkeleton() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-3.5 w-72" />
      </div>

      <div className="flex flex-wrap gap-2">
        {
          Array.from({
            length:
              4,
          }).map(
            (
              _,
              index
            ) => (
              <Skeleton
                key={
                  index
                }
                className="h-9 w-28"
              />
            )
          )
        }
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-2 xl:col-span-9">
          {
            Array.from({
              length:
                6,
            }).map(
              (
                _,
                index
              ) => (
                <Skeleton
                  key={
                    index
                  }
                  className="h-20 w-full rounded-lg"
                />
              )
            )
          }
        </div>

        <div className="space-y-4 xl:col-span-3">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function QueryErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
      <p className="text-body">
        {
          message
        }
      </p>

      <Button
        variant="secondary"
        onClick={
          onRetry
        }
      >
        Retry
      </Button>
    </div>
  );
}

export function ProjectDocumentsPage() {
  const {
    workspaceId,
    projectId,
  } =
    useParams<{
      workspaceId: string;
      projectId: string;
    }>();

  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();

  const currentUserId =
    useAuthStore(
      (
        state
      ) =>
        state.user?._id
    );

  const [
    now,
  ] =
    useState(
      () =>
        Date.now()
    );

  const workspaceQuery =
    useWorkspaceQuery(
      workspaceId
    );

  const projectQuery =
    useProjectQuery(
      projectId
    );

  const membersQuery =
    useProjectMembersQuery(
      projectId
    );

  const filters =
    useMemo(
      () =>
        parseDocumentFilters(
          searchParams
        ),
      [
        searchParams,
      ]
    );

  const isProjectRouteValid =
    Boolean(
      projectId &&
        workspaceId &&
        projectQuery.isSuccess &&
        workspaceQuery.isSuccess &&
        projectQuery.data
          ?.workspace ===
          workspaceId
    );

  const activeDocsQuery =
    useProjectDocumentsInfiniteQuery(
      projectId,
      false,
      filters.q,
      isProjectRouteValid
    );

  const archivedDocsQuery =
    useProjectDocumentsInfiniteQuery(
      projectId,
      true,
      filters.q,
      isProjectRouteValid
    );

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(
      false
    );

  const [
    renaming,
    setRenaming,
  ] =
    useState<ProjectDocument | null>(
      null
    );

  const [
    actionTarget,
    setActionTarget,
  ] =
    useState<DocumentActionTarget | null>(
      null
    );

  const hasShownInaccessibleToast =
    useRef(
      false
    );

  const hasShownWorkspaceNotFoundToast =
    useRef(
      false
    );

  const hasHandledWorkspaceMismatch =
    useRef(
      false
    );

  const isProjectInaccessible =
    projectQuery.isError &&
    (
      projectQuery.error
        ?.status ===
        403 ||
      projectQuery.error
        ?.status ===
        404
    );

  useEffect(
    () => {
      hasShownInaccessibleToast.current =
        false;
      hasShownWorkspaceNotFoundToast.current =
        false;
      hasHandledWorkspaceMismatch.current =
        false;
    },
    [
      workspaceId,
      projectId,
    ]
  );

  useEffect(
    () => {
      if (
        !projectId ||
        !isProjectRouteValid
      ) {
        return;
      }

      socket.emit(
        "project:join",
        projectId,
        () => undefined
      );

      const handleDocumentChanged =
        (
          payload: {
            projectId: string;
          }
        ): void => {
          if (
            payload.projectId !==
            projectId
          ) {
            return;
          }

          void queryClient.invalidateQueries({
            queryKey:
              documentQueryKeys.project(
                projectId
              ),
          });
        };

      socket.on(
        "document:created",
        handleDocumentChanged
      );
      socket.on(
        "document:updated",
        handleDocumentChanged
      );
      socket.on(
        "document:archived",
        handleDocumentChanged
      );
      socket.on(
        "document:restored",
        handleDocumentChanged
      );

      return () => {
        socket.off(
          "document:created",
          handleDocumentChanged
        );
        socket.off(
          "document:updated",
          handleDocumentChanged
        );
        socket.off(
          "document:archived",
          handleDocumentChanged
        );
        socket.off(
          "document:restored",
          handleDocumentChanged
        );

        socket.emit(
          "project:leave",
          projectId,
          () => undefined
        );
      };
    },
    [
      projectId,
      isProjectRouteValid,
      queryClient,
    ]
  );

  useEffect(
    () => {
      if (
        !isProjectInaccessible ||
        hasShownInaccessibleToast.current
      ) {
        return;
      }

      hasShownInaccessibleToast.current =
        true;

      toast.error(
        projectQuery.error
          ?.status ===
          403
          ? "You do not have access to this project."
          : "This project is no longer accessible."
      );

      navigate(
        workspaceId
          ? `/workspaces/${workspaceId}#projects`
          : "/dashboard",
        {
          replace:
            true,
        }
      );
    },
    [
      isProjectInaccessible,
      projectQuery.error,
      navigate,
      workspaceId,
    ]
  );

  useEffect(
    () => {
      if (
        !workspaceQuery.isError ||
        workspaceQuery.error
          ?.status !==
          404 ||
        isProjectInaccessible ||
        hasShownWorkspaceNotFoundToast.current
      ) {
        return;
      }

      hasShownWorkspaceNotFoundToast.current =
        true;

      toast.error(
        "This workspace is no longer accessible."
      );

      navigate(
        "/dashboard",
        {
          replace:
            true,
        }
      );
    },
    [
      workspaceQuery.isError,
      workspaceQuery.error,
      isProjectInaccessible,
      navigate,
    ]
  );

  useEffect(
    () => {
      const project =
        projectQuery.data;

      if (
        !workspaceId ||
        !projectQuery.isSuccess ||
        !project
      ) {
        return;
      }

      if (
        project.workspace ===
        workspaceId
      ) {
        hasHandledWorkspaceMismatch.current =
          false;
        return;
      }

      if (
        hasHandledWorkspaceMismatch.current
      ) {
        return;
      }

      hasHandledWorkspaceMismatch.current =
        true;

      toast.error(
        "This project does not belong to the selected workspace."
      );

      navigate(
        `/workspaces/${workspaceId}#projects`,
        {
          replace:
            true,
        }
      );
    },
    [
      workspaceId,
      projectQuery.isSuccess,
      projectQuery.data,
      navigate,
    ]
  );

  function updateParams(
    mutator: (
      next: URLSearchParams
    ) => void
  ): void {
    const next =
      new URLSearchParams(
        searchParams
      );

    mutator(
      next
    );

    setSearchParams(
      next,
      {
        replace:
          true,
      }
    );
  }

  function setSearch(
    value: string
  ): void {
    updateParams(
      (
        next
      ) => {
        if (
          value
        ) {
          next.set(
            "q",
            value
          );
        } else {
          next.delete(
            "q"
          );
        }
      }
    );
  }

  function setView(
    view: DocumentView
  ): void {
    updateParams(
      (
        next
      ) => {
        if (
          view ===
          "list"
        ) {
          next.delete(
            "view"
          );
        } else {
          next.set(
            "view",
            view
          );
        }
      }
    );
  }

  function setStateFilter(
    state: DocumentState
  ): void {
    updateParams(
      (
        next
      ) => {
        if (
          state ===
          "all"
        ) {
          next.delete(
            "state"
          );
        } else {
          next.set(
            "state",
            state
          );
        }
      }
    );
  }

  function setSort(
    sort: DocumentSort
  ): void {
    updateParams(
      (
        next
      ) => {
        if (
          sort ===
          "newest"
        ) {
          next.delete(
            "sort"
          );
        } else {
          next.set(
            "sort",
            sort
          );
        }
      }
    );
  }

  function setCreator(
    creator: string | null
  ): void {
    updateParams(
      (
        next
      ) => {
        if (
          creator
        ) {
          next.set(
            "creator",
            creator
          );
        } else {
          next.delete(
            "creator"
          );
        }
      }
    );
  }

  function setUpdated(
    updated: DocumentUpdatedFilter | null
  ): void {
    updateParams(
      (
        next
      ) => {
        if (
          updated
        ) {
          next.set(
            "updated",
            updated
          );
        } else {
          next.delete(
            "updated"
          );
        }
      }
    );
  }

  function setRevision(
    revision: DocumentRevisionFilter
  ): void {
    updateParams(
      (
        next
      ) => {
        if (
          revision ===
          "any"
        ) {
          next.delete(
            "revision"
          );
        } else {
          next.set(
            "revision",
            revision
          );
        }
      }
    );
  }

  function clearAllFilters(): void {
    updateParams(
      (
        next
      ) => {
        next.delete(
          "q"
        );
        next.delete(
          "state"
        );
        next.delete(
          "sort"
        );
        next.delete(
          "creator"
        );
        next.delete(
          "updated"
        );
        next.delete(
          "revision"
        );
      }
    );
  }

  if (
    !workspaceId ||
    !projectId
  ) {
    return null;
  }

  if (
    projectQuery.isLoading ||
    workspaceQuery.isLoading
  ) {
    return (
      <ProjectDocumentsSkeleton />
    );
  }

  if (
    projectQuery.isError
  ) {
    if (
      projectQuery.error
        ?.status ===
        403 ||
      projectQuery.error
        ?.status ===
        404
    ) {
      return null;
    }

    return (
      <QueryErrorPanel
        message={
          projectQuery.error
            ?.message ??
          "Unable to load this project."
        }
        onRetry={
          () => {
            void projectQuery.refetch();
          }
        }
      />
    );
  }

  if (
    workspaceQuery.isError
  ) {
    if (
      workspaceQuery.error
        ?.status ===
        404
    ) {
      return null;
    }

    return (
      <QueryErrorPanel
        message={
          workspaceQuery.error
            ?.message ??
          "Unable to load this project's workspace."
        }
        onRetry={
          () => {
            void workspaceQuery.refetch();
          }
        }
      />
    );
  }

  const project =
    projectQuery.data;

  const workspace =
    workspaceQuery.data;

  if (
    !project ||
    !workspace
  ) {
    return null;
  }

  const members =
    membersQuery.data ??
    [];

  const role =
    deriveProjectRole(
      members,
      currentUserId
    );

  const permissionsAvailable =
    !membersQuery.isLoading &&
    !membersQuery.isError;

  const baseReadOnlyReason =
    getDocumentsReadOnlyReason(
      project,
      workspace
    );

  const permissionReason =
    membersQuery.isError
      ? "Document permissions could not be verified. Retry the member request."
      : membersQuery.isLoading
        ? "Checking document permissions."
        : null;

  const readOnlyReason =
    baseReadOnlyReason ??
    permissionReason;

  const canCreate =
    permissionsAvailable &&
    canCreateDocument(
      project,
      workspace,
      role
    );

  const activeDocuments =
    deduplicateDocuments(
      activeDocsQuery.data
        ?.pages.flatMap(
          (
            page
          ) =>
            page.documents
        ) ??
        []
    );

  const archivedDocuments =
    deduplicateDocuments(
      archivedDocsQuery.data
        ?.pages.flatMap(
          (
            page
          ) =>
            page.documents
        ) ??
        []
    );

  const activeHasMore =
    activeDocsQuery.hasNextPage ??
    false;

  const archivedHasMore =
    archivedDocsQuery.hasNextPage ??
    false;

  const activeUnavailable =
    activeDocsQuery.isError;

  const archivedUnavailable =
    archivedDocsQuery.isError;

  const tabCounts =
    computeTabCountLabels({
      activeLoadedCount:
        activeDocuments.length,
      activeHasMore,
      activeLoading:
        activeDocsQuery.isLoading,
      activeUnavailable,
      archivedLoadedCount:
        archivedDocuments.length,
      archivedHasMore,
      archivedLoading:
        archivedDocsQuery.isLoading,
      archivedUnavailable,
    });

  const bucketDocuments =
    filters.state ===
    "active"
      ? activeDocuments
      : filters.state ===
          "archived"
        ? archivedDocuments
        : deduplicateDocuments([
            ...activeDocuments,
            ...archivedDocuments,
          ]);

  const filteredDocuments =
    sortDocuments(
      applyClientDocumentFilters(
        bucketDocuments,
        filters,
        now
      ),
      filters.sort
    );

  const activeFilterCount =
    countActiveDocumentFilters(
      filters
    );

  const hasAnyFilter =
    Boolean(
      filters.q.trim()
    ) ||
    activeFilterCount >
      0 ||
    filters.sort !==
      "newest";

  const selectedQueryLoading =
    filters.state ===
    "active"
      ? activeDocsQuery.isLoading
      : filters.state ===
          "archived"
        ? archivedDocsQuery.isLoading
        : activeDocsQuery.isLoading &&
          archivedDocsQuery.isLoading;

  const selectedQueryUnavailable =
    filters.state ===
    "active"
      ? activeUnavailable
      : filters.state ===
          "archived"
        ? archivedUnavailable
        : activeUnavailable &&
          archivedUnavailable;

  const partialDataWarning =
    filters.state ===
      "all" &&
    activeUnavailable !==
      archivedUnavailable;

  const selectedErrorMessage =
    filters.state ===
    "active"
      ? activeDocsQuery.error
          ?.message
      : filters.state ===
          "archived"
        ? archivedDocsQuery.error
            ?.message
        : activeDocsQuery.error
            ?.message ??
          archivedDocsQuery.error
            ?.message;

  const canLoadMore =
    filters.state ===
    "active"
      ? activeHasMore &&
        !activeUnavailable
      : filters.state ===
          "archived"
        ? archivedHasMore &&
          !archivedUnavailable
        : (
            activeHasMore &&
            !activeUnavailable
          ) ||
          (
            archivedHasMore &&
            !archivedUnavailable
          );

  const isLoadingMore =
    (
      filters.state !==
        "archived" &&
      activeDocsQuery.isFetchingNextPage
    ) ||
    (
      filters.state !==
        "active" &&
      archivedDocsQuery.isFetchingNextPage
    );

  function handleLoadMore(): void {
    if (
      filters.state !==
        "archived" &&
      activeHasMore &&
      !activeUnavailable
    ) {
      void activeDocsQuery.fetchNextPage();
    }

    if (
      filters.state !==
        "active" &&
      archivedHasMore &&
      !archivedUnavailable
    ) {
      void archivedDocsQuery.fetchNextPage();
    }
  }

  function handleRefresh(): void {
    void activeDocsQuery.refetch();
    void archivedDocsQuery.refetch();
  }

  const isRefreshing =
    activeDocsQuery.isFetching ||
    archivedDocsQuery.isFetching;

  const allLoadedDocuments =
    deduplicateDocuments([
      ...activeDocuments,
      ...archivedDocuments,
    ]);

  const mostRecentlyUpdated =
    sortDocuments(
      allLoadedDocuments,
      "updated"
    )[0] ??
    null;

  const sevenDaysAgo =
    now -
    7 *
      86_400_000;

  const updatedInLastSevenDays =
    allLoadedDocuments.filter(
      (
        document
      ) =>
        new Date(
          document.updatedAt
        ).getTime() >=
        sevenDaysAgo
    ).length;

  const hasAdvancedFilters =
    Boolean(
      filters.creator ||
        filters.updated ||
        filters.revision !==
          "any"
    );

  const emptyMessage =
    filters.q.trim()
      ? "No document titles match your search."
      : hasAdvancedFilters
        ? "No loaded documents match these filters."
        : filters.state ===
            "archived"
          ? "No archived documents."
          : filters.state ===
              "active"
            ? "No active documents yet."
            : "No documents yet.";

  return (
    <main className="space-y-5">
      <ProjectReadOnlyBanner
        project={
          project
        }
        workspace={
          workspace
        }
        role={
          role
        }
      />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileText className="h-5 w-5" />
          </span>

          <div>
            <h1 className="text-h1 text-foreground">
              Documents
            </h1>

            <p className="mt-0.5 text-caption">
              Store, organize, and collaborate on project documents.
            </p>
          </div>
        </div>

        <Button
          onClick={
            () =>
              setCreateOpen(
                true
              )
          }
          disabled={
            !canCreate
          }
          title={
            !canCreate
              ? readOnlyReason ??
                "You do not have permission to create documents."
              : undefined
          }
        >
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </header>

      {
        membersQuery.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
            <span>
              Document permissions and creator filters are temporarily unavailable.
            </span>

            <button
              type="button"
              onClick={
                () => {
                  void membersQuery.refetch();
                }
              }
              className="font-medium text-primary hover:text-primary/80"
            >
              Retry
            </button>
          </div>
        )
      }

      <DocumentStateTabs
        state={
          filters.state
        }
        counts={
          tabCounts
        }
        onChange={
          setStateFilter
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DocumentFilterToolbar
          search={
            filters.q
          }
          sort={
            filters.sort
          }
          activeFilterCount={
            activeFilterCount
          }
          onSearchChange={
            setSearch
          }
          onSortChange={
            setSort
          }
          onClear={
            clearAllFilters
          }
        />

        <DocumentViewSwitcher
          view={
            filters.view
          }
          onChange={
            setView
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="min-w-0 space-y-4 xl:col-span-9">
          {
            selectedQueryLoading && (
              <div className="space-y-2">
                {
                  Array.from({
                    length:
                      6,
                  }).map(
                    (
                      _,
                      index
                    ) => (
                      <Skeleton
                        key={
                          index
                        }
                        className="h-20 w-full rounded-lg"
                      />
                    )
                  )
                }
              </div>
            )
          }

          {
            !selectedQueryLoading &&
              selectedQueryUnavailable && (
                <QueryErrorPanel
                  message={
                    selectedErrorMessage ??
                    "Unable to load documents."
                  }
                  onRetry={
                    handleRefresh
                  }
                />
              )
          }

          {
            !selectedQueryLoading &&
              !selectedQueryUnavailable &&
              partialDataWarning && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
                  <span>
                    Only part of the document collection is available. Loaded documents are shown below.
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Retry missing data
                  </button>
                </div>
              )
          }

          {
            !selectedQueryLoading &&
              !selectedQueryUnavailable &&
              filters.view ===
                "list" && (
                <DocumentListView
                  documents={
                    filteredDocuments
                  }
                  emptyMessage={
                    emptyMessage
                  }
                  canRename={
                    (
                      document
                    ) =>
                      permissionsAvailable &&
                      canRenameDocument(
                        document,
                        project,
                        workspace,
                        role
                      )
                  }
                  canArchive={
                    (
                      document
                    ) =>
                      permissionsAvailable &&
                      canArchiveDocument(
                        document,
                        project,
                        workspace,
                        role,
                        currentUserId
                      )
                  }
                  canRestore={
                    (
                      document
                    ) =>
                      permissionsAvailable &&
                      canRestoreDocument(
                        document,
                        project,
                        workspace,
                        role,
                        currentUserId
                      )
                  }
                  onRename={
                    setRenaming
                  }
                  onArchive={
                    (
                      document
                    ) =>
                      setActionTarget({
                        type:
                          "archive",
                        document,
                      })
                  }
                  onRestore={
                    (
                      document
                    ) =>
                      setActionTarget({
                        type:
                          "restore",
                        document,
                      })
                  }
                />
              )
          }

          {
            !selectedQueryLoading &&
              !selectedQueryUnavailable &&
              filters.view ===
                "grid" && (
                <DocumentGridView
                  documents={
                    filteredDocuments
                  }
                  emptyMessage={
                    emptyMessage
                  }
                  canRename={
                    (
                      document
                    ) =>
                      permissionsAvailable &&
                      canRenameDocument(
                        document,
                        project,
                        workspace,
                        role
                      )
                  }
                  canArchive={
                    (
                      document
                    ) =>
                      permissionsAvailable &&
                      canArchiveDocument(
                        document,
                        project,
                        workspace,
                        role,
                        currentUserId
                      )
                  }
                  canRestore={
                    (
                      document
                    ) =>
                      permissionsAvailable &&
                      canRestoreDocument(
                        document,
                        project,
                        workspace,
                        role,
                        currentUserId
                      )
                  }
                  onRename={
                    setRenaming
                  }
                  onArchive={
                    (
                      document
                    ) =>
                      setActionTarget({
                        type:
                          "archive",
                        document,
                      })
                  }
                  onRestore={
                    (
                      document
                    ) =>
                      setActionTarget({
                        type:
                          "restore",
                        document,
                      })
                  }
                />
              )
          }

          {
            !selectedQueryLoading &&
              !selectedQueryUnavailable &&
              canLoadMore && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <p className="text-[11px] text-muted">
                    Showing {filteredDocuments.length} loaded document{filteredDocuments.length === 1 ? "" : "s"}. More documents are available.
                  </p>

                  <Button
                    variant="secondary"
                    onClick={
                      handleLoadMore
                    }
                    disabled={
                      isLoadingMore
                    }
                    aria-live="polite"
                  >
                    {
                      isLoadingMore
                        ? "Loading..."
                        : "Load more documents"
                    }
                  </Button>
                </div>
              )
          }
        </section>

        <aside className="space-y-4 xl:sticky xl:top-[5.5rem] xl:col-span-3 xl:self-start">
          <DocumentFiltersRail
            filters={
              filters
            }
            members={
              members
            }
            membersLoading={
              membersQuery.isLoading
            }
            membersUnavailable={
              membersQuery.isError
            }
            activeFilterCount={
              activeFilterCount
            }
            onStateChange={
              setStateFilter
            }
            onCreatorChange={
              setCreator
            }
            onUpdatedChange={
              setUpdated
            }
            onRevisionChange={
              setRevision
            }
            onRetryMembers={
              () => {
                void membersQuery.refetch();
              }
            }
            onClear={
              clearAllFilters
            }
          />

          <DocumentSummaryRail
            activeLoadedCount={
              activeDocuments.length
            }
            activeHasMore={
              activeHasMore
            }
            activeLoading={
              activeDocsQuery.isLoading
            }
            activeUnavailable={
              activeUnavailable
            }
            archivedLoadedCount={
              archivedDocuments.length
            }
            archivedHasMore={
              archivedHasMore
            }
            archivedLoading={
              archivedDocsQuery.isLoading
            }
            archivedUnavailable={
              archivedUnavailable
            }
            mostRecentlyUpdated={
              mostRecentlyUpdated
            }
            updatedInLastSevenDays={
              updatedInLastSevenDays
            }
          />

          <DocumentQuickActionsRail
            canCreate={
              canCreate
            }
            readOnlyReason={
              readOnlyReason
            }
            currentState={
              filters.state
            }
            hasActiveFilters={
              hasAnyFilter
            }
            onCreate={
              () =>
                setCreateOpen(
                  true
                )
            }
            onStateChange={
              setStateFilter
            }
            onClear={
              clearAllFilters
            }
            onRefresh={
              handleRefresh
            }
            isRefreshing={
              isRefreshing
            }
          />
        </aside>
      </div>

      {
        createOpen && (
          <CreateDocumentDialog
            key="create-document"
            projectId={
              project._id
            }
            onClose={
              () =>
                setCreateOpen(
                  false
                )
            }
          />
        )
      }

      {
        renaming && (
          <RenameDocumentDialog
            key={
              renaming._id
            }
            projectId={
              project._id
            }
            document={
              renaming
            }
            onClose={
              () =>
                setRenaming(
                  null
                )
            }
          />
        )
      }

      {
        actionTarget && (
          <DocumentArchiveDialogs
            target={
              actionTarget
            }
            projectId={
              project._id
            }
            onClose={
              () =>
                setActionTarget(
                  null
                )
            }
          />
        )
      }
    </main>
  );
}
