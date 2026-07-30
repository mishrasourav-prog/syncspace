import { AlertCircle, FolderPlus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoWorkspacesEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <FolderPlus className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-h3 text-foreground">
        Create your first workspace
      </h3>
      <p className="mt-1.5 max-w-sm text-body">
        Workspaces organize your projects and teammates. Create one to get
        started.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        Create workspace
      </Button>
    </div>
  );
}

export function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <SearchX className="h-6 w-6 text-muted" />
      </div>
      <h3 className="mt-4 text-h3 text-foreground">No workspaces match</h3>
      <p className="mt-1.5 max-w-sm text-body">
        Try a different search term or clear the current filters.
      </p>
      <Button variant="secondary" className="mt-5" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

export function ArchivedEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center">
      <p className="text-body">No archived workspaces.</p>
    </div>
  );
}

export function WorkspaceErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-danger/30 bg-danger/5 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/15">
        <AlertCircle className="h-6 w-6 text-danger" />
      </div>
      <h3 className="mt-4 text-h3 text-foreground">
        Couldn&apos;t load workspaces
      </h3>
      <p className="mt-1.5 max-w-sm text-body">{message}</p>
      <Button variant="secondary" className="mt-5" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
