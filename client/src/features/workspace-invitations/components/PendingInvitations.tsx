import { toast } from "sonner";
import { Check, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/date";
import { useMyInvitationsQuery } from "../hooks/useWorkspaceInvitationQueries";
import { useAcceptInvitationMutation, useRejectInvitationMutation } from "../hooks/useWorkspaceInvitationMutations";

export function PendingInvitations() {
  const invitationsQuery = useMyInvitationsQuery();
  const acceptMutation = useAcceptInvitationMutation();
  const rejectMutation = useRejectInvitationMutation();

  const invitations = invitationsQuery.data ?? [];

  if (invitationsQuery.isLoading || invitations.length === 0) {
    return null;
  }

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
    <section aria-labelledby="pending-invitations-heading">
      <div className="mb-3 flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <h2 id="pending-invitations-heading" className="text-h3 text-foreground">
          Pending invitations
        </h2>
        <Badge variant="primary">{invitations.length}</Badge>
      </div>

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
    </section>
  );
}
