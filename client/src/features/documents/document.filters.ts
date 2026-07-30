import type { ProjectDocument } from "./types/document.types";

export type DocumentView = "list" | "grid";

export type DocumentState = "all" | "active" | "archived";

export type DocumentSort = "newest" | "oldest" | "updated" | "title";

export type DocumentUpdatedFilter = "today" | "week" | "month" | "older";

export type DocumentRevisionFilter = "any" | "one" | "two-plus" | "five-plus";

export interface DocumentFilters {
  q: string;
  view: DocumentView;
  state: DocumentState;
  sort: DocumentSort;
  creator: string | null;
  updated: DocumentUpdatedFilter | null;
  revision: DocumentRevisionFilter;
}

export const SORT_LABEL: Record<DocumentSort, string> = {
  newest: "Newest created",
  oldest: "Oldest created",
  updated: "Last updated",
  title: "Title (A–Z)",
};

export const UPDATED_LABEL: Record<DocumentUpdatedFilter, string> = {
  today: "Today",
  week: "Last 7 days",
  month: "Last 30 days",
  older: "Older",
};

export const REVISION_LABEL: Record<DocumentRevisionFilter, string> = {
  any: "Any revision",
  one: "Revision 1",
  "two-plus": "Revision 2+",
  "five-plus": "Revision 5+",
};

export function parseDocumentFilters(
  searchParams: URLSearchParams,
): DocumentFilters {
  const view = searchParams.get("view") === "grid" ? "grid" : "list";

  const stateParam = searchParams.get("state");

  const state: DocumentState =
    stateParam === "active" || stateParam === "archived" ? stateParam : "all";

  const sortParam = searchParams.get("sort");

  const sort: DocumentSort =
    sortParam === "oldest" || sortParam === "updated" || sortParam === "title"
      ? sortParam
      : "newest";

  const updatedParam = searchParams.get("updated");

  const updated: DocumentUpdatedFilter | null =
    updatedParam === "today" ||
    updatedParam === "week" ||
    updatedParam === "month" ||
    updatedParam === "older"
      ? updatedParam
      : null;

  const revisionParam = searchParams.get("revision");

  const revision: DocumentRevisionFilter =
    revisionParam === "one" ||
    revisionParam === "two-plus" ||
    revisionParam === "five-plus"
      ? revisionParam
      : "any";

  return {
    q: searchParams.get("q") ?? "",
    view,
    state,
    sort,
    creator: searchParams.get("creator"),
    updated,
    revision,
  };
}

export function countActiveDocumentFilters(filters: DocumentFilters): number {
  let count = 0;

  if (filters.state !== "all") {
    count += 1;
  }

  if (filters.creator) {
    count += 1;
  }

  if (filters.updated) {
    count += 1;
  }

  if (filters.revision !== "any") {
    count += 1;
  }

  return count;
}

function startOfLocalDay(timestamp: number): number {
  const date = new Date(timestamp);

  date.setHours(0, 0, 0, 0);

  return date.getTime();
}

function getUpdatedBucket(dateIso: string, now: number): DocumentUpdatedFilter {
  const updatedAt = new Date(dateIso).getTime();

  const todayStart = startOfLocalDay(now);

  if (updatedAt >= todayStart) {
    return "today";
  }

  const sevenDaysAgo = todayStart - 6 * 86_400_000;

  if (updatedAt >= sevenDaysAgo) {
    return "week";
  }

  const thirtyDaysAgo = todayStart - 29 * 86_400_000;

  if (updatedAt >= thirtyDaysAgo) {
    return "month";
  }

  return "older";
}

function matchesRevisionFilter(
  document: ProjectDocument,
  revision: DocumentRevisionFilter,
): boolean {
  switch (revision) {
    case "one":
      return document.revision === 1;

    case "two-plus":
      return document.revision >= 2;

    case "five-plus":
      return document.revision >= 5;

    default:
      return true;
  }
}

export function deduplicateDocuments(
  documents: ProjectDocument[],
): ProjectDocument[] {
  const byId = new Map<string, ProjectDocument>();

  for (const document of documents) {
    const existing = byId.get(document._id);

    if (
      !existing ||
      document.revision > existing.revision ||
      new Date(document.updatedAt).getTime() >
        new Date(existing.updatedAt).getTime()
    ) {
      byId.set(document._id, document);
    }
  }

  return Array.from(byId.values());
}

export function applyClientDocumentFilters(
  documents: ProjectDocument[],
  filters: DocumentFilters,
  now: number,
): ProjectDocument[] {
  return documents.filter((document) => {
    if (filters.creator && document.createdBy?._id !== filters.creator) {
      return false;
    }

    if (
      filters.updated &&
      getUpdatedBucket(document.updatedAt, now) !== filters.updated
    ) {
      return false;
    }

    if (!matchesRevisionFilter(document, filters.revision)) {
      return false;
    }

    return true;
  });
}

export function sortDocuments(
  documents: ProjectDocument[],
  sort: DocumentSort,
): ProjectDocument[] {
  const copy = [...documents];

  switch (sort) {
    case "oldest":
      return copy.sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime(),
      );

    case "updated":
      return copy.sort(
        (first, second) =>
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime(),
      );

    case "title":
      return copy.sort((first, second) =>
        first.title.localeCompare(second.title),
      );

    default:
      return copy.sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      );
  }
}

interface TabCountInputs {
  activeLoadedCount: number;
  activeHasMore: boolean;
  activeLoading?: boolean;
  activeUnavailable?: boolean;
  archivedLoadedCount: number;
  archivedHasMore: boolean;
  archivedLoading?: boolean;
  archivedUnavailable?: boolean;
}

export interface TabCountLabels {
  allLabel: string;
  activeLabel: string;
  archivedLabel: string;
}

function formatCount(
  count: number,
  hasMore: boolean,
  loading: boolean,
  unavailable: boolean,
): string {
  if (loading && count === 0) {
    return "…";
  }

  if (unavailable) {
    return "—";
  }

  return hasMore || loading ? `${count}+` : `${count}`;
}

export function computeTabCountLabels({
  activeLoadedCount,
  activeHasMore,
  activeLoading = false,
  activeUnavailable = false,
  archivedLoadedCount,
  archivedHasMore,
  archivedLoading = false,
  archivedUnavailable = false,
}: TabCountInputs): TabCountLabels {
  const allUnavailable = activeUnavailable && archivedUnavailable;

  const hasPartialUnavailable = activeUnavailable || archivedUnavailable;

  const loadedTotal = activeLoadedCount + archivedLoadedCount;

  return {
    activeLabel: formatCount(
      activeLoadedCount,
      activeHasMore,
      activeLoading,
      activeUnavailable,
    ),

    archivedLabel: formatCount(
      archivedLoadedCount,
      archivedHasMore,
      archivedLoading,
      archivedUnavailable,
    ),

    allLabel: allUnavailable
      ? "—"
      : activeLoading && archivedLoading && loadedTotal === 0
        ? "…"
        : activeHasMore ||
            archivedHasMore ||
            activeLoading ||
            archivedLoading ||
            hasPartialUnavailable
          ? `${loadedTotal}+`
          : `${loadedTotal}`,
  };
}
