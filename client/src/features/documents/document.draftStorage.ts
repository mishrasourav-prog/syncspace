export interface StoredDocumentDraft {
  documentId: string;
  userId: string;
  baseRevision: number;
  title: string;
  content: unknown;
  updatedAt: string;
}

const DRAFT_PREFIX = "syncspace:document-draft";

function getDraftKey(userId: string, documentId: string): string {
  return `${DRAFT_PREFIX}:${userId}:${documentId}`;
}

function isStoredDocumentDraft(value: unknown): value is StoredDocumentDraft {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<StoredDocumentDraft>;
  return (
    typeof candidate.documentId === "string" &&
    typeof candidate.userId === "string" &&
    typeof candidate.baseRevision === "number" &&
    Number.isInteger(candidate.baseRevision) &&
    candidate.baseRevision >= 0 &&
    typeof candidate.title === "string" &&
    "content" in candidate &&
    typeof candidate.updatedAt === "string"
  );
}

export function readDocumentDraft(
  userId: string | undefined,
  documentId: string,
  serverRevision: number,
): StoredDocumentDraft | null {
  if (!userId || typeof window === "undefined") return null;

  const key = getDraftKey(userId, documentId);

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredDocumentDraft(parsed)) {
      window.localStorage.removeItem(key);
      return null;
    }

    if (
      parsed.userId !== userId ||
      parsed.documentId !== documentId ||
      parsed.baseRevision !== serverRevision
    ) {
      window.localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {}
    return null;
  }
}

export function writeDocumentDraft(draft: StoredDocumentDraft): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getDraftKey(draft.userId, draft.documentId),
      JSON.stringify(draft),
    );
  } catch {}
}

export function clearDocumentDraft(
  userId: string | undefined,
  documentId: string,
): void {
  if (!userId || typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getDraftKey(userId, documentId));
  } catch {}
}
