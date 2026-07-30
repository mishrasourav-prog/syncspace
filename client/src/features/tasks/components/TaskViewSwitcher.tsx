import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskView } from "../task.filters";

interface TaskViewSwitcherProps {
  view: TaskView;
  onChange: (view: TaskView) => void;
}

export function TaskViewSwitcher({ view, onChange }: TaskViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Task view"
      className="inline-flex rounded-lg border border-border bg-surface p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === "board"}
        onClick={() => onChange("board")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "board"
            ? "bg-primary/15 text-primary"
            : "text-muted hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Board
      </button>
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
    </div>
  );
}
