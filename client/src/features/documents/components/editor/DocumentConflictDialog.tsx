import { AlertTriangle } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocumentConflictDialogProps {
  open: boolean;
  isReloading: boolean;
  errorMessage?: string | null;
  onReloadLatest: () => void;
  onDownloadDraft: () => void;
  onCancel: () => void;
}

export function DocumentConflictDialog({
  open,
  isReloading,
  errorMessage,
  onReloadLatest,
  onDownloadDraft,
  onCancel,
}: DocumentConflictDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="This document was updated by someone else"
      disableOutsideClose
    >
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/15">
          <AlertTriangle className="h-4.5 w-4.5 text-danger" />
        </div>
        <p className="text-body">
          A newer server revision is available. Your local changes are still in
          this browser. Download your draft first when you need a copy, then
          reload the latest revision before continuing.
        </p>
      </div>

      {errorMessage && (
        <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {errorMessage}
        </p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isReloading}
        >
          Keep my draft
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onDownloadDraft}
          disabled={isReloading}
        >
          Download my draft
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={onReloadLatest}
          disabled={isReloading}
        >
          {isReloading ? "Reloading…" : "Discard draft and reload latest"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
