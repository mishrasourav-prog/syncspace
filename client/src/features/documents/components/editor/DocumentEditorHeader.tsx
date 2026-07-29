import { useState } from "react";
import { ChevronDown, Eye, FileText, Maximize2, Minimize2, Pencil, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDateTime, formatRelativeTime } from "@/lib/date";
import type { ProjectDocument } from "../../types/document.types";

export type DocumentSaveState = "saved" | "unsaved" | "saving" | "error" | "conflict" | "read-only";

const SAVE_STATE_LABEL: Record<DocumentSaveState, string> = {
  saved: "Saved",
  unsaved: "Unsaved changes",
  saving: "Saving…",
  error: "Save failed",
  conflict: "Newer revision available",
  "read-only": "Read-only",
};

const SAVE_STATE_TONE: Record<DocumentSaveState, string> = {
  saved: "text-success",
  unsaved: "text-warning",
  saving: "text-muted",
  error: "text-danger",
  conflict: "text-danger",
  "read-only": "text-muted",
};

interface DocumentEditorHeaderProps {
  document: ProjectDocument;
  draftTitle: string;
  onTitleChange: (title: string) => void;
  canEditTitle: boolean;
  mode: "editing" | "preview";
  onModeChange: (mode: "editing" | "preview") => void;
  saveState: DocumentSaveState;
  showSaveControls: boolean;
  canSave: boolean;
  isSaving: boolean;
  onSave: () => void;
  onSaveAndReturn: () => void;
  onShowMembers: () => void;
  canArchive: boolean;
  canRestore: boolean;
  canDuplicate: boolean;
  isDuplicating: boolean;
  canDownloadHtml: boolean;
  canDownloadPdf: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onDuplicate: () => void;
  onDownloadHtml: () => void;
  onDownloadPdf: () => void;
  onDownloadJson: () => void;
  onCopyId: () => void;
  onBackToDocuments: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function DocumentEditorHeader({
  document,
  draftTitle,
  onTitleChange,
  canEditTitle,
  mode,
  onModeChange,
  saveState,
  showSaveControls,
  canSave,
  isSaving,
  onSave,
  onSaveAndReturn,
  onShowMembers,
  canArchive,
  canRestore,
  canDuplicate,
  isDuplicating,
  canDownloadHtml,
  canDownloadPdf,
  onArchive,
  onRestore,
  onDuplicate,
  onDownloadHtml,
  onDownloadPdf,
  onDownloadJson,
  onCopyId,
  onBackToDocuments,
  isFullscreen,
  onToggleFullscreen,
}: DocumentEditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <header className="min-w-0 rounded-xl border border-border bg-surface/60 p-3 shadow-soft sm:p-5">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileText className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            {canEditTitle && isEditingTitle ? (
              <Input
                autoFocus
                value={draftTitle}
                maxLength={200}
                aria-label="Document title"
                onChange={(event) => onTitleChange(event.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "Escape") {
                    event.currentTarget.blur();
                  }
                }}
                className="text-h2 h-auto border-transparent bg-transparent px-0 py-0 font-semibold focus:border-transparent"
              />
            ) : (
              <button
                type="button"
                disabled={!canEditTitle}
                onClick={() => setIsEditingTitle(true)}
                className="group flex max-w-full items-center gap-1.5 text-left disabled:cursor-default"
              >
                <h1 className="text-h1 truncate text-foreground">{draftTitle || "Untitled document"}</h1>
                {canEditTitle && (
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </button>
            )}

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
              <Badge variant={document.isArchived ? "neutral" : "success"}>
                {document.isArchived ? "Archived" : "Active"}
              </Badge>
              <span>rev {document.revision}</span>
              <span aria-hidden>·</span>
              <span title={formatDateTime(document.updatedAt)}>Updated {formatRelativeTime(document.updatedAt)}</span>
              <span aria-hidden>·</span>
              <span aria-live="polite" className={SAVE_STATE_TONE[saveState]}>
                {SAVE_STATE_LABEL[saveState]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 w-full items-center gap-2 overflow-x-auto pb-1 lg:w-auto lg:shrink-0">
          <div className="flex items-center rounded-md border border-border bg-background/40 p-0.5">
            <button
              type="button"
              aria-pressed={mode === "editing"}
              onClick={() => onModeChange("editing")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                mode === "editing" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Editing</span>
            </button>
            <button
              type="button"
              aria-pressed={mode === "preview"}
              onClick={() => onModeChange("preview")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                mode === "preview" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button type="button" variant="secondary" size="sm" onClick={onShowMembers}>
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Project members</span>
          </Button>

          {canArchive && (
            <Button type="button" variant="secondary" size="sm" onClick={onArchive}>
              Archive
            </Button>
          )}

          {canRestore && (
            <Button type="button" size="sm" onClick={onRestore}>
              Restore
            </Button>
          )}

          {showSaveControls && (
            <div className="flex items-center">
              <Button type="button" size="sm" onClick={onSave} disabled={!canSave || isSaving} className="rounded-r-none">
                {isSaving ? "Saving…" : "Save"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="More save options"
                  className="!h-8 !w-7 rounded-l-none border-l border-primary-foreground/20 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onSaveAndReturn} disabled={isSaving}>
                    {canSave ? "Save and return to Documents" : "Return to Documents"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Document actions">
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate} disabled={!canDuplicate || isDuplicating}>
                {isDuplicating ? "Duplicating…" : "Duplicate document"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadPdf} disabled={!canDownloadPdf}>
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadHtml} disabled={!canDownloadHtml}>
                Download HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadJson}>Download JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyId}>Copy document ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBackToDocuments}>Back to Documents</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
