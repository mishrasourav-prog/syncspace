import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SORT_LABEL, type DocumentSort } from "../document.filters";

const SORT_OPTIONS: DocumentSort[] = ["newest", "oldest", "updated", "title"];

interface DocumentFilterToolbarProps {
  search: string;
  sort: DocumentSort;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: DocumentSort) => void;
  onClear: () => void;
}

export function DocumentFilterToolbar({
  search,
  sort,
  activeFilterCount,
  onSearchChange,
  onSortChange,
  onClear,
}: DocumentFilterToolbarProps) {
  return (
    <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        icon={Search}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search documents…"
        aria-label="Search documents by title"
        className="h-9 w-full sm:max-w-xs sm:w-64"
        rightSlot={
          search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
      />

      <Popover>
        <PopoverTrigger
          aria-label="Sort documents"
          className="inline-flex h-9 w-full items-center justify-between sm:w-auto gap-1.5 rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors hover:bg-border/30"
        >
          Sort: {SORT_LABEL[sort]}
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        </PopoverTrigger>
        <PopoverContent className="w-52">
          <p className="mb-1 px-0.5 text-caption uppercase tracking-wide">Sort by</p>
          <div className="space-y-0.5">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSortChange(option)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                  sort === option && "bg-primary/10 text-primary"
                )}
              >
                {SORT_LABEL[option]}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {activeFilterCount > 0 && (
        <button type="button" onClick={onClear} className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          Clear
        </button>
      )}
    </div>
  );
}
