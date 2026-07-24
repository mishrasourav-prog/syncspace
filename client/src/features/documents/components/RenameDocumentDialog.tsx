import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  useRenameDocumentMutation,
} from "../hooks/useDocumentMutations";

import {
  renameDocumentSchema,
  type RenameDocumentFormValues,
} from "../schemas/document.schemas";

import type {
  ProjectDocument,
} from "../types/document.types";

interface RenameDocumentDialogProps {
  projectId: string;
  document: ProjectDocument;
  onClose: () => void;
}

export function RenameDocumentDialog({
  projectId,
  document,
  onClose,
}: RenameDocumentDialogProps) {
  const renameDocumentMutation =
    useRenameDocumentMutation(
      projectId
    );

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
    },
  } =
    useForm<RenameDocumentFormValues>({
      resolver:
        zodResolver(
          renameDocumentSchema
        ),
      defaultValues: {
        title:
          document.title,
      },
    });

  const currentTitle =
    watch(
      "title"
    );

  const isUnchanged =
    currentTitle.trim() ===
    document.title;

  function handleClose(): void {
    if (
      renameDocumentMutation.isPending
    ) {
      return;
    }

    onClose();
  }

  function onSubmit(
    values: RenameDocumentFormValues
  ): void {
    if (
      values.title ===
      document.title
    ) {
      return;
    }

    renameDocumentMutation.mutate(
      {
        documentId:
          document._id,
        payload: {
          title:
            values.title,
          expectedRevision:
            document.revision,
        },
      },
      {
        onSuccess:
          () => {
            toast.success(
              "Document renamed."
            );

            onClose();
          },

        onError:
          (
            error
          ) => {
            toast.error(
              error.message ??
                "Unable to rename this document."
            );

            if (
              error.status ===
              409
            ) {
              onClose();
            }
          },
      }
    );
  }

  return (
    <Dialog
      open
      onClose={
        handleClose
      }
      title="Rename document"
      description={
        `Renaming "${document.title}".`
      }
      disableOutsideClose={
        renameDocumentMutation.isPending
      }
    >
      {
        renameDocumentMutation.isError &&
          renameDocumentMutation.error
            ?.status !==
            409 && (
            <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {
                renameDocumentMutation.error
                  ?.message ??
                "Unable to rename this document."
              }
            </div>
          )
      }

      <form
        onSubmit={
          handleSubmit(
            onSubmit
          )
        }
        noValidate
      >
        <div className="mb-4">
          <Label htmlFor="document-rename-title">
            Title
          </Label>

          <Input
            id="document-rename-title"
            autoFocus
            error={
              errors.title
                ?.message
            }
            {...register(
              "title"
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={
              handleClose
            }
            disabled={
              renameDocumentMutation.isPending
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              renameDocumentMutation.isPending ||
              isUnchanged
            }
          >
            {
              renameDocumentMutation.isPending
                ? "Saving..."
                : "Save"
            }
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
