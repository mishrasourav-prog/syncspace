import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import { ImagePlus, RotateCcw, Trash2 } from "lucide-react";

import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import { Dialog, DialogFooter } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  useRemoveWorkspaceAvatarMutation,
  useReplaceWorkspaceAvatarMutation,
  useUpdateWorkspaceMutation,
} from "../hooks/useWorkspaceMutations";

import {
  editWorkspaceSchema,
  WORKSPACE_AVATAR_ACCEPT,
  workspaceAvatarFormSchema,
  type EditWorkspaceFormValues,
} from "../schemas/workspace.schemas";

import type {
  UpdateWorkspacePayload,
  WorkspaceSummary,
} from "../types/workspace.types";

interface EditWorkspaceDialogProps {
  workspace: WorkspaceSummary | null;
  onClose: () => void;
}

function getMutationMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (
      error as {
        message?: unknown;
      }
    ).message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export function EditWorkspaceDialog({
  workspace,
  onClose,
}: EditWorkspaceDialogProps) {
  const updateWorkspaceMutation = useUpdateWorkspaceMutation();

  const replaceAvatarMutation = useReplaceWorkspaceAvatarMutation();

  const removeAvatarMutation = useRemoveWorkspaceAvatarMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [avatarValidationError, setAvatarValidationError] = useState<
    string | null
  >(null);

  const [avatarRemovalRequested, setAvatarRemovalRequested] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wasOpenRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<EditWorkspaceFormValues>({
    resolver: zodResolver(editWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      timezone: "",
    },
  });

  const isOpen = Boolean(workspace);

  const isBusy =
    updateWorkspaceMutation.isPending ||
    replaceAvatarMutation.isPending ||
    removeAvatarMutation.isPending;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current && workspace) {
      reset({
        name: workspace.name,
        description: workspace.description ?? "",
        timezone: workspace.timezone,
      });

      setSelectedFile(null);

      setPreviewUrl(null);

      setAvatarValidationError(null);

      setAvatarRemovalRequested(false);

      updateWorkspaceMutation.reset();
      replaceAvatarMutation.reset();
      removeAvatarMutation.reset();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    wasOpenRef.current = isOpen;
  }, [
    isOpen,
    workspace,
    reset,
    updateWorkspaceMutation,
    replaceAvatarMutation,
    removeAvatarMutation,
  ]);

  function clearSelectedFileState() {
    setSelectedFile(null);

    setPreviewUrl(null);

    setAvatarValidationError(null);
  }

  function clearSelectedFile() {
    clearSelectedFileState();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    if (isBusy) {
      return;
    }

    clearSelectedFile();
    setAvatarRemovalRequested(false);

    onClose();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const result = workspaceAvatarFormSchema.safeParse({
      file,
    });

    if (!result.success) {
      clearSelectedFile();

      setAvatarValidationError(
        result.error.issues[0]?.message ??
          "Choose a valid workspace avatar image.",
      );

      return;
    }

    setSelectedFile(file);

    setPreviewUrl(URL.createObjectURL(file));

    setAvatarRemovalRequested(false);

    setAvatarValidationError(null);

    replaceAvatarMutation.reset();
    removeAvatarMutation.reset();
  }

  function requestAvatarRemoval() {
    clearSelectedFile();
    setAvatarRemovalRequested(true);
    removeAvatarMutation.reset();
  }

  const onSubmit = async (values: EditWorkspaceFormValues) => {
    if (!workspace || isBusy) {
      return;
    }

    const payload: UpdateWorkspacePayload = {};

    if (dirtyFields.name) {
      payload.name = values.name;
    }

    if (dirtyFields.description) {
      payload.description = values.description ?? "";
    }

    if (dirtyFields.timezone) {
      payload.timezone = values.timezone;
    }

    const hasWorkspaceDetailsChange = Object.keys(payload).length > 0;

    const hasAvatarChange = Boolean(selectedFile) || avatarRemovalRequested;

    if (!hasWorkspaceDetailsChange && !hasAvatarChange) {
      onClose();

      return;
    }

    updateWorkspaceMutation.reset();
    replaceAvatarMutation.reset();
    removeAvatarMutation.reset();

    let avatarWasUpdated = false;

    try {
      if (selectedFile) {
        await replaceAvatarMutation.mutateAsync({
          workspaceId: workspace._id,
          file: selectedFile,
        });

        avatarWasUpdated = true;

        clearSelectedFileState();
      } else if (avatarRemovalRequested) {
        await removeAvatarMutation.mutateAsync(workspace._id);

        avatarWasUpdated = true;

        setAvatarRemovalRequested(false);
      }

      if (hasWorkspaceDetailsChange) {
        await updateWorkspaceMutation.mutateAsync({
          workspaceId: workspace._id,
          payload,
        });
      }

      toast.success(
        avatarWasUpdated && hasWorkspaceDetailsChange
          ? "Workspace details and avatar updated successfully."
          : avatarWasUpdated
            ? "Workspace avatar updated successfully."
            : "Workspace updated successfully.",
      );

      clearSelectedFileState();
      setAvatarRemovalRequested(false);
      onClose();
    } catch {
      if (avatarWasUpdated && hasWorkspaceDetailsChange) {
        toast.warning(
          "The avatar was updated, but the workspace details could not be saved. Review the error and try again.",
        );
      }
    }
  };

  const avatarError = replaceAvatarMutation.error
    ? getMutationMessage(
        replaceAvatarMutation.error,
        "Unable to update the workspace avatar.",
      )
    : removeAvatarMutation.error
      ? getMutationMessage(
          removeAvatarMutation.error,
          "Unable to remove the workspace avatar.",
        )
      : null;

  const effectiveAvatar =
    previewUrl ?? (avatarRemovalRequested ? undefined : workspace?.avatar);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title="Edit workspace"
      description="Update workspace details and choose an avatar from your device."
      className="sm:max-w-xl"
    >
      {updateWorkspaceMutation.isError ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
        >
          {getMutationMessage(
            updateWorkspaceMutation.error,
            "Unable to update workspace details.",
          )}
        </div>
      ) : null}

      {avatarError ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
        >
          {avatarError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="edit-workspace-name">Name</Label>

          <Input
            id="edit-workspace-name"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="edit-workspace-description">
            Description <span className="text-muted/60">(optional)</span>
          </Label>

          <Textarea
            id="edit-workspace-description"
            rows={4}
            maxLength={500}
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="workspace-avatar-file">Workspace avatar</Label>

          <div className="mt-1.5 rounded-xl border border-border bg-background/35 p-3 sm:p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  src={effectiveAvatar}
                  name={workspace?.name ?? "Workspace"}
                  size="lg"
                  square
                  className="h-16 w-16 shrink-0 bg-gradient-to-br from-primary to-secondary text-white"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {avatarRemovalRequested
                      ? "Avatar will be removed"
                      : selectedFile
                        ? "New avatar selected"
                        : workspace?.avatar
                          ? "Current workspace avatar"
                          : "Workspace initials are currently used"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    JPEG, PNG, or WebP. Maximum size 5 MB. The image is cropped
                    to a square.
                  </p>

                  {selectedFile ? (
                    <p className="mt-1 truncate text-xs text-secondary">
                      {selectedFile.name}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <input
                  ref={fileInputRef}
                  id="workspace-avatar-file"
                  type="file"
                  accept={WORKSPACE_AVATAR_ACCEPT}
                  onChange={handleFileChange}
                  disabled={isBusy}
                  className="sr-only"
                />

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                  {selectedFile
                    ? "Choose another"
                    : workspace?.avatar
                      ? "Change image"
                      : "Choose image"}
                </Button>

                {selectedFile ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isBusy}
                    onClick={clearSelectedFile}
                  >
                    Cancel selection
                  </Button>
                ) : null}

                {!selectedFile && avatarRemovalRequested ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isBusy}
                    onClick={() => setAvatarRemovalRequested(false)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    Keep avatar
                  </Button>
                ) : null}

                {!selectedFile &&
                !avatarRemovalRequested &&
                workspace?.avatar ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="text-danger hover:text-danger"
                    disabled={isBusy}
                    onClick={requestAvatarRemoval}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>

            <p className="mt-3 text-xs text-muted">
              Avatar changes are applied when you select Save changes.
            </p>

            {avatarValidationError ? (
              <p role="alert" className="mt-2 text-xs text-danger">
                {avatarValidationError}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="edit-workspace-timezone">Timezone</Label>

          <Input
            id="edit-workspace-timezone"
            error={errors.timezone?.message}
            {...register("timezone")}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isBusy}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isBusy}>
            {isBusy ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
