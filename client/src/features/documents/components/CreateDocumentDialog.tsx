import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDocumentMutation } from "../hooks/useDocumentMutations";
import { createDocumentSchema, type CreateDocumentFormValues } from "../schemas/document.schemas";

interface CreateDocumentDialogProps {
  workspaceId: string;
  projectId: string;
  onClose: () => void;
}

export function CreateDocumentDialog({ workspaceId, projectId, onClose }: CreateDocumentDialogProps) {
  const navigate = useNavigate();
  const createDocumentMutation = useCreateDocumentMutation(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDocumentFormValues>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: { title: "" },
  });

  function handleClose(): void {
    if (createDocumentMutation.isPending) return;
    onClose();
  }

  function onSubmit(values: CreateDocumentFormValues): void {
    createDocumentMutation.mutate(
      { title: values.title },
      {
        onSuccess: (created) => {
          toast.success("Document created.");
          onClose();
          // Navigating straight into the editor avoids a pointless extra click,
          // and the document is guaranteed accessible since it was just created
          // by the current member of this project.
          navigate(`/workspaces/${workspaceId}/projects/${projectId}/documents/${created._id}`);
        },
        onError: (error) => {
          toast.error(error.message ?? "Unable to create this document.");
        },
      }
    );
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      title="New document"
      description="Start a blank document."
      disableOutsideClose={createDocumentMutation.isPending}
    >
      {createDocumentMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {createDocumentMutation.error?.message ?? "Unable to create this document."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="document-title">Title</Label>
          <Input
            id="document-title"
            autoFocus
            placeholder="Untitled document"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createDocumentMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createDocumentMutation.isPending}>
            {createDocumentMutation.isPending ? "Creating..." : "Create document"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
