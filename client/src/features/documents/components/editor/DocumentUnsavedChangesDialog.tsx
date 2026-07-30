import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocumentUnsavedChangesDialogProps {
  open: boolean;
  isSaving: boolean;
  canSave: boolean;
  errorMessage?: string | null;
  onStay: () => void;
  onDiscardAndLeave: () => void;
  onSaveAndLeave: () => void;
}

export function DocumentUnsavedChangesDialog({
  open,
  isSaving,
  canSave,
  errorMessage,
  onStay,
  onDiscardAndLeave,
  onSaveAndLeave,
}: DocumentUnsavedChangesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onStay}
      title="You have unsaved changes"
      disableOutsideClose={isSaving}
    >
      <p className="text-body">
        Leaving now will discard your unsaved edits unless you save first.
      </p>

      {!canSave && (
        <p className="mt-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          Saving is unavailable until the newer server revision is reloaded.
          Download your draft before discarding it if you need to preserve these
          edits.
        </p>
      )}

      {errorMessage && (
        <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {errorMessage}
        </p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onStay}
          disabled={isSaving}
        >
          Stay and continue editing
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={onDiscardAndLeave}
          disabled={isSaving}
        >
          Discard changes and leave
        </Button>
        <Button
          type="button"
          onClick={onSaveAndLeave}
          disabled={isSaving || !canSave}
        >
          {isSaving ? "Saving…" : "Save and leave"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
