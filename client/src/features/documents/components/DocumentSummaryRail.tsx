import {
  FileText,
  PenSquare,
  UserRound,
} from "lucide-react";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  formatRelativeTime,
} from "@/lib/date";

import type {
  ProjectDocument,
} from "../types/document.types";

interface DocumentSummaryRailProps {
  activeLoadedCount: number;
  activeHasMore: boolean;
  activeLoading: boolean;
  activeUnavailable: boolean;
  archivedLoadedCount: number;
  archivedHasMore: boolean;
  archivedLoading: boolean;
  archivedUnavailable: boolean;
  mostRecentlyUpdated: ProjectDocument | null;
  updatedInLastSevenDays: number;
}

interface CountRowProps {
  label: string;
  count: number;
  hasMore: boolean;
  loading: boolean;
  unavailable: boolean;
}

function CountRow({
  label,
  count,
  hasMore,
  loading,
  unavailable,
}: CountRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">
        {
          label
        }
      </span>

      {
        loading ? (
          <Skeleton className="h-4 w-8" />
        ) : (
          <span className="font-medium text-foreground">
            {
              unavailable
                ? "—"
                : `${count}${hasMore ? "+" : ""}`
            }
          </span>
        )
      }
    </div>
  );
}

export function DocumentSummaryRail({
  activeLoadedCount,
  activeHasMore,
  activeLoading,
  activeUnavailable,
  archivedLoadedCount,
  archivedHasMore,
  archivedLoading,
  archivedUnavailable,
  mostRecentlyUpdated,
  updatedInLastSevenDays,
}: DocumentSummaryRailProps) {
  const loadedTotal =
    activeLoadedCount +
    archivedLoadedCount;

  const totalHasMore =
    activeHasMore ||
    archivedHasMore ||
    activeUnavailable ||
    archivedUnavailable;

  return (
    <section
      aria-labelledby="document-summary-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <h2
        id="document-summary-heading"
        className="mb-3 text-h3 text-foreground"
      >
        Document Summary
      </h2>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">
            Loaded total
          </span>

          <span className="font-medium text-foreground">
            {
              activeLoading ||
              archivedLoading
                ? "…"
                : `${loadedTotal}${totalHasMore ? "+" : ""}`
            }
          </span>
        </div>

        <CountRow
          label="Active (loaded)"
          count={
            activeLoadedCount
          }
          hasMore={
            activeHasMore
          }
          loading={
            activeLoading
          }
          unavailable={
            activeUnavailable
          }
        />

        <CountRow
          label="Archived (loaded)"
          count={
            archivedLoadedCount
          }
          hasMore={
            archivedHasMore
          }
          loading={
            archivedLoading
          }
          unavailable={
            archivedUnavailable
          }
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">
            Updated in last 7 days
          </span>

          <span className="font-medium text-foreground">
            {
              activeLoading ||
              archivedLoading
                ? "…"
                : activeUnavailable &&
                    archivedUnavailable
                  ? "—"
                  : updatedInLastSevenDays
            }
          </span>
        </div>
      </div>

      {
        mostRecentlyUpdated && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-caption">
              <FileText className="h-3.5 w-3.5" />
              Most recently updated
            </p>

            <p className="truncate text-sm font-medium text-foreground">
              {
                mostRecentlyUpdated.title
              }
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <UserRound className="h-3 w-3" />
                {
                  mostRecentlyUpdated.updatedBy
                    ?.name ??
                  "Unavailable member"
                }
              </span>

              <span className="flex items-center gap-1">
                <PenSquare className="h-3 w-3" />
                rev {mostRecentlyUpdated.revision}
              </span>

              <span>
                {
                  formatRelativeTime(
                    mostRecentlyUpdated.updatedAt
                  )
                }
              </span>
            </div>
          </div>
        )
      }

      {
        (activeUnavailable ||
          archivedUnavailable) && (
          <p className="mt-3 text-[11px] text-warning">
            Some document counts are unavailable. Loaded data is shown where possible.
          </p>
        )
      }

      <p className="mt-4 text-[11px] text-muted/70">
        Counts and summaries reflect only loaded documents because the API does not provide exact totals.
      </p>
    </section>
  );
}
