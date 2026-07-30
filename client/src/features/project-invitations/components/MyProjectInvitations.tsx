import { Check, FolderKanban, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import {
  useAcceptProjectInvitationMutation,
  useRejectProjectInvitationMutation,
} from "../hooks/useProjectInvitationMutations";
import { useMyProjectInvitationsQuery } from "../hooks/useProjectInvitationQueries";
import type { ProjectInvitation } from "../types/projectInvitation.types";

function ProjectInvitationSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function MyProjectInvitations() {
  const invitationsQuery = useMyProjectInvitationsQuery();
  const acceptMutation = useAcceptProjectInvitationMutation();
  const rejectMutation = useRejectProjectInvitationMutation();
  const invitations = invitationsQuery.data ?? [];

  function accept(invitation: ProjectInvitation) {
    acceptMutation.mutate(invitation, {
      onSuccess: () =>
        toast.success(`You joined ${invitation.projectName ?? "the project"}.`),
      onError: (error) =>
        toast.error(error.message ?? "Unable to accept project invitation."),
    });
  }

  function reject(invitation: ProjectInvitation) {
    rejectMutation.mutate(invitation, {
      onSuccess: () => toast.success("Project invitation declined."),
      onError: (error) =>
        toast.error(error.message ?? "Unable to decline project invitation."),
    });
  }

  return (
    <section
      id="project-invitations"
      aria-labelledby="project-invitations-heading"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FolderKanban className="h-4 w-4 text-primary" />
        <h2
          id="project-invitations-heading"
          className="text-h3 text-foreground"
        >
          Project invitations
        </h2>
        {invitations.length > 0 && (
          <Badge variant="primary">{invitations.length}</Badge>
        )}
      </div>

      {invitationsQuery.isLoading && (
        <div className="space-y-2">
          <ProjectInvitationSkeleton />
          <ProjectInvitationSkeleton />
        </div>
      )}

      {invitationsQuery.isError && (
        <DashboardSectionError
          message={
            invitationsQuery.error?.message ??
            "Unable to load project invitations."
          }
          onRetry={() => invitationsQuery.refetch()}
        />
      )}

      {!invitationsQuery.isLoading &&
        !invitationsQuery.isError &&
        invitations.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 px-4 py-6 text-center">
            <p className="text-body">
              No pending project invitations right now.
            </p>
          </div>
        )}

      {!invitationsQuery.isLoading &&
        !invitationsQuery.isError &&
        invitations.length > 0 && (
          <div className="space-y-2">
            {invitations.map((invitation) => {
              const accepting =
                acceptMutation.isPending &&
                acceptMutation.variables?._id === invitation._id;
              const rejecting =
                rejectMutation.isPending &&
                rejectMutation.variables?._id === invitation._id;
              const busy = accepting || rejecting;

              return (
                <div
                  key={invitation._id}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-h3 text-foreground">
                      {invitation.projectName ?? "Project invitation"}
                    </p>
                    <p className="mt-0.5 truncate text-caption">
                      {invitation.workspaceName ?? "Workspace"}
                      {invitation.invitedByName
                        ? ` · Invited by ${invitation.invitedByName}`
                        : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-caption">
                      <Badge variant="neutral">{invitation.role}</Badge>
                      <span>
                        Expires {formatRelativeTime(invitation.expiresAt)}
                      </span>
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => reject(invitation)}
                      disabled={busy}
                      className="w-full sm:w-auto"
                    >
                      <X className="h-3.5 w-3.5" />
                      {rejecting ? "Declining..." : "Decline"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => accept(invitation)}
                      disabled={busy}
                      className="w-full sm:w-auto"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {accepting ? "Accepting..." : "Accept"}
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
