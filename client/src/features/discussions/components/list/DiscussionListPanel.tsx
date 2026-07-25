import { MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import type {
  Discussion,
  DiscussionListFilter,
} from "../../types/discussion.types";
import { DiscussionListItem } from "./DiscussionListItem";

interface DiscussionListPanelProps {
  workspaceId: string;
  projectId: string;
  selectedDiscussionId: string | undefined;
  searchValue: string;
  filter: DiscussionListFilter;
  discussions: Discussion[];
  loadedCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  detailSearch: string;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onLoadMore: () => void;
}

function getEmptyMessage(
  searchValue: string,
  filter: DiscussionListFilter,
  hasMore: boolean
): string {
  if (searchValue.trim()) {
    return hasMore
      ? "No loaded discussions match your search. Load more to continue searching."
      : "No discussions match your search.";
  }

  if (filter === "pinned") {
    return hasMore
      ? "No pinned discussions are loaded yet. Load more to check older discussions."
      : "No pinned discussions yet.";
  }

  if (filter === "mine") {
    return hasMore
      ? "None of your loaded discussions match this view. Load more to check older discussions."
      : "You haven't started any discussions yet.";
  }

  if (filter === "locked") {
    return hasMore
      ? "No locked discussions are loaded yet. Load more to check older discussions."
      : "No locked discussions yet.";
  }

  return "No discussions yet. Start the conversation.";
}

export function DiscussionListPanel({
  workspaceId,
  projectId,
  selectedDiscussionId,
  searchValue,
  filter,
  discussions,
  loadedCount,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  hasMore,
  isFetchingNextPage,
  detailSearch,
  onSearchChange,
  onRetry,
  onLoadMore,
}: DiscussionListPanelProps) {
  const basePath = `/workspaces/${workspaceId}/projects/${projectId}/discussions`;
  const searchSuffix = detailSearch ? `?${detailSearch}` : "";

  return (
    <section
      aria-label="Discussion list"
      className="flex h-full min-h-0 w-full flex-col rounded-xl border border-border bg-surface/60 shadow-soft"
    >
      <div className="shrink-0 border-b border-border p-3">
        <Input
          icon={Search}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search discussions..."
          aria-label="Search discussions"
          maxLength={100}
          rightSlot={
            isFetching && !isLoading ? (
              <span
                className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-muted/30 border-t-secondary"
                aria-label="Searching"
              />
            ) : undefined
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-lg border border-border/60 px-3 py-3"
              >
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <DashboardSectionError
            compact
            message={errorMessage ?? "Unable to load discussions."}
            onRetry={onRetry}
          />
        )}

        {!isLoading && !isError && discussions.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
            <MessageSquare className="h-6 w-6 text-muted" />
            <p className="text-sm text-muted">
              {getEmptyMessage(searchValue, filter, hasMore)}
            </p>
          </div>
        )}

        {!isError && discussions.length > 0 && (
          <div className="space-y-2">
            {discussions.map((discussion) => (
              <DiscussionListItem
                key={discussion._id}
                discussion={discussion}
                href={`${basePath}/${discussion._id}${searchSuffix}`}
                isSelected={discussion._id === selectedDiscussionId}
              />
            ))}
          </div>
        )}

        {!isError && hasMore && (
          <div className="mt-3 flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>

      {!isLoading && !isError && (
        <div className="shrink-0 border-t border-border px-3 py-2 text-center text-[11px] text-muted/80">
          Showing {loadedCount} loaded {loadedCount === 1 ? "discussion" : "discussions"}
          {hasMore ? " · More available" : ""}
        </div>
      )}
    </section>
  );
}
