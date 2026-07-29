import { useCallback, useState } from "react";
import { areDocumentContentsEqual } from "../document.content";
import type { ProjectDocument } from "../types/document.types";

export interface DocumentSnapshot {
  revision: number;
  title: string;
  content: unknown;
}

export interface UseDocumentEditorDraftResult {
  snapshot: DocumentSnapshot;
  draftTitle: string;
  setDraftTitle: (title: string) => void;
  isTitleDirty: boolean;
  isContentDirty: (liveContent: unknown) => boolean;
  isDirty: (liveContent: unknown) => boolean;
  acceptServerDocument: (document: ProjectDocument, content: unknown) => void;
  acceptSavedSnapshot: (document: ProjectDocument, content: unknown) => void;
}

/**
 * The accepted snapshot always represents server state. An optional restored
 * title may be shown as the current local draft, while dirty checks still
 * compare it with the authoritative server title/content.
 */
export function useDocumentEditorDraft(
  initialDocument: ProjectDocument,
  serverContent: unknown,
  restoredTitle?: string
): UseDocumentEditorDraftResult {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot>(() => ({
    revision: initialDocument.revision,
    title: initialDocument.title,
    content: serverContent,
  }));

  const [draftTitle, setDraftTitle] = useState<string>(
    () => restoredTitle ?? initialDocument.title
  );

  const isTitleDirty = draftTitle.trim() !== snapshot.title;

  const isContentDirty = useCallback(
    (liveContent: unknown) => !areDocumentContentsEqual(liveContent, snapshot.content),
    [snapshot.content]
  );

  const isDirty = useCallback(
    (liveContent: unknown) => isTitleDirty || isContentDirty(liveContent),
    [isTitleDirty, isContentDirty]
  );

  const acceptSavedSnapshot = useCallback((document: ProjectDocument, content: unknown) => {
    setSnapshot({
      revision: document.revision,
      title: document.title,
      content,
    });
  }, []);

  const acceptServerDocument = useCallback((document: ProjectDocument, content: unknown) => {
    setSnapshot({
      revision: document.revision,
      title: document.title,
      content,
    });
    setDraftTitle(document.title);
  }, []);

  return {
    snapshot,
    draftTitle,
    setDraftTitle,
    isTitleDirty,
    isContentDirty,
    isDirty,
    acceptServerDocument,
    acceptSavedSnapshot,
  };
}
