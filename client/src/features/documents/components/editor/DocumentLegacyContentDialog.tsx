import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocumentLegacyContentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmConvert: () => void;
}

export function DocumentLegacyContentDialog({
  open,
  onClose,
  onConfirmConvert,
}: DocumentLegacyContentDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Convert to a rich-text document?"
      disableOutsideClose
    >
      <p className="text-body">
        This document uses an unsupported legacy content format. Its existing
        content has not been modified. Converting it will replace that content
        with a blank rich-text document the next time you save — this cannot be
        undone.
      </p>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={onConfirmConvert}>
          Convert to a blank rich-text document
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
