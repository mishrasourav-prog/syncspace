import { MessageSquare, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DiscussionListFilter } from "../types/discussion.types";

const FILTER_OPTIONS: Array<{
  id: DiscussionListFilter;
  label: string;
}> = [
  { id: "all", label: "All Discussions" },
  { id: "pinned", label: "Pinned" },
  { id: "mine", label: "My Discussions" },
  { id: "locked", label: "Locked" },
];

interface DiscussionPageHeaderProps {
  filter: DiscussionListFilter;
  canCreate: boolean;
  onFilterChange: (filter: DiscussionListFilter) => void;
  onCreate: () => void;
}

export function DiscussionPageHeader({
  filter,
  canCreate,
  onFilterChange,
  onCreate,
}: DiscussionPageHeaderProps) {
  const activeFilter =
    FILTER_OPTIONS.find((option) => option.id === filter) ?? FILTER_OPTIONS[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-secondary/25 bg-secondary/15 text-secondary shadow-soft">
            <MessageSquare className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-h1 text-foreground">Discussions</h1>
            <p className="mt-0.5 max-w-2xl text-caption">
              Collaborate and discuss ideas, feedback, and decisions about this
              project.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Filter discussions: ${activeFilter.label}`}
              className="h-9 w-auto gap-2 border border-border bg-surface px-3"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs font-medium text-foreground">
                {activeFilter.label}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {FILTER_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => onFilterChange(option.id)}
                  className={cn(
                    filter === option.id && "bg-secondary/10 text-secondary",
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {canCreate && (
            <Button
              type="button"
              onClick={onCreate}
              className="bg-secondary text-white hover:bg-secondary/90"
            >
              <Plus className="h-4 w-4" />
              New Discussion
            </Button>
          )}
        </div>
      </div>

      <div
        className="-mx-1 flex min-w-0 gap-1 overflow-x-auto border-b border-border px-1"
        role="tablist"
        aria-label="Discussion filters"
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = option.id === filter;

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(option.id)}
              className={cn(
                "relative shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-secondary"
                  : "text-muted hover:text-foreground",
              )}
            >
              {option.label}
              {isActive && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-secondary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
