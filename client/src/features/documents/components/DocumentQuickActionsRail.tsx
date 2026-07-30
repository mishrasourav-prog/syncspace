import { Archive, FilePlus2, Files, RefreshCw, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { DocumentState } from "../document.filters";

interface DocumentQuickActionsRailProps {
  canCreate: boolean;
  readOnlyReason: string | null;
  currentState: DocumentState;
  hasActiveFilters: boolean;
  onCreate: () => void;
  onStateChange: (state: DocumentState) => void;
  onClear: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DocumentQuickActionsRail({
  canCreate,
  readOnlyReason,
  currentState,
  hasActiveFilters,
  onCreate,
  onStateChange,
  onClear,
  onRefresh,
  isRefreshing,
}: DocumentQuickActionsRailProps) {
  return (
    <section
      aria-labelledby="document-quick-actions-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <h2
        id="document-quick-actions-heading"
        className="mb-3 text-h3 text-foreground"
      >
        Quick Actions
      </h2>

      <div className="space-y-1">
        <button
          type="button"
          onClick={onCreate}
          disabled={!canCreate}
          title={
            !canCreate
              ? (readOnlyReason ??
                "You do not have permission to create documents.")
              : undefined
          }
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
            canCreate
              ? "text-foreground hover:bg-border/40"
              : "cursor-not-allowed text-muted/60",
          )}
        >
          <FilePlus2 className="h-4 w-4" />
          New document
        </button>

        <button
          type="button"
          onClick={() => onStateChange("active")}
          aria-pressed={currentState === "active"}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-border/40",
            currentState === "active"
              ? "bg-primary/10 text-primary"
              : "text-foreground",
          )}
        >
          <Files className="h-4 w-4" />
          Show active documents
        </button>

        <button
          type="button"
          onClick={() => onStateChange("archived")}
          aria-pressed={currentState === "archived"}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-border/40",
            currentState === "archived"
              ? "bg-primary/10 text-primary"
              : "text-foreground",
          )}
        >
          <Archive className="h-4 w-4" />
          Show archived documents
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-border/40"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-border/40 disabled:cursor-not-allowed disabled:text-muted/60"
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />

          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {readOnlyReason && (
        <p className="mt-3 text-[11px] text-warning">{readOnlyReason}</p>
      )}
    </section>
  );
}
