import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  Calendar,
  Check,
  Clock,
  Copy,
  Fingerprint,
  ImagePlus,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateTime } from "@/lib/date";

import {
  useRemoveAvatarMutation,
  useReplaceAvatarMutation,
} from "../hooks/useProfileMutations";
import {
  avatarFormSchema,
  PROFILE_AVATAR_ACCEPT,
} from "../schemas/profile.schemas";
import type { SelfProfile } from "../types/profile.types";

const PROVIDER_LABEL: Record<SelfProfile["provider"], string> = {
  email: "Email & Password",
  google: "Google",
  facebook: "Facebook",
  twitter: "Twitter",
  github: "GitHub",
};

interface AccountInformationCardProps {
  profile: SelfProfile;
}

function getMutationMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export function AccountInformationCard({ profile }: AccountInformationCardProps) {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyResetTimerRef = useRef<number | null>(null);

  const replaceAvatarMutation = useReplaceAvatarMutation();
  const removeAvatarMutation = useRemoveAvatarMutation();
  const isAvatarBusy = replaceAvatarMutation.isPending || removeAvatarMutation.isPending;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  async function handleCopyUserId() {
    try {
      await navigator.clipboard.writeText(profile._id);
      setCopied(true);
      toast.success("User ID copied.");

      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }

      copyResetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyResetTimerRef.current = null;
      }, 1500);
    } catch {
      toast.error("Unable to copy user ID.");
    }
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    replaceAvatarMutation.reset();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const result = avatarFormSchema.safeParse({ file });

    if (!result.success) {
      clearSelectedFile();
      setValidationError(result.error.issues[0]?.message ?? "Choose a valid avatar image.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setValidationError(null);
    replaceAvatarMutation.reset();
    removeAvatarMutation.reset();
  }

  function handleUploadAvatar() {
    if (!selectedFile || isAvatarBusy) {
      return;
    }

    replaceAvatarMutation.mutate(
      { file: selectedFile },
      {
        onSuccess: () => {
          clearSelectedFile();
          toast.success("Avatar updated successfully.");
        },
      }
    );
  }

  function handleRemoveAvatar() {
    if (removeAvatarMutation.isPending) {
      return;
    }

    removeAvatarMutation.mutate(undefined, {
      onSuccess: () => {
        setRemoveDialogOpen(false);
        toast.success("Avatar removed successfully.");
      },
    });
  }

  const accountRows = [
    {
      label: "User ID",
      icon: Fingerprint,
      value: (
        <span className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate font-mono text-xs text-foreground">{profile._id}</span>
          <button
            type="button"
            onClick={handleCopyUserId}
            aria-label="Copy user ID"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        </span>
      ),
    },
    {
      label: "Authentication Provider",
      icon: ShieldCheck,
      value: PROVIDER_LABEL[profile.provider],
    },
    {
      label: "Created At",
      icon: Calendar,
      value: formatDateTime(profile.createdAt),
    },
    {
      label: "Last Updated",
      icon: Clock,
      value: formatDateTime(profile.updatedAt),
    },
    {
      label: "Last Login",
      icon: Clock,
      value: profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : "Not available yet",
    },
  ] as const;

  return (
    <section
      aria-labelledby="account-information-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6"
    >
      <h2 id="account-information-heading" className="text-h3 text-foreground">
        Account Information
      </h2>

      <dl className="mt-4 divide-y divide-border/60">
        {accountRows.map(({ label, icon: Icon, value }) => (
          <div
            key={label}
            className="grid gap-1.5 py-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:items-center sm:gap-4"
          >
            <dt className="flex items-center gap-2 text-caption">
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {label}
            </dt>
            <dd className="min-w-0 text-sm text-foreground sm:text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-border/60 pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              src={previewUrl ?? profile.avatar}
              name={profile.name}
              size="lg"
              className="h-14 w-14"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Avatar</h3>
              <p className="mt-0.5 text-caption">JPEG, PNG, or WebP. Maximum size 5 MB.</p>
              {selectedFile ? (
                <p className="mt-1 truncate text-xs text-secondary">Selected: {selectedFile.name}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={PROFILE_AVATAR_ACCEPT}
              onChange={handleFileChange}
              disabled={isAvatarBusy}
              className="sr-only"
            />

            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isAvatarBusy}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden />
              {selectedFile ? "Choose another" : profile.avatar ? "Change avatar" : "Add avatar"}
            </Button>

            {selectedFile ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={isAvatarBusy}
                  onClick={handleUploadAvatar}
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                  {replaceAvatarMutation.isPending ? "Uploading…" : "Upload"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isAvatarBusy}
                  onClick={clearSelectedFile}
                >
                  Cancel
                </Button>
              </>
            ) : null}

            {!selectedFile && profile.avatar ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="text-danger hover:text-danger"
                disabled={isAvatarBusy}
                onClick={() => setRemoveDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        {validationError ? (
          <p role="alert" className="mt-3 text-xs text-danger">
            {validationError}
          </p>
        ) : null}

        {replaceAvatarMutation.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
          >
            {getMutationMessage(replaceAvatarMutation.error, "Unable to update the avatar.")}
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={removeDialogOpen}
        onClose={() => {
          if (!removeAvatarMutation.isPending) {
            setRemoveDialogOpen(false);
            removeAvatarMutation.reset();
          }
        }}
        onConfirm={handleRemoveAvatar}
        title="Remove avatar?"
        description="Your profile will use your initials until you upload another image."
        confirmLabel="Remove avatar"
        isPending={removeAvatarMutation.isPending}
        errorMessage={
          removeAvatarMutation.error
            ? getMutationMessage(removeAvatarMutation.error, "Unable to remove the avatar.")
            : null
        }
      />
    </section>
  );
}
