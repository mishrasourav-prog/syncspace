import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type WorkspaceFilter = "all" | "active" | "archived";

interface WorkspaceToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: WorkspaceFilter;
  onFilterChange: (filter: WorkspaceFilter) => void;
  counts: { all: number; active: number; archived: number };
}

const FILTERS: { value: WorkspaceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export function WorkspaceToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        icon={Search}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search workspaces..."
        aria-label="Search workspaces"
        className="sm:max-w-xs"
      />

      <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-border bg-surface/60 p-1">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilterChange(item.value)}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === item.value ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
            )}
          >
            {item.label}
            <span className="ml-1.5 text-xs opacity-70">{counts[item.value]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
