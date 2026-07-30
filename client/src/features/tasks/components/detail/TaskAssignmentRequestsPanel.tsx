import { HandHelping, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";
import { formatRelativeTime } from "@/lib/date";
import {
  useAcceptTaskAssignmentRequestMutation,
  useCreateTaskAssignmentRequestMutation,
} from "../../hooks/useTaskAssignmentRequestMutations";
import { useTaskAssignmentRequestsQuery } from "../../hooks/useTaskAssignmentRequestQueries";
import type { Task } from "../../types/task.types";

interface TaskAssignmentRequestsPanelProps {
  projectId: string;
  task: Task;
  role: ProjectRole | undefined;
  currentUserId: string | undefined;
  canMutate: boolean;
}

export function TaskAssignmentRequestsPanel({
  projectId,
  task,
  role,
  currentUserId,
  canMutate,
}: TaskAssignmentRequestsPanelProps) {
  const requestsQuery = useTaskAssignmentRequestsQuery(projectId, task._id);
  const createMutation = useCreateTaskAssignmentRequestMutation(
    projectId,
    task._id,
  );
  const acceptMutation = useAcceptTaskAssignmentRequestMutation(
    projectId,
    task._id,
  );

  const requests = requestsQuery.data ?? [];
  const pendingRequest = requests[0];
  const isAdmin = role === "admin";
  const isOwnRequest = pendingRequest?.requester._id === currentUserId;
  const itemLabel = task.type === "issue" ? "issue" : "task";

  if (requestsQuery.isLoading) {
    return <Skeleton className="h-20 w-full rounded-lg" />;
  }

  if (requestsQuery.isError) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Admin assignment requests could not be loaded.</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void requestsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    if (!pendingRequest) return null;

    return (
      <section className="rounded-lg border border-primary/25 bg-primary/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              src={pendingRequest.requester.avatar}
              name={pendingRequest.requester.name}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {pendingRequest.requester.name} requested admin assistance
              </p>
              <p className="text-xs text-muted">
                @{pendingRequest.requester.username} ·{" "}
                {formatRelativeTime(pendingRequest.requestedAt)}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() =>
              acceptMutation.mutate(pendingRequest._id, {
                onSuccess: () =>
                  toast.success(
                    `Request accepted. You are now assigned to this ${itemLabel}.`,
                  ),
                onError: (error) =>
                  toast.error(
                    error.message ?? "Unable to accept the assignment request.",
                  ),
              })
            }
            disabled={!canMutate || acceptMutation.isPending}
          >
            <ShieldCheck className="h-4 w-4" />
            {acceptMutation.isPending
              ? "Accepting…"
              : `Accept and take ${itemLabel}`}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-background/35 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HandHelping className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Need a project admin to take this {itemLabel}?
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {pendingRequest
                ? `${isOwnRequest ? "Your request" : `${pendingRequest.requester.name}'s request`} was sent to every project admin.`
                : "Send one shared request to all project admins. The first admin who accepts will be assigned automatically."}
            </p>
          </div>
        </div>

        {pendingRequest ? (
          <span className="shrink-0 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
            Waiting for an admin
          </span>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              createMutation.mutate(undefined, {
                onSuccess: () =>
                  toast.success("Request sent to all project admins."),
                onError: (error) =>
                  toast.error(
                    error.message ?? "Unable to send the assignment request.",
                  ),
              })
            }
            disabled={!canMutate || createMutation.isPending}
          >
            <HandHelping className="h-4 w-4" />
            {createMutation.isPending ? "Sending…" : "Request admin assignment"}
          </Button>
        )}
      </div>
    </section>
  );
}
