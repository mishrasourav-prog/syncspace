import { AlertTriangle } from "lucide-react";
import { Dialog, DialogFooter } from "./dialog";
import { Button, type ButtonProps } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: ButtonProps["variant"];
  isPending?: boolean;
  errorMessage?: string | null;
  tone?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  isPending = false,
  errorMessage,
  tone = "danger",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} disableOutsideClose>
      <div className="flex gap-3">
        {tone === "danger" && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/15">
            <AlertTriangle className="h-4.5 w-4.5 text-danger" />
          </div>
        )}
        <p className="text-body">{description}</p>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {errorMessage}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={isPending}>
          {isPending ? "Please wait..." : confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
