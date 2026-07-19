// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import { Dialog, DialogFooter } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { createWorkspaceSchema, type CreateWorkspaceFormValues } from "../schemas/workspace.schemas";
// import { useCreateWorkspaceMutation } from "../hooks/useWorkspaceMutations";

// interface CreateWorkspaceDialogProps {
//   open: boolean;
//   onClose: () => void;
// }

// export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
//   const createWorkspaceMutation = useCreateWorkspaceMutation();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm<CreateWorkspaceFormValues>({
//     resolver: zodResolver(createWorkspaceSchema),
//     defaultValues: { name: "", description: "" },
//   });

//   const descriptionLength = watch("description")?.length ?? 0;

//   function handleClose() {
//     if (createWorkspaceMutation.isPending) return;
//     reset();
//     createWorkspaceMutation.reset();
//     onClose();
//   }

//   const onSubmit = (values: CreateWorkspaceFormValues) => {
//     const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

//     createWorkspaceMutation.mutate(
//       {
//         name: values.name,
//         description: values.description || undefined,
//         timezone,
//       },
//       {
//         onSuccess: () => {
//           toast.success("Workspace created successfully.");
//           reset();
//           onClose();
//         },
//       }
//     );
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       title="Create workspace"
//       description="Give your workspace a name to get started."
//     >
//       {createWorkspaceMutation.isError && (
//         <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
//           {createWorkspaceMutation.error?.message ?? "Unable to create workspace."}
//         </div>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)} noValidate>
//         <div className="mb-4">
//           <Label htmlFor="workspace-name">Name</Label>
//           <Input
//             id="workspace-name"
//             placeholder="Acme Product Team"
//             error={errors.name?.message}
//             {...register("name")}
//           />
//         </div>

//         <div>
//           <div className="mb-1.5 flex items-center justify-between">
//             <Label htmlFor="workspace-description" className="mb-0">
//               Description <span className="text-muted/60">(optional)</span>
//             </Label>
//             <span className="text-caption">{descriptionLength}/500</span>
//           </div>
//           <Textarea
//             id="workspace-description"
//             rows={3}
//             placeholder="What is this workspace for?"
//             error={errors.description?.message}
//             {...register("description")}
//           />
//         </div>

//         <DialogFooter>
//           <Button type="button" variant="secondary" onClick={handleClose} disabled={createWorkspaceMutation.isPending}>
//             Cancel
//           </Button>
//           <Button type="submit" disabled={createWorkspaceMutation.isPending}>
//             {createWorkspaceMutation.isPending ? "Creating..." : "Create workspace"}
//           </Button>
//         </DialogFooter>
//       </form>
//     </Dialog>
//   );
// }


import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createWorkspaceSchema, type CreateWorkspaceFormValues } from "../schemas/workspace.schemas";
import { useCreateWorkspaceMutation } from "../hooks/useWorkspaceMutations";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
  const createWorkspaceMutation = useCreateWorkspaceMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", description: "" },
  });

  const descriptionValue = useWatch({ control, name: "description" });
  const descriptionLength = descriptionValue?.length ?? 0;

  function handleClose() {
    if (createWorkspaceMutation.isPending) return;
    reset();
    createWorkspaceMutation.reset();
    onClose();
  }

  const onSubmit = (values: CreateWorkspaceFormValues) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

    createWorkspaceMutation.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        timezone,
      },
      {
        onSuccess: () => {
          toast.success("Workspace created successfully.");
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Create workspace"
      description="Give your workspace a name to get started."
    >
      {createWorkspaceMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {createWorkspaceMutation.error?.message ?? "Unable to create workspace."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <Label htmlFor="workspace-name">Name</Label>
          <Input
            id="workspace-name"
            placeholder="Acme Product Team"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="workspace-description" className="mb-0">
              Description <span className="text-muted/60">(optional)</span>
            </Label>
            <span className="text-caption">{descriptionLength}/500</span>
          </div>
          <Textarea
            id="workspace-description"
            rows={3}
            placeholder="What is this workspace for?"
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createWorkspaceMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createWorkspaceMutation.isPending}>
            {createWorkspaceMutation.isPending ? "Creating..." : "Create workspace"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
