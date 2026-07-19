// import { toast } from "sonner";
// import { Check, Mail, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { formatRelativeTime } from "@/lib/date";
// import { useMyInvitationsQuery } from "../hooks/useWorkspaceInvitationQueries";
// import { useAcceptInvitationMutation, useRejectInvitationMutation } from "../hooks/useWorkspaceInvitationMutations";

// export function PendingInvitations() {
//   const invitationsQuery = useMyInvitationsQuery();
//   const acceptMutation = useAcceptInvitationMutation();
//   const rejectMutation = useRejectInvitationMutation();

//   const invitations = invitationsQuery.data ?? [];

//   if (invitationsQuery.isLoading || invitations.length === 0) {
//     return null;
//   }

//   function handleAccept(invitationId: string) {
//     acceptMutation.mutate(invitationId, {
//       onSuccess: () => toast.success("Invitation accepted."),
//       onError: (error) => toast.error(error.message ?? "Unable to accept invitation."),
//     });
//   }

//   function handleReject(invitationId: string) {
//     rejectMutation.mutate(invitationId, {
//       onSuccess: () => toast.success("Invitation declined."),
//       onError: (error) => toast.error(error.message ?? "Unable to decline invitation."),
//     });
//   }

//   return (
//     <section aria-labelledby="pending-invitations-heading">
//       <div className="mb-3 flex items-center gap-2">
//         <Mail className="h-4 w-4 text-primary" />
//         <h2 id="pending-invitations-heading" className="text-h3 text-foreground">
//           Pending invitations
//         </h2>
//         <Badge variant="primary">{invitations.length}</Badge>
//       </div>

//       <div className="space-y-2">
//         {invitations.map((invitation) => {
//           const isAccepting = acceptMutation.isPending && acceptMutation.variables === invitation._id;
//           const isRejecting = rejectMutation.isPending && rejectMutation.variables === invitation._id;
//           const isBusy = isAccepting || isRejecting;

//           return (
//             <div
//               key={invitation._id}
//               className="flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between"
//             >
//               <div className="min-w-0">
//                 <p className="truncate text-h3 text-foreground">{invitation.workspaceName}</p>
//                 <div className="mt-1 flex flex-wrap items-center gap-2 text-caption">
//                   <Badge variant="neutral">{invitation.role}</Badge>
//                   <span>Expires {formatRelativeTime(invitation.expiresAt)}</span>
//                 </div>
//               </div>

//               <div className="flex shrink-0 gap-2">
//                 <Button
//                   size="sm"
//                   variant="secondary"
//                   onClick={() => handleReject(invitation._id)}
//                   disabled={isBusy}
//                 >
//                   <X className="h-3.5 w-3.5" />
//                   {isRejecting ? "Declining..." : "Decline"}
//                 </Button>
//                 <Button size="sm" onClick={() => handleAccept(invitation._id)} disabled={isBusy}>
//                   <Check className="h-3.5 w-3.5" />
//                   {isAccepting ? "Accepting..." : "Accept"}
//                 </Button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

// import { toast } from "sonner";
// import { Check, Mail, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatRelativeTime } from "@/lib/date";
// import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
// import { useMyInvitationsQuery } from "../hooks/useWorkspaceInvitationQueries";
// import { useAcceptInvitationMutation, useRejectInvitationMutation } from "../hooks/useWorkspaceInvitationMutations";

// function InvitationRowSkeleton() {
//   return (
//     <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
//       <div className="min-w-0 space-y-1.5">
//         <Skeleton className="h-4 w-40" />
//         <Skeleton className="h-3 w-28" />
//       </div>
//       <div className="flex shrink-0 gap-2">
//         <Skeleton className="h-8 w-20 rounded-md" />
//         <Skeleton className="h-8 w-20 rounded-md" />
//       </div>
//     </div>
//   );
// }

// export function PendingInvitations() {
//   const invitationsQuery = useMyInvitationsQuery();
//   const acceptMutation = useAcceptInvitationMutation();
//   const rejectMutation = useRejectInvitationMutation();

//   const invitations = invitationsQuery.data ?? [];

//   function handleAccept(invitationId: string) {
//     acceptMutation.mutate(invitationId, {
//       onSuccess: () => toast.success("Invitation accepted."),
//       onError: (error) => toast.error(error.message ?? "Unable to accept invitation."),
//     });
//   }

//   function handleReject(invitationId: string) {
//     rejectMutation.mutate(invitationId, {
//       onSuccess: () => toast.success("Invitation declined."),
//       onError: (error) => toast.error(error.message ?? "Unable to decline invitation."),
//     });
//   }

//   return (
//     <section id="invitations" aria-labelledby="pending-invitations-heading">
//       <div className="mb-3 flex items-center gap-2">
//         <Mail className="h-4 w-4 text-primary" />
//         <h2 id="pending-invitations-heading" className="text-h3 text-foreground">
//           Pending invitations
//         </h2>
//         {invitations.length > 0 && <Badge variant="primary">{invitations.length}</Badge>}
//       </div>

