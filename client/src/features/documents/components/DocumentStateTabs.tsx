import { cn } from "@/lib/utils";
import type { DocumentState } from "../document.filters";
import type { TabCountLabels } from "../document.filters";

interface DocumentStateTabsProps {
  state: DocumentState;
  counts: TabCountLabels;
  onChange: (state: DocumentState) => void;
}

const TABS: { id: DocumentState; label: string }[] = [
  { id: "all", label: "All Documents" },
  { id: "active", label: "Active" },
  { id: "archived", label: "Archived" },
];

export function DocumentStateTabs({ state, counts, onChange }: DocumentStateTabsProps) {
  const countFor = (id: DocumentState) =>
    id === "all" ? counts.allLabel : id === "active" ? counts.activeLabel : counts.archivedLabel;

  return (
    <div role="tablist" aria-label="Document status" className="-mx-1 flex gap-4 overflow-x-auto border-b border-border px-1">
      {TABS.map((tab) => {
        const isActive = state === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-1 py-2.5 text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                isActive ? "bg-primary/15 text-primary" : "bg-surface text-muted"
              )}
            >
              {countFor(tab.id)}
            </span>
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
