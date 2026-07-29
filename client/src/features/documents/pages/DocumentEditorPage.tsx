import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store";
import { socket, type DocumentSocketPayload } from "@/realtime/socket";
import { useWorkspaceQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useProjectQuery } from "@/features/projects/hooks/useProjectQueries";
import { useProjectMembersQuery } from "@/features/project-members/hooks/useProjectMemberQueries";
import { canInviteProjectMember, deriveProjectRole } from "@/features/projects/project.permissions";
import { InviteProjectMemberDialog } from "@/features/project-invitations/components/InviteProjectMemberDialog";
import { activityQueryKeys } from "@/features/activity/activity.queryKeys";
import type { Project } from "@/features/projects/types/project.types";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { ProjectMember, ProjectRole } from "@/features/project-members/types/projectMember.types";

import { getDocumentByIdRequest } from "../api/document.api";
import { useDocumentQuery } from "../hooks/useDocumentQueries";
import {
  useArchiveDocumentMutation,
  useCreateDocumentMutation,
  useRestoreDocumentMutation,
  useUpdateDocumentMutation,
} from "../hooks/useDocumentMutations";
import { useDocumentEditorDraft } from "../hooks/useDocumentEditorDraft";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { documentQueryKeys } from "../document.queryKeys";
import {
  canArchiveDocument,
  canCreateDocument,
  canEditDocumentContent,
  canRestoreDocument,
  getDocumentEditorReadOnlyBanner,
} from "../document.permissions";
import {
  EMPTY_DOCUMENT_CONTENT,
  areDocumentContentsEqual,
  countWordsAndCharacters,
  normalizeDocumentContent,
} from "../document.content";
import {
  downloadDocumentAsHtml,
  downloadDocumentAsJson,
  downloadDocumentAsPdf,
  downloadLocalDraft,
} from "../document.exports";
import {
  clearDocumentDraft,
  readDocumentDraft,
  writeDocumentDraft,
} from "../document.draftStorage";
import type { ProjectDocument, UpdateDocumentPayload } from "../types/document.types";

import { DocumentEditorHeader, type DocumentSaveState } from "../components/editor/DocumentEditorHeader";
import { DocumentEditorReadOnlyBanner } from "../components/editor/DocumentEditorReadOnlyBanner";
import { DocumentEditorToolbar } from "../components/editor/DocumentEditorToolbar";
import { DocumentEditor } from "../components/editor/DocumentEditor";
import { DocumentEditorStatusBar } from "../components/editor/DocumentEditorStatusBar";
import { DocumentConflictDialog } from "../components/editor/DocumentConflictDialog";
import { DocumentUnsavedChangesDialog } from "../components/editor/DocumentUnsavedChangesDialog";
import { DocumentLegacyContentDialog } from "../components/editor/DocumentLegacyContentDialog";
import { DocumentInfoPanel } from "../components/detail/DocumentInfoPanel";
import { DocumentProjectMembersPanel } from "../components/detail/DocumentProjectMembersPanel";
import { DocumentActivityPanel } from "../components/detail/DocumentActivityPanel";
import { DocumentActionsPanel } from "../components/detail/DocumentActionsPanel";

function DocumentEditorSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-56" />
      <div className="rounded-xl border border-border bg-surface/60 p-5">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/3" />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Skeleton className="h-[60vh] w-full rounded-xl" />
        </div>
        <div className="space-y-4 xl:col-span-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

interface DocumentEditorWorkspaceProps {
  workspaceId: string;
  projectId: string;
  document: ProjectDocument;
  project: Project;
  workspace: WorkspaceSummary;
  members: ProjectMember[];
  membersLoading: boolean;
  membersError: boolean;
  onRetryMembers: () => void;
  role: ProjectRole | undefined;
  currentUserId: string | undefined;
}