//       {invitationsQuery.isLoading && (
//         <div className="space-y-2">
//           <InvitationRowSkeleton />
//           <InvitationRowSkeleton />
//         </div>
//       )}

//       {invitationsQuery.isError && (
//         <DashboardSectionError
//           message={invitationsQuery.error?.message ?? "Unable to load invitations."}
//           onRetry={() => invitationsQuery.refetch()}
//         />
//       )}

//       {!invitationsQuery.isLoading && !invitationsQuery.isError && invitations.length === 0 && (
//         <div className="rounded-xl border border-dashed border-border bg-surface/40 px-4 py-6 text-center">
//           <p className="text-body">No pending invitations right now.</p>
//         </div>
//       )}

//       {!invitationsQuery.isLoading && !invitationsQuery.isError && invitations.length > 0 && (
//         <div className="space-y-2">
//           {invitations.map((invitation) => {
//             const isAccepting = acceptMutation.isPending && acceptMutation.variables === invitation._id;
//             const isRejecting = rejectMutation.isPending && rejectMutation.variables === invitation._id;
//             const isBusy = isAccepting || isRejecting;

//             return (
//               <div
//                 key={invitation._id}
//                 className="flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between"
//               >
//                 <div className="min-w-0">
//                   <p className="truncate text-h3 text-foreground">{invitation.workspaceName}</p>
//                   <div className="mt-1 flex flex-wrap items-center gap-2 text-caption">
//                     <Badge variant="neutral">{invitation.role}</Badge>
//                     <span>Expires {formatRelativeTime(invitation.expiresAt)}</span>
//                   </div>
//                 </div>

//                 <div className="flex shrink-0 gap-2">
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     onClick={() => handleReject(invitation._id)}
//                     disabled={isBusy}
//                   >
//                     <X className="h-3.5 w-3.5" />
//                     {isRejecting ? "Declining..." : "Decline"}
//                   </Button>
//                   <Button size="sm" onClick={() => handleAccept(invitation._id)} disabled={isBusy}>
//                     <Check className="h-3.5 w-3.5" />
//                     {isAccepting ? "Accepting..." : "Accept"}
//                   </Button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </section>
//   );
// }


import { toast } from "sonner";
import { Check, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { useMyInvitationsQuery } from "../hooks/useWorkspaceInvitationQueries";
import { useAcceptInvitationMutation, useRejectInvitationMutation } from "../hooks/useWorkspaceInvitationMutations";

function InvitationRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="flex shrink-0 gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function PendingInvitations() {
  const invitationsQuery = useMyInvitationsQuery();
  const acceptMutation = useAcceptInvitationMutation();
  const rejectMutation = useRejectInvitationMutation();

  const invitations = invitationsQuery.data ?? [];

  function handleAccept(invitationId: string) {
    acceptMutation.mutate(invitationId, {
      onSuccess: () => toast.success("Invitation accepted."),
      onError: (error) => toast.error(error.message ?? "Unable to accept invitation."),
    });
  }

  function handleReject(invitationId: string) {
    rejectMutation.mutate(invitationId, {
      onSuccess: () => toast.success("Invitation declined."),
      onError: (error) => toast.error(error.message ?? "Unable to decline invitation."),
    });
  }

  return (
    <section id="invitations" aria-labelledby="pending-invitations-heading">
      <div className="mb-3 flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <h2 id="pending-invitations-heading" className="text-h3 text-foreground">
          Pending invitations
        </h2>
        {invitations.length > 0 && <Badge variant="primary">{invitations.length}</Badge>}
      </div>

      {invitationsQuery.isLoading && (
        <div className="space-y-2">
          <InvitationRowSkeleton />
          <InvitationRowSkeleton />
        </div>
      )}

      {invitationsQuery.isError && (
        <DashboardSectionError
          message={invitationsQuery.error?.message ?? "Unable to load invitations."}
          onRetry={() => invitationsQuery.refetch()}
        />
      )}

      {!invitationsQuery.isLoading && !invitationsQuery.isError && invitations.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface/40 px-4 py-6 text-center">
          <p className="text-body">No pending invitations right now.</p>
        </div>
      )}

      {!invitationsQuery.isLoading && !invitationsQuery.isError && invitations.length > 0 && (
        <div className="space-y-2">
          {invitations.map((invitation) => {
            const isAccepting = acceptMutation.isPending && acceptMutation.variables === invitation._id;
            const isRejecting = rejectMutation.isPending && rejectMutation.variables === invitation._id;
            const isBusy = isAccepting || isRejecting;

            return (
              <div
                key={invitation._id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-h3 text-foreground">{invitation.workspaceName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-caption">
                    <Badge variant="neutral">{invitation.role}</Badge>
                    <span>Expires {formatRelativeTime(invitation.expiresAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReject(invitation._id)}
                    disabled={isBusy}
                  >
                    <X className="h-3.5 w-3.5" />
                    {isRejecting ? "Declining..." : "Decline"}
                  </Button>
                  <Button size="sm" onClick={() => handleAccept(invitation._id)} disabled={isBusy}>
                    <Check className="h-3.5 w-3.5" />
                    {isAccepting ? "Accepting..." : "Accept"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
