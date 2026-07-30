import type { ReactNode } from "react";

import { ChevronDown } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { ProjectMember } from "@/features/project-members/types/projectMember.types";

import { cn } from "@/lib/utils";

import {
  REVISION_LABEL,
  UPDATED_LABEL,
  type DocumentFilters,
  type DocumentRevisionFilter,
  type DocumentState,
  type DocumentUpdatedFilter,
} from "../document.filters";

const STATE_OPTIONS: Array<{
  value: DocumentState;
  label: string;
}> = [
  {
    value: "all",
    label: "All documents",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

const UPDATED_OPTIONS: DocumentUpdatedFilter[] = [
  "today",
  "week",
  "month",
  "older",
];

const REVISION_OPTIONS: DocumentRevisionFilter[] = [
  "one",
  "two-plus",
  "five-plus",
];

interface FilterRowProps {
  label: string;
  count: number;
  children: ReactNode;
}

function FilterRow({ label, count, children }: FilterRowProps) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`${label} filter`}
        className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-border/30"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate">{label}</span>

          {count > 0 && (
            <span className="flex h-4.5 min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {count}
            </span>
          )}
        </span>

        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-56">
        {children}
      </PopoverContent>
    </Popover>
  );
}

interface DocumentFiltersRailProps {
  filters: DocumentFilters;
  members: ProjectMember[];
  membersLoading: boolean;
  membersUnavailable: boolean;
  activeFilterCount: number;
  onStateChange: (state: DocumentState) => void;
  onCreatorChange: (creator: string | null) => void;
  onUpdatedChange: (updated: DocumentUpdatedFilter | null) => void;
  onRevisionChange: (revision: DocumentRevisionFilter) => void;
  onRetryMembers: () => void;
  onClear: () => void;
}

export function DocumentFiltersRail({
  filters,
  members,
  membersLoading,
  membersUnavailable,
  activeFilterCount,
  onStateChange,
  onCreatorChange,
  onUpdatedChange,
  onRevisionChange,
  onRetryMembers,
  onClear,
}: DocumentFiltersRailProps) {
  const selectedCreator = members.find(
    (member) => member.user._id === filters.creator,
  );

  const stateLabel =
    STATE_OPTIONS.find((option) => option.value === filters.state)?.label ??
    "All documents";

  return (
    <section
      aria-labelledby="document-filters-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="document-filters-heading" className="text-h3 text-foreground">
          Filters
        </h2>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-caption">Status</p>

          <FilterRow label={stateLabel} count={filters.state === "all" ? 0 : 1}>
            <div className="space-y-0.5">
              {STATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStateChange(option.value)}
                  className={cn(
                    "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                    filters.state === option.value &&
                      "bg-primary/10 text-primary",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </FilterRow>
        </div>

        <div>
          <p className="mb-1.5 text-caption">Created by</p>

          <Popover>
            <PopoverTrigger
              aria-label="Creator filter"
              className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-border/30"
            >
              {selectedCreator ? (
                <>
                  <Avatar
                    src={selectedCreator.user.avatar}
                    name={selectedCreator.user.name}
                    size="sm"
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {selectedCreator.user.name}
                  </span>
                </>
              ) : (
                <span className="min-w-0 flex-1 truncate text-muted">
                  {filters.creator
                    ? "Selected creator unavailable"
                    : "Any creator"}
                </span>
              )}

              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="max-h-64 w-60 overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => onCreatorChange(null)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                  !filters.creator && "bg-primary/10 text-primary",
                )}
              >
                Any creator
              </button>

              {membersLoading ? (
                <p className="rounded-lg px-2.5 py-2 text-xs text-muted">
                  Loading members…
                </p>
              ) : membersUnavailable ? (
                <div className="rounded-lg px-2.5 py-2 text-xs text-warning">
                  <p>Creator options are unavailable.</p>

                  <button
                    type="button"
                    onClick={onRetryMembers}
                    className="mt-1 font-medium text-primary hover:text-primary/80"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                members.map((member) => (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => onCreatorChange(member.user._id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                      filters.creator === member.user._id &&
                        "bg-primary/10 text-primary",
                    )}
                  >
                    <Avatar
                      src={member.user.avatar}
                      name={member.user.name}
                      size="sm"
                    />

                    <span className="truncate">{member.user.name}</span>
                  </button>
                ))
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <p className="mb-1.5 text-caption">Date updated</p>

          <FilterRow
            label={
              filters.updated ? UPDATED_LABEL[filters.updated] : "Any time"
            }
            count={filters.updated ? 1 : 0}
          >
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => onUpdatedChange(null)}
                className={cn(
                  "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                  !filters.updated && "bg-primary/10 text-primary",
                )}
              >
                Any time
              </button>

              {UPDATED_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    onUpdatedChange(filters.updated === option ? null : option)
                  }
                  className={cn(
                    "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                    filters.updated === option && "bg-primary/10 text-primary",
                  )}
                >
                  {UPDATED_LABEL[option]}
                </button>
              ))}
            </div>
          </FilterRow>
        </div>

        <div>
          <p className="mb-1.5 text-caption">Revision</p>

          <FilterRow
            label={REVISION_LABEL[filters.revision]}
            count={filters.revision !== "any" ? 1 : 0}
          >
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => onRevisionChange("any")}
                className={cn(
                  "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                  filters.revision === "any" && "bg-primary/10 text-primary",
                )}
              >
                Any revision
              </button>

              {REVISION_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onRevisionChange(option)}
                  className={cn(
                    "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                    filters.revision === option && "bg-primary/10 text-primary",
                  )}
                >
                  {REVISION_LABEL[option]}
                </button>
              ))}
            </div>
          </FilterRow>
        </div>
      </div>
    </section>
  );
}
