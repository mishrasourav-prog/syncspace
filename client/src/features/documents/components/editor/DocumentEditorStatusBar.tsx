import { HelpCircle, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentEditorStatusBarProps {
  words: number;
  characters: number;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onShowHelp: () => void;
}

export function DocumentEditorStatusBar({
  words,
  characters,
  isFocusMode,
  onToggleFocusMode,
  onShowHelp,
}: DocumentEditorStatusBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border border-t-0 border-border bg-surface/60 px-3 py-2 text-[11px] text-muted">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          {words} word{words === 1 ? "" : "s"}
        </span>
        <span aria-hidden>·</span>
        <span>
          {characters} character{characters === 1 ? "" : "s"}
        </span>
        <span aria-hidden>·</span>
        <span>Rich text</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleFocusMode}
          aria-pressed={isFocusMode}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-border/50 hover:text-foreground",
            isFocusMode && "bg-primary/15 text-primary"
          )}
        >
          {isFocusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          Focus mode
        </button>

        <button
          type="button"
          onClick={onShowHelp}
          aria-label="Keyboard shortcuts help"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-border/50 hover:text-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Help
        </button>
      </div>
    </div>
  );
}
