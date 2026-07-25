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
  /**
   * Replaces both the accepted server snapshot and the visible title.
   * Use this only for an explicit reload or when no newer local edits exist.
   */
  acceptServerDocument: (document: ProjectDocument, content: unknown) => void;
  /**
   * Advances only the accepted server snapshot after a save. The visible
   * title remains untouched so edits made while the request was in flight
   * stay dirty instead of being silently discarded.
   */
  acceptSavedSnapshot: (document: ProjectDocument, content: unknown) => void;
}

/**
 * Keyed by the caller to `document._id` (i.e. mounted fresh per document),
 * this hook tracks only the last accepted title/content pair — never a live
 * mirror of the query. Tiptap is the source of truth for live content; this
 * hook answers whether the current draft has diverged from the latest server
 * revision that the editor has safely accepted.
 */
export function useDocumentEditorDraft(
  initialDocument: ProjectDocument,
  initialContent: unknown
): UseDocumentEditorDraftResult {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot>(() => ({
    revision: initialDocument.revision,
    title: initialDocument.title,
    content: initialContent,
  }));

  const [draftTitle, setDraftTitle] = useState<string>(() => initialDocument.title);

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
