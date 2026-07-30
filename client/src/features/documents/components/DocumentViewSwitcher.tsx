import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentView } from "../document.filters";

interface DocumentViewSwitcherProps {
  view: DocumentView;
  onChange: (view: DocumentView) => void;
}

export function DocumentViewSwitcher({
  view,
  onChange,
}: DocumentViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Document view"
      className="inline-flex rounded-lg border border-border bg-surface p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "list"
            ? "bg-primary/15 text-primary"
            : "text-muted hover:text-foreground",
        )}
      >
        <List className="h-3.5 w-3.5" />
        List
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "grid"
            ? "bg-primary/15 text-primary"
            : "text-muted hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Grid
      </button>
    </div>
  );
}
