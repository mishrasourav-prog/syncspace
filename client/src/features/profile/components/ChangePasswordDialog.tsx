import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";

import { useChangePasswordMutation } from "../hooks/useProfileMutations";
import {
  type ChangePasswordFormValues,
  changePasswordFormSchema,
} from "../schemas/profile.schemas";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  canChangePassword: boolean;
}

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
  label: string;
}

function PasswordToggle({ visible, onToggle, label }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {visible ? (
        <EyeOff className="h-4 w-4" aria-hidden />
      ) : (
        <Eye className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

export function ChangePasswordDialog({
  open,
  onClose,
  canChangePassword,
}: ChangePasswordDialogProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function handleClose() {
    if (changePasswordMutation.isPending) {
      return;
    }

    reset();
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    changePasswordMutation.reset();
    onClose();
  }

  function onSubmit(values: ChangePasswordFormValues) {
    if (changePasswordMutation.isPending) {
      return;
    }

    changePasswordMutation.reset();
    changePasswordMutation.mutate(values, {
      onError: (error) => {
        if (error.status === 401) {
          setValue("currentPassword", "", {
            shouldDirty: true,
            shouldValidate: false,
          });
          setFocus("currentPassword");
        }
      },
    });
  }

  if (!canChangePassword) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        title="Password managed by provider"
        description="This account does not use a local SyncSpace password."
      >
        <div className="flex gap-3 rounded-lg border border-border bg-background/40 p-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
          <p className="text-body">
            Your password is managed by your authentication provider. Update it from your provider account.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Change Password"
      description="Changing your password signs you out of every device."
      disableOutsideClose
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Current Password" htmlFor="change-password-current">
          <Input
            id="change-password-current"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            {...register("currentPassword")}
            error={errors.currentPassword?.message}
            rightSlot={
              <PasswordToggle
                visible={showCurrent}
                onToggle={() => setShowCurrent((value) => !value)}
                label={showCurrent ? "Hide current password" : "Show current password"}
              />
            }
          />
        </FormField>

        <FormField label="New Password" htmlFor="change-password-new">
          <Input
            id="change-password-new"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            {...register("newPassword")}
            error={errors.newPassword?.message}
            rightSlot={
              <PasswordToggle
                visible={showNew}
                onToggle={() => setShowNew((value) => !value)}
                label={showNew ? "Hide new password" : "Show new password"}
              />
            }
          />
        </FormField>

        <FormField label="Confirm New Password" htmlFor="change-password-confirm">
          <Input
            id="change-password-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            rightSlot={
              <PasswordToggle
                visible={showConfirm}
                onToggle={() => setShowConfirm((value) => !value)}
                label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
              />
            }
          />
        </FormField>

        <div className="rounded-lg border border-border bg-background/35 px-3 py-2.5">
          <p className="text-xs font-medium text-foreground">Password requirements</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            8–128 characters with uppercase, lowercase, a number, and one of @ $ ! % * ? &amp;.
          </p>
        </div>

        {changePasswordMutation.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
          >
            {changePasswordMutation.error.message || "Unable to change the password."}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={changePasswordMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? "Changing…" : "Change Password"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