function DocumentEditorWorkspace({
  workspaceId,
  projectId,
  document,
  project,
  workspace,
  members,
  membersLoading,
  membersError,
  onRetryMembers,
  role,
  currentUserId,
}: DocumentEditorWorkspaceProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canEditBase = canEditDocumentContent(document, project, workspace, role);

  const normalized = useMemo(
    () => normalizeDocumentContent(document.content),
    [document.content]
  );

  const recoveredDraft = useMemo(
    () =>
      canEditBase
        ? readDocumentDraft(currentUserId, document._id, document.revision)
        : null,
    [canEditBase, currentUserId, document._id, document.revision]
  );

  const initialEditorContent = recoveredDraft?.content ?? normalized.editorContent;
  const draft = useDocumentEditorDraft(
    document,
    normalized.editorContent,
    recoveredDraft?.title
  );

  const [mode, setMode] = useState<"editing" | "preview">("editing");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [hasRemoteUpdate, setHasRemoteUpdate] = useState(false);
  const [isReloadingLatest, setIsReloadingLatest] = useState(false);
  const [reloadError, setReloadError] = useState<string | null>(null);
  const [isLegacyDialogOpen, setIsLegacyDialogOpen] = useState(false);
  const [hasConfirmedLegacyConversion, setHasConfirmedLegacyConversion] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasRecoveredLocalDraft, setHasRecoveredLocalDraft] = useState(
    () => Boolean(recoveredDraft)
  );
  const [, setRenderTick] = useState(0);

  const updateMutation = useUpdateDocumentMutation(projectId);
  const archiveMutation = useArchiveDocumentMutation(projectId);
  const restoreMutation = useRestoreDocumentMutation(projectId);
  const createMutation = useCreateDocumentMutation(projectId);

  const isLegacyBlocked = normalized.isUnsupportedLegacyContent && !hasConfirmedLegacyConversion;
  const canWrite = canEditBase && !isLegacyBlocked && !hasRemoteUpdate;
  const editorEditable = canWrite && !updateMutation.isPending && mode === "editing";

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: false,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        }),
        Placeholder.configure({ placeholder: "Start writing…" }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Table.configure({ resizable: false }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: initialEditorContent,
      editable: editorEditable,
      onUpdate: () => setRenderTick((tick) => tick + 1),
      onSelectionUpdate: () => setRenderTick((tick) => tick + 1),
    },
    // The parent is also keyed by document ID, so editor state never leaks
    // from one document route into another.
    [document._id]
  );

  useEffect(() => {
    editor?.setEditable(editorEditable);
  }, [editor, editorEditable]);

  const liveContent = editor ? editor.getJSON() : normalized.editorContent;
  const isDirty = hasConfirmedLegacyConversion || draft.isDirty(liveContent);

  const isDirtyRef = useRef(isDirty);
  const hasRemoteUpdateRef = useRef(hasRemoteUpdate);
  const draftTitleRef = useRef(draft.draftTitle);

  useEffect(() => {
    isDirtyRef.current = isDirty;
    hasRemoteUpdateRef.current = hasRemoteUpdate;
    draftTitleRef.current = draft.draftTitle;
  }, [draft.draftTitle, hasRemoteUpdate, isDirty]);

  useEffect(() => {
    if (!currentUserId || !editor) return;

    if (!isDirty) {
      clearDocumentDraft(currentUserId, document._id);
      return;
    }

    writeDocumentDraft({
      documentId: document._id,
      userId: currentUserId,
      baseRevision: draft.snapshot.revision,
      title: draft.draftTitle,
      content: editor.getJSON(),
      updatedAt: new Date().toISOString(),
    });
  }, [
    currentUserId,
    document._id,
    draft.draftTitle,
    draft.snapshot.revision,
    editor,
    isDirty,
    liveContent,
  ]);

  const unsavedGuard = useUnsavedChangesGuard(isDirty);

  const canArchive = canArchiveDocument(document, project, workspace, role, currentUserId);
  const canRestore = canRestoreDocument(document, project, workspace, role, currentUserId);
  const canDuplicate = canCreateDocument(project, workspace, role);
  const canInvite = canInviteProjectMember(project, workspace, role);
  const canDownloadHtml = !normalized.isUnsupportedLegacyContent || hasConfirmedLegacyConversion;
  const canPersistDraft = canWrite && isDirty && !updateMutation.isPending;

  const readOnlyBanner = getDocumentEditorReadOnlyBanner(document, project, workspace);
  const { words, characters } = countWordsAndCharacters(editor?.getText() ?? "");

  const acceptLatestDocument = useCallback(
    (latest: ProjectDocument): void => {
      const latestNormalized = normalizeDocumentContent(latest.content);

      queryClient.setQueryData(documentQueryKeys.detail(projectId, latest._id), latest);
      draft.acceptServerDocument(latest, latestNormalized.editorContent);
      editor?.commands.setContent(latestNormalized.editorContent);

      setHasConfirmedLegacyConversion(false);
      setHasRemoteUpdate(false);
      setIsConflictOpen(false);
      setSaveError(null);
      setReloadError(null);
      setHasRecoveredLocalDraft(false);
      clearDocumentDraft(currentUserId, latest._id);
    },
    [currentUserId, draft, editor, projectId, queryClient]
  );

  function persistSave(onSaved?: () => void) {
    if (!editor || updateMutation.isPending) return;

    if (hasRemoteUpdate) {
      setIsConflictOpen(true);
      return;
    }

    if (!canWrite) return;

    // Capture the exact snapshot submitted to the server. The editor is
    // temporarily made read-only while the mutation is pending, and the
    // success handler still compares against the latest live values so even
    // an input event that lands before React re-renders cannot be lost.
    const submittedContent = editor.getJSON();
    const submittedTitle = draft.draftTitle.trim() || "Untitled document";
    const payload: UpdateDocumentPayload = { expectedRevision: draft.snapshot.revision };

    if (draft.isTitleDirty) payload.title = submittedTitle;
    if (hasConfirmedLegacyConversion || draft.isContentDirty(submittedContent)) {
      payload.content = submittedContent;
    }

    if (payload.title === undefined && payload.content === undefined) {
      onSaved?.();
      return;
    }

    setSaveError(null);

    updateMutation.mutate(
      { documentId: document._id, payload },
      {
        onSuccess: (updated) => {
          const acceptedContent = normalizeDocumentContent(updated.content).editorContent;
          const latestTitle = draftTitleRef.current.trim() || "Untitled document";
          const latestContent = editor.getJSON();
          const hasNewerLocalEdits =
            latestTitle !== submittedTitle ||
            !areDocumentContentsEqual(latestContent, submittedContent);

          if (hasNewerLocalEdits) {
            // Advance the revision baseline without replacing the visible
            // draft. The newer title/content remains dirty and can be saved
            // safely against the freshly returned revision.
            draft.acceptSavedSnapshot(updated, acceptedContent);
            toast.success("Saved the submitted changes. Newer edits remain unsaved.");
          } else {
            // No newer input exists, so it is safe to accept any normalized
            // title/content returned by the server and complete navigation.
            draft.acceptServerDocument(updated, acceptedContent);
            editor.commands.setContent(acceptedContent, false);
            clearDocumentDraft(currentUserId, document._id);
            setHasRecoveredLocalDraft(false);
            toast.success("Document saved.");
          }

          setHasConfirmedLegacyConversion(false);
          setHasRemoteUpdate(false);
          setIsConflictOpen(false);
          setReloadError(null);
          setSaveError(null);

          if (!hasNewerLocalEdits) onSaved?.();
        },
        onError: (error) => {
          if (error.status === 409) {
            setHasRemoteUpdate(true);
            setIsConflictOpen(true);
            setReloadError(null);
            return;
          }

          const message = error.message ?? "Unable to save this document.";
          setSaveError(message);
          toast.error(message);
        },
      }
    );
  }

  function handleSave() {
    persistSave();
  }

  function handleSaveAndReturn() {
    const destination = `/workspaces/${workspaceId}/projects/${projectId}/documents`;

    if (!isDirty) {
      navigate(destination);
      return;
    }

    persistSave(() => unsavedGuard.navigateAfterSave(destination));
  }

  async function handleReloadLatest() {
    setIsReloadingLatest(true);
    setReloadError(null);

    try {
      const latest = await getDocumentByIdRequest(document._id);
      acceptLatestDocument(latest);
      toast.info("Loaded the latest server revision. Your previous local draft was discarded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reload the latest document revision.";
      setReloadError(message);
    } finally {
      setIsReloadingLatest(false);
    }
  }

  function handleDownloadDraft() {
    downloadLocalDraft(document._id, draft.draftTitle, liveContent, draft.snapshot.revision);
  }

  function handleArchive() {
    if (isDirty) {
      toast.error("Save or discard your changes before archiving this document.");
      return;
    }

    archiveMutation.mutate(document._id, {
      onSuccess: () => toast.success("Document archived."),
      onError: (error) => toast.error(error.message ?? "Unable to archive this document."),
    });
  }

  function handleRestore() {
    restoreMutation.mutate(document._id, {
      onSuccess: () => toast.success("Document restored."),
      onError: (error) => toast.error(error.message ?? "Unable to restore this document."),
    });
  }

  function handleDuplicate() {
    if (!canDuplicate || createMutation.isPending || updateMutation.isPending) return;

    const content =
      normalized.isUnsupportedLegacyContent && !hasConfirmedLegacyConversion ? document.content : liveContent;

    createMutation.mutate(
      { title: `${draft.draftTitle.trim() || "Untitled document"} (copy)`, content },
      {
        onSuccess: (created) => {
          toast.success("Document duplicated.");
          unsavedGuard.guardedNavigate(`/workspaces/${workspaceId}/projects/${projectId}/documents/${created._id}`);
        },
        onError: (error) => toast.error(error.message ?? "Unable to duplicate this document."),
      }
    );
  }

  function handleDownloadHtml() {
    if (!editor || !canDownloadHtml) {
      toast.error("HTML export is unavailable until this legacy document is converted.");
      return;
    }

    downloadDocumentAsHtml(draft.draftTitle, editor.getHTML());
  }

  function handleDownloadPdf() {
    if (!editor || !canDownloadHtml) {
      toast.error("PDF export is unavailable until this legacy document is converted.");
      return;
    }

    const opened = downloadDocumentAsPdf(draft.draftTitle, editor.getHTML());
    if (!opened) {
      toast.error("The PDF window was blocked. Allow pop-ups for SyncSpace and try again.");
      return;
    }

    toast.info("Use the browser print dialog and choose Save as PDF.");
  }

  function handleDownloadJson() {
    const content =
      normalized.isUnsupportedLegacyContent && !hasConfirmedLegacyConversion ? document.content : liveContent;
    downloadDocumentAsJson(document, draft.draftTitle, content);
  }

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(document._id);
      toast.success("Document ID copied.");
    } catch {
      toast.error("Unable to copy to the clipboard.");
    }
  }

  async function handleRefresh() {
    if (isDirty) {
      toast.error("Save or discard your changes before refreshing.");
      return;
    }

    setIsRefreshing(true);
    try {
      const latest = await getDocumentByIdRequest(document._id);
      acceptLatestDocument(latest);
      toast.success("Document refreshed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to refresh this document.");
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleDiscardRecoveredDraft() {
    clearDocumentDraft(currentUserId, document._id);
    draft.acceptServerDocument(document, normalized.editorContent);
    editor?.commands.setContent(normalized.editorContent, false);
    setHasRecoveredLocalDraft(false);
    setHasConfirmedLegacyConversion(false);
    setSaveError(null);
    toast.info("Recovered browser draft discarded.");
  }

  function handleDiscardAndLeave() {
    clearDocumentDraft(currentUserId, document._id);
    setHasRecoveredLocalDraft(false);
    unsavedGuard.confirmDiscardAndLeave();
  }

  function handleBackToDocuments() {
    unsavedGuard.guardedNavigate(`/workspaces/${workspaceId}/projects/${projectId}/documents`);
  }

  function handleShowMembers() {
    unsavedGuard.guardedNavigate(`/workspaces/${workspaceId}/projects/${projectId}#members`);
  }

  function handleConfirmLegacyConvert() {
    editor?.commands.setContent(EMPTY_DOCUMENT_CONTENT);
    setHasConfirmedLegacyConversion(true);
    setIsLegacyDialogOpen(false);
    setSaveError(null);
    setRenderTick((tick) => tick + 1);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (canPersistDraft) persistSave();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // `persistSave` intentionally uses the latest editor/draft values represented
    // by these dependencies rather than being memoized around stale content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPersistDraft, draft.draftTitle, draft.snapshot.revision, liveContent]);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFullscreen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFullscreen]);

  useEffect(() => {
    socket.emit("project:join", projectId, () => undefined);

    function handleDocumentEvent(payload: DocumentSocketPayload) {
      if (payload.projectId !== projectId) return;

      void queryClient.invalidateQueries({ queryKey: activityQueryKeys.project(projectId) });
      if (payload.documentId !== document._id || payload.actorId === currentUserId) return;

      const localDraftIsDirty = isDirtyRef.current;
      if (localDraftIsDirty) {
        const shouldNotify = !hasRemoteUpdateRef.current;
        hasRemoteUpdateRef.current = true;
        setHasRemoteUpdate(true);
        setIsConflictOpen(true);
        setReloadError(null);

        if (shouldNotify) {
          toast.info("A newer server revision is available. Your local draft has been preserved.");
        }
      }

      void getDocumentByIdRequest(document._id)
        .then((latest) => {
          if (isDirtyRef.current) {
            const shouldNotify = !hasRemoteUpdateRef.current;
            hasRemoteUpdateRef.current = true;
            queryClient.setQueryData(documentQueryKeys.detail(projectId, document._id), latest);
            setHasRemoteUpdate(true);
            setIsConflictOpen(true);
            setReloadError(null);

            if (shouldNotify) {
              toast.info("A newer server revision is available. Your local draft has been preserved.");
            }
            return;
          }

          acceptLatestDocument(latest);
        })
        .catch(() => {
          void queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(projectId, document._id) });
        });
    }

    socket.on("document:updated", handleDocumentEvent);
    socket.on("document:archived", handleDocumentEvent);
    socket.on("document:restored", handleDocumentEvent);

    return () => {
      socket.off("document:updated", handleDocumentEvent);
      socket.off("document:archived", handleDocumentEvent);
      socket.off("document:restored", handleDocumentEvent);
      socket.emit("project:leave", projectId, () => undefined);
    };
  }, [acceptLatestDocument, currentUserId, document._id, projectId, queryClient]);


  const saveState: DocumentSaveState = hasRemoteUpdate || isConflictOpen
    ? "conflict"
    : !canEditBase || isLegacyBlocked
      ? "read-only"
      : updateMutation.isPending
        ? "saving"
        : saveError
          ? "error"
          : isDirty
            ? "unsaved"
            : "saved";

  return (
    <div
      className={`min-w-0 space-y-5 overflow-x-hidden ${
        isFullscreen ? "fixed inset-0 z-[70] overflow-y-auto bg-background p-2 sm:p-6" : ""
      }`}
    >
      {readOnlyBanner && <DocumentEditorReadOnlyBanner message={readOnlyBanner} />}

      {hasRecoveredLocalDraft && (
        <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Recovered unsaved changes from this browser. Save them to persist across devices.</span>
          <Button type="button" size="sm" variant="secondary" onClick={handleDiscardRecoveredDraft}>
            Discard recovered draft
          </Button>
        </div>
      )}

      {isLegacyBlocked && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          <span>This document uses an unsupported legacy content format and is shown read-only.</span>
          {canEditBase && (
            <Button type="button" size="sm" variant="secondary" onClick={() => setIsLegacyDialogOpen(true)}>
              Convert to rich text
            </Button>
          )}
        </div>
      )}

      {hasRemoteUpdate && !isConflictOpen && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          <span>A newer server revision is available. Saving is paused so your local draft cannot overwrite it.</span>
          <Button type="button" size="sm" variant="secondary" onClick={() => setIsConflictOpen(true)}>
            Review conflict
          </Button>
        </div>
      )}

      {membersError && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Project member details could not be loaded. Admin-only actions remain disabled until they are available.</span>
            <Button type="button" size="sm" variant="secondary" onClick={onRetryMembers}>
              Retry
            </Button>
          </div>
        </div>
      )}

      <DocumentEditorHeader
        document={document}
        draftTitle={draft.draftTitle}
        onTitleChange={draft.setDraftTitle}
        canEditTitle={editorEditable}
        mode={mode}
        onModeChange={setMode}
        saveState={saveState}
        showSaveControls={canEditBase && !isLegacyBlocked}
        canSave={canPersistDraft}
        isSaving={updateMutation.isPending}
        onSave={handleSave}
        onSaveAndReturn={handleSaveAndReturn}
        onShowMembers={handleShowMembers}
        canArchive={canArchive && !updateMutation.isPending}
        canRestore={canRestore && !updateMutation.isPending}
        canDuplicate={canDuplicate && !updateMutation.isPending}
        isDuplicating={createMutation.isPending}
        canDownloadHtml={canDownloadHtml}
        canDownloadPdf={canDownloadHtml}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDuplicate={handleDuplicate}
        onDownloadHtml={handleDownloadHtml}
        onDownloadPdf={handleDownloadPdf}
        onDownloadJson={handleDownloadJson}
        onCopyId={() => void handleCopyId()}
        onBackToDocuments={handleBackToDocuments}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((value) => !value)}
      />

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-12">
        <div className={`min-w-0 ${isFocusMode ? "xl:col-span-12" : "xl:col-span-8"}`}>
          {mode === "editing" && editor && (
            <DocumentEditorToolbar
              editor={editor}
              disabled={!editorEditable}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen((value) => !value)}
            />
          )}
          <DocumentEditor editor={editor} mode={mode} />
          <DocumentEditorStatusBar
            words={words}
            characters={characters}
            isFocusMode={isFocusMode}
            onToggleFocusMode={() => setIsFocusMode((value) => !value)}
            onShowHelp={() =>
              toast.info("Shortcuts: Ctrl/Cmd+B bold, Ctrl/Cmd+I italic, Ctrl/Cmd+S save, Ctrl/Cmd+Z undo.")
            }
          />
        </div>

        {!isFocusMode && (
          <div className="space-y-4 xl:col-span-4 xl:sticky xl:top-[5.5rem] xl:self-start">
            <DocumentActionsPanel
              canArchive={canArchive && !updateMutation.isPending}
              canRestore={canRestore && !updateMutation.isPending}
              canDuplicate={canDuplicate && !updateMutation.isPending}
              isDuplicating={createMutation.isPending}
              canDownloadHtml={canDownloadHtml}
              canDownloadPdf={canDownloadHtml}
              onDuplicate={handleDuplicate}
              onDownloadHtml={handleDownloadHtml}
              onDownloadPdf={handleDownloadPdf}
              onDownloadJson={handleDownloadJson}
              onCopyId={() => void handleCopyId()}
              onRefresh={() => void handleRefresh()}
              isRefreshing={isRefreshing}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onBackToDocuments={handleBackToDocuments}
            />
            <DocumentInfoPanel document={document} />
            <DocumentProjectMembersPanel
              members={members}
              isLoading={membersLoading}
              isError={membersError}
              onRetry={onRetryMembers}
              workspaceId={workspaceId}
              projectId={projectId}
              canInvite={canInvite}
              onInvite={() => setIsInviteOpen(true)}
            />
            <DocumentActivityPanel projectId={projectId} documentId={document._id} />
          </div>
        )}
      </div>

      <DocumentConflictDialog
        open={isConflictOpen}
        isReloading={isReloadingLatest}
        errorMessage={reloadError}
        onReloadLatest={() => void handleReloadLatest()}
        onDownloadDraft={handleDownloadDraft}
        onCancel={() => setIsConflictOpen(false)}
      />

      <DocumentUnsavedChangesDialog
        open={unsavedGuard.isBlocked}
        isSaving={updateMutation.isPending}
        canSave={canPersistDraft}
        errorMessage={saveError}
        onStay={unsavedGuard.cancelNavigation}
        onDiscardAndLeave={handleDiscardAndLeave}
        onSaveAndLeave={() => persistSave(() => unsavedGuard.navigateToPendingAfterSave())}
      />

      <DocumentLegacyContentDialog
        open={isLegacyDialogOpen}
        onClose={() => setIsLegacyDialogOpen(false)}
        onConfirmConvert={handleConfirmLegacyConvert}
      />

      <InviteProjectMemberDialog
        projectId={projectId}
        projectName={project.name}
        open={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
}

