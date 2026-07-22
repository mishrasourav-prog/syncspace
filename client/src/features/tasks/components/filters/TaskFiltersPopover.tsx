import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TaskStateFilter } from "../../task.filters";

const STATE_OPTIONS: { value: TaskStateFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

interface TaskFiltersPopoverProps {
  state: TaskStateFilter;
  activeFilterCount: number;
  onStateChange: (state: TaskStateFilter) => void;
}

export function TaskFiltersPopover({
  state,
  activeFilterCount,
  onStateChange,
}: TaskFiltersPopoverProps) {

  return (
    <Popover>
      <PopoverTrigger
        aria-label="More filters"
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors hover:bg-border/30"
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-52">
        <fieldset>
          <legend className="mb-2 px-0.5 text-caption uppercase tracking-wide">Task state</legend>
          <div className="space-y-0.5">
            {STATE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-border/40",
                  state === option.value && "bg-primary/10 text-primary"
                )}
              >
                <input
                  type="radio"
                  name="task-state"
                  value={option.value}
                  checked={state === option.value}
                  onChange={() => onStateChange(option.value)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </PopoverContent>
    </Popover>
  );
}
