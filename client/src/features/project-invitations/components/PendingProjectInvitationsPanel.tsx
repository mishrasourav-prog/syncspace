import {
    Mail,
    X,
} from "lucide-react";

import {
    toast,
} from "sonner";

import {
    Badge,
} from "@/components/ui/badge";

import {
    Button,
} from "@/components/ui/button";

import {
    Skeleton,
} from "@/components/ui/skeleton";

import {
    DashboardSectionError,
} from "@/features/workspaces/components/dashboard/DashboardSectionError";

import {
    formatRelativeTime,
} from "@/lib/date";

import {
    useCancelProjectInvitationMutation,
} from "../hooks/useProjectInvitationMutations";

import {
    useProjectInvitationsQuery,
} from "../hooks/useProjectInvitationQueries";

import type {
    ProjectInvitation,
} from "../types/projectInvitation.types";

function InvitationRowSkeleton() {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
            <div className="min-w-0 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
            </div>

            <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
        </div>
    );
}

interface PendingProjectInvitationsPanelProps {
    projectId:
        string;

    canView:
        boolean;

    canCancel:
        boolean;
}

export function PendingProjectInvitationsPanel({
    projectId,
    canView,
    canCancel,
}: PendingProjectInvitationsPanelProps) {
    const invitationsQuery =
        useProjectInvitationsQuery(
            projectId,
            canView
        );

    const cancelMutation =
        useCancelProjectInvitationMutation(
            projectId
        );

    if (
        !canView
    ) {
        return null;
    }

    const invitations =
        invitationsQuery.data ??
        [];

    function handleCancelInvitation(
        invitation:
            ProjectInvitation
    ): void {
        cancelMutation.mutate(
            invitation._id,
            {
                onSuccess:
                    () => {
                        toast.success(
                            `Invitation for ${invitation.email} was cancelled.`
                        );
                    },

                onError:
                    (
                        error
                    ) => {
                        toast.error(
                            error.message ||
                            "Unable to cancel the invitation."
                        );
                    },
            }
        );
    }

    return (
        <section
            id="invitations"
            aria-labelledby="pending-project-invitations-heading"
            className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
        >
            <div className="mb-3 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />

                <h2
                    id="pending-project-invitations-heading"
                    className="text-h3 text-foreground"
                >
                    Pending invitations
                </h2>

                {
                    invitations.length >
                        0 && (
                        <Badge variant="neutral">
                            {
                                invitations.length
                            }
                        </Badge>
                    )
                }
            </div>

            {
                invitationsQuery.isLoading && (
                    <div className="space-y-2">
                        <InvitationRowSkeleton />
                        <InvitationRowSkeleton />
                    </div>
                )
            }

            {
                invitationsQuery.isError && (
                    <DashboardSectionError
                        compact
                        message={
                            invitationsQuery
                                .error
                                ?.message ??
                            "Unable to load invitations."
                        }
                        onRetry={
                            () => {
                                void invitationsQuery
                                    .refetch();
                            }
                        }
                    />
                )
            }

            {
                !invitationsQuery
                    .isLoading &&
                    !invitationsQuery
                        .isError &&
                    invitations.length ===
                        0 && (
                    <p className="text-caption">
                        No pending invitations.
                    </p>
                )
            }

            {
                !invitationsQuery
                    .isLoading &&
                    !invitationsQuery
                        .isError &&
                    invitations.length >
                        0 && (
                    <div className="space-y-2">
                        {
                            invitations.map(
                                (
                                    invitation
                                ) => {
                                    const isCancelling =
                                        cancelMutation
                                            .isPending &&
                                        cancelMutation
                                            .variables ===
                                            invitation._id;

                                    return (
                                        <div
                                            key={
                                                invitation._id
                                            }
                                            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm text-foreground">
                                                    {
                                                        invitation.email
                                                    }
                                                </p>

                                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-caption">
                                                    <Badge variant="neutral">
                                                        {
                                                            invitation.role
                                                        }
                                                    </Badge>

                                                    <span>
                                                        Expires{" "}
                                                        {
                                                            formatRelativeTime(
                                                                invitation.expiresAt
                                                            )
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {
                                                canCancel && (
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        aria-label={
                                                            `Cancel invitation for ${invitation.email}`
                                                        }
                                                        disabled={
                                                            cancelMutation
                                                                .isPending
                                                        }
                                                        onClick={
                                                            () =>
                                                                handleCancelInvitation(
                                                                    invitation
                                                                )
                                                        }
                                                    >
                                                        <X className="h-3.5 w-3.5" />

                                                        {
                                                            isCancelling
                                                                ? "Cancelling…"
                                                                : "Cancel"
                                                        }
                                                    </Button>
                                                )
                                            }
                                        </div>
                                    );
                                }
                            )
                        }
                    </div>
                )
            }
        </section>
    );
}