export function DocumentEditorPage() {
  const { workspaceId, projectId, documentId } = useParams<{
    workspaceId: string;
    projectId: string;
    documentId: string;
  }>();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?._id);

  const workspaceQuery = useWorkspaceQuery(workspaceId);
  const projectQuery = useProjectQuery(projectId);
  const membersQuery = useProjectMembersQuery(projectId);
  const documentQuery = useDocumentQuery(projectId, documentId);

  const hasShownMismatchToast = useRef(false);
  const hasShownProjectInaccessibleToast = useRef(false);
  const hasShownWorkspaceNotFoundToast = useRef(false);
  const hasShownDocumentInaccessibleToast = useRef(false);

  useEffect(() => {
    hasShownMismatchToast.current = false;
    hasShownProjectInaccessibleToast.current = false;
    hasShownWorkspaceNotFoundToast.current = false;
    hasShownDocumentInaccessibleToast.current = false;
  }, [workspaceId, projectId, documentId]);

  const isDocumentInaccessible =
    documentQuery.isError && (documentQuery.error?.status === 403 || documentQuery.error?.status === 404);
  const isProjectInaccessible =
    projectQuery.isError && (projectQuery.error?.status === 403 || projectQuery.error?.status === 404);

  useEffect(() => {
    if (!isDocumentInaccessible || hasShownDocumentInaccessibleToast.current || !workspaceId || !projectId) return;
    hasShownDocumentInaccessibleToast.current = true;
    toast.error(
      documentQuery.error?.status === 403 ? "You do not have access to this document." : "This document no longer exists."
    );
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/documents`, { replace: true });
  }, [isDocumentInaccessible, documentQuery.error, navigate, workspaceId, projectId]);

  useEffect(() => {
    if (!isProjectInaccessible || hasShownProjectInaccessibleToast.current || !workspaceId) return;
    hasShownProjectInaccessibleToast.current = true;
    toast.error(
      projectQuery.error?.status === 403 ? "You do not have access to this project." : "This project is no longer accessible."
    );
    navigate(`/workspaces/${workspaceId}#projects`, { replace: true });
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
    const doc = documentQuery.data;
    if (!workspaceId || !projectId) return;

    const projectMismatch = projectQuery.isSuccess && project && project.workspace !== workspaceId;
    const documentMismatch = documentQuery.isSuccess && doc && doc.project !== projectId;

    if (!projectMismatch && !documentMismatch) {
      hasShownMismatchToast.current = false;
      return;
    }
    if (hasShownMismatchToast.current) return;
    hasShownMismatchToast.current = true;

    toast.error(
      projectMismatch
        ? "This project does not belong to the selected workspace."
        : "This document does not belong to this project."
    );
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/documents`, { replace: true });
  }, [workspaceId, projectId, projectQuery.isSuccess, projectQuery.data, documentQuery.isSuccess, documentQuery.data, navigate]);

  if (!workspaceId || !projectId || !documentId) return null;

  if (workspaceQuery.isLoading || projectQuery.isLoading || documentQuery.isLoading || membersQuery.isLoading) {
    return <DocumentEditorSkeleton />;
  }

  if (isDocumentInaccessible || isProjectInaccessible) return null;
  if (workspaceQuery.isError && workspaceQuery.error?.status === 404) return null;

  if (documentQuery.isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">{documentQuery.error?.message ?? "Unable to load this document."}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => void documentQuery.refetch()}>
            Retry
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/documents`)}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  if (projectQuery.isError || workspaceQuery.isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">
          {projectQuery.error?.message ?? workspaceQuery.error?.message ?? "Unable to load this document's project."}
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

  const document = documentQuery.data;
  const project = projectQuery.data;
  const workspace = workspaceQuery.data;
  if (!document || !project || !workspace) return null;

  const members = membersQuery.data ?? [];
  const role = deriveProjectRole(members, currentUserId) ?? (membersQuery.isError ? "member" : undefined);

  return (
    <DocumentEditorWorkspace
      key={document._id}
      workspaceId={workspaceId}
      projectId={projectId}
      document={document}
      project={project}
      workspace={workspace}
      members={members}
      membersLoading={membersQuery.isLoading}
      membersError={membersQuery.isError}
      onRetryMembers={() => void membersQuery.refetch()}
      role={role}
      currentUserId={currentUserId}
    />
  );
}